import { useState, useEffect, useRef, FormEvent } from 'react';
import { supabase, getStoredUser, getActiveUser, saveChatMessage, saveChatSession, fetchChatMessages } from '../lib/supabase';
import { Send, ArrowLeft, MessageSquare, CheckCheck, User, ShieldCheck } from 'lucide-react';
import { ChatMessage, ChatSession } from '../types';
import { useToast } from '../contexts/ToastContext';

interface ChatProps {
  professionalId?: string;
  professionalName?: string;
  professionalPicture?: string;
  chatId?: string;
  currentUser?: any;
  onBack: () => void;
}

export function Chat({ professionalId, professionalName, professionalPicture, chatId, currentUser: propUser, onBack }: ChatProps) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(chatId || null);
  const [chatMeta, setChatMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [currentUser, setCurrentUser] = useState<any>(() => propUser || getStoredUser());

  useEffect(() => {
    if (propUser) {
      setCurrentUser(propUser);
      return;
    }
    getActiveUser().then(user => {
      if (user) setCurrentUser(user);
    });

    const handleAuthChange = (e: any) => {
      if (e.detail) setCurrentUser(e.detail);
    };
    window.addEventListener('idea_hub_auth_changed', handleAuthChange);
    return () => window.removeEventListener('idea_hub_auth_changed', handleAuthChange);
  }, [propUser]);

  const activeUser = currentUser || propUser || getStoredUser();
  const currentUserId = activeUser?.id || 'guest_user';
  const effectiveChatId = activeChatId || (professionalId ? `${currentUserId}_${professionalId}` : null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!effectiveChatId) {
      setLoading(false);
      return;
    }
    if (!activeChatId && effectiveChatId) {
      setActiveChatId(effectiveChatId);
    }

    let isMounted = true;

    // 1. Fetch messages with multi-layer cache
    const loadData = async () => {
      try {
        const msgs = await fetchChatMessages(effectiveChatId);
        if (isMounted) {
          setMessages(msgs);
          setLoading(false);
          setTimeout(scrollToBottom, 50);
        }
      } catch (err) {
        console.warn('Chat data loading warning:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    // 2. Real-time event listener for newly sent messages
    const handleIncomingMessage = (e: any) => {
      if (!isMounted || !e.detail) return;
      const incoming: ChatMessage = e.detail;
      if (incoming.chatId === effectiveChatId) {
        setMessages(prev => {
          if (prev.some(m => m.id === incoming.id)) return prev;
          const next = [...prev, incoming];
          setTimeout(scrollToBottom, 50);
          return next;
        });
      }
    };

    // 3. Storage event listener (syncs across multiple open tabs)
    const handleStorage = (e: StorageEvent) => {
      if (!isMounted) return;
      if (e.key === `idea_hub_chat_msgs_${effectiveChatId}`) {
        loadData();
      }
    };

    window.addEventListener('idea_hub_chat_message_sent', handleIncomingMessage);
    window.addEventListener('storage', handleStorage);

    // 4. Polling fallback every 2.5 seconds
    const interval = setInterval(loadData, 2500);

    // 5. Supabase realtime subscription
    let channel: any = null;
    try {
      channel = supabase.channel(`public:chat_messages:${effectiveChatId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${effectiveChatId}` }, payload => {
          const m = payload.new;
          const newMsg: ChatMessage = {
            id: m.id,
            chatId: m.chat_id,
            senderId: m.sender_id,
            senderName: m.sender_name,
            text: m.text,
            timestamp: m.created_at || new Date().toISOString()
          };
          if (isMounted) {
            setMessages(prev => {
              if (prev.some(x => x.id === newMsg.id)) return prev;
              const updated = [...prev, newMsg];
              setTimeout(scrollToBottom, 50);
              return updated;
            });
          }
        }).subscribe();
    } catch {}

    return () => {
      isMounted = false;
      window.removeEventListener('idea_hub_chat_message_sent', handleIncomingMessage);
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
      if (channel) supabase.removeChannel(channel);
    };
  }, [effectiveChatId, activeChatId]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const user = activeUser;
    if (!newMessage.trim() || !effectiveChatId) return;

    if (!user) {
      showToast('Please sign in to send messages', 'error');
      return;
    }

    setSending(true);
    const textToSend = newMessage.trim();
    const now = new Date().toISOString();
    const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const senderName = user.user_metadata?.full_name || user.fullName || user.email?.split('@')[0] || 'User';

    const localMessage: ChatMessage = {
      id: msgId,
      chatId: effectiveChatId,
      senderId: user.id,
      senderName,
      text: textToSend,
      timestamp: now
    };

    const targetProfId = professionalId || chatMeta?.professional_id || effectiveChatId.split('_')[1] || '';
    const isSenderProfessional = user.id === targetProfId;
    const currentClientId = isSenderProfessional ? (chatMeta?.client_id || effectiveChatId.split('_')[0]) : user.id;

    const sessionData: ChatSession = {
      id: effectiveChatId,
      clientId: currentClientId,
      clientName: isSenderProfessional ? (chatMeta?.client_name || 'Client') : senderName,
      professionalId: targetProfId,
      professionalName: professionalName || chatMeta?.professional_name || 'Verified Professional',
      professionalPicture: professionalPicture || chatMeta?.professional_picture || '',
      lastMessage: textToSend,
      updatedAt: now,
      participants: [currentClientId, targetProfId].filter(Boolean)
    };

    // Optimistically update UI
    setMessages(prev => {
      if (prev.some(m => m.id === localMessage.id)) return prev;
      return [...prev, localMessage];
    });
    setNewMessage('');
    setTimeout(scrollToBottom, 50);

    try {
      await Promise.all([
        saveChatMessage(localMessage),
        saveChatSession(sessionData)
      ]);
    } catch (error: any) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const displayName = professionalName || chatMeta?.professional_name || chatMeta?.client_name || 'Live Discussion';
  const displayPicture = professionalPicture || chatMeta?.professional_picture;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[520px] max-h-[780px] bg-white text-gray-900 border border-gray-200 rounded-3xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3.5">
          <button 
            onClick={onBack} 
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 hover:text-indigo-600 cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-11 h-11 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 shadow-xs">
            {displayPicture ? (
              <img src={displayPicture} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-indigo-600 font-bold text-lg">{displayName.charAt(0)}</span>
            )}
          </div>
          
          <div>
            <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-tight">{displayName}</h3>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Direct Messaging
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/50">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting to chat...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3 text-indigo-600 shadow-xs">
              <MessageSquare className="w-7 h-7" />
            </div>
            <p className="font-bold text-gray-900 text-base mb-1">Start chatting with {displayName}</p>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm">Discuss project requirements, budgets, milestones, and deliverables in real time.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = activeUser?.id === msg.senderId;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl shadow-xs ${
                    isMe 
                      ? 'bg-indigo-600 text-white font-medium rounded-br-xs' 
                      : 'bg-white text-gray-900 rounded-bl-xs border border-gray-200'
                  }`}
                >
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <p className={`text-[11px] font-bold ${msg.senderName === 'iDEA Admin' ? 'text-indigo-700 flex items-center gap-1' : 'text-indigo-600'}`}>
                        {msg.senderName === 'iDEA Admin' && <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />}
                        {msg.senderName}
                      </p>
                      {msg.senderName === 'iDEA Admin' && (
                        <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200 uppercase tracking-wider">
                          Official Admin
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 px-1 text-[11px] text-gray-400">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-gray-100 shrink-0 flex items-center gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={sending}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
        />
        <button 
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="bg-indigo-600 text-white p-3.5 rounded-2xl hover:bg-indigo-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold shrink-0 flex items-center justify-center shadow-md cursor-pointer"
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

