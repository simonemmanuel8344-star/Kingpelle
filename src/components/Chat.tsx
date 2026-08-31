import { useState, useEffect, useRef, FormEvent } from 'react';
import { collection, query, orderBy, onSnapshot, doc, setDoc, addDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ChatMessage } from '../types';
import { Send, ArrowLeft, MessageSquare, CheckCheck, User } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface ChatProps {
  chatId?: string;
  professionalId?: string;
  professionalName?: string;
  professionalPicture?: string;
  onBack: () => void;
}

export function Chat({ chatId, professionalId, professionalName, professionalPicture, onBack }: ChatProps) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(chatId || null);
  const [chatMeta, setChatMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = auth.currentUser;

  // Determine chat document ID: if not passed directly, construct deterministic ID
  const effectiveChatId = activeChatId || (currentUser && professionalId ? `${currentUser.uid}_${professionalId}` : null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!currentUser || !effectiveChatId) {
      setLoading(false);
      return;
    }

    if (!activeChatId && effectiveChatId) {
      setActiveChatId(effectiveChatId);
    }

    // Load parent chat meta
    getDoc(doc(db, 'chats', effectiveChatId)).then(snap => {
      if (snap.exists()) {
        setChatMeta(snap.data());
      }
    }).catch(console.error);

    // Real-time messages listener
    const msgsRef = collection(db, `chats/${effectiveChatId}/messages`);
    const qMsgs = query(msgsRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(qMsgs, (snapshot) => {
      const msgsData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as ChatMessage));
      setMessages(msgsData);
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }, (error) => {
      console.error("Error loading chat messages:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [effectiveChatId, activeChatId, currentUser]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !effectiveChatId) return;

    setSending(true);
    const textToSend = newMessage.trim();
    const now = new Date().toISOString();

    try {
      const chatRef = doc(db, 'chats', effectiveChatId);
      
      const targetProfId = professionalId || chatMeta?.professionalId || '';
      const isSenderProfessional = currentUser.uid === targetProfId;
      
      const currentClientId = isSenderProfessional ? (chatMeta?.clientId || effectiveChatId.split('_')[0]) : currentUser.uid;

      // Upsert parent chat session
      await setDoc(chatRef, {
        id: effectiveChatId,
        clientId: currentClientId,
        clientName: isSenderProfessional ? (chatMeta?.clientName || 'Client') : (currentUser.displayName || currentUser.email?.split('@')[0] || 'Client'),
        professionalId: targetProfId,
        professionalName: professionalName || chatMeta?.professionalName || 'Verified Professional',
        professionalPicture: professionalPicture || chatMeta?.professionalPicture || '',
        lastMessage: textToSend,
        updatedAt: now,
        participants: [currentClientId, targetProfId].filter(Boolean)
      }, { merge: true });

      // Add message to sub-collection
      await addDoc(collection(db, `chats/${effectiveChatId}/messages`), {
        chatId: effectiveChatId,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        text: textToSend,
        timestamp: now
      });

      setNewMessage('');
      setTimeout(scrollToBottom, 50);
    } catch (error: any) {
      console.error('Error sending message:', error);
      showToast(error.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const displayName = professionalName || chatMeta?.professionalName || chatMeta?.clientName || 'Live Discussion';
  const displayPicture = professionalPicture || chatMeta?.professionalPicture;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[520px] max-h-[780px] bg-[#0A192F] text-white border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white/5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3.5">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
            {displayPicture ? (
              <img src={displayPicture} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-amber-400 font-bold">{displayName.charAt(0)}</span>
            )}
          </div>
          
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white leading-tight">{displayName}</h3>
            <span className="inline-flex items-center gap-1.5 text-xs text-green-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Live Direct Messaging
            </span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0A192F]/60">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading conversation...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-amber-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="font-semibold text-white mb-1">Start chatting with {displayName}</p>
            <p className="text-xs sm:text-sm text-gray-400 max-w-sm">Discuss project requirements, budgets, milestones, and deliverables in real time.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = currentUser?.uid === msg.senderId;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl ${
                    isMe 
                      ? 'bg-amber-400 text-[#0A192F] font-medium rounded-br-none shadow-md' 
                      : 'bg-white/10 text-white rounded-bl-none border border-white/10'
                  }`}
                >
                  <p className="text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-gray-400">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-amber-400" />}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white/5 border-t border-white/10 shrink-0 flex items-center gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={sending}
          className="flex-1 bg-[#0A192F] border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
        />
        <button 
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="bg-amber-400 text-[#0A192F] p-3 rounded-xl hover:bg-amber-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shrink-0 flex items-center justify-center shadow-md"
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
