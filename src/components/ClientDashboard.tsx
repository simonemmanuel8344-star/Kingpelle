import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ChatSession } from '../types';
import { MessageSquare, Clock, ArrowRight, UserCheck } from 'lucide-react';
import { Chat } from './Chat';

export function ClientDashboard() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as ChatSession));
      // In-memory sort by updatedAt descending to prevent Firestore index requirements
      chatsData.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      setChats(chatsData);
      setLoading(false);
    }, (error) => {
      console.error("Error loading chats:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (activeChat) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Chat 
          chatId={activeChat.id} 
          professionalId={activeChat.professionalId}
          professionalName={activeChat.professionalName} 
          professionalPicture={activeChat.professionalPicture}
          onBack={() => setActiveChat(null)} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Client Dashboard</h2>
            <p className="text-sm sm:text-base text-gray-400">
              Welcome back, <span className="text-amber-400 font-semibold">{currentUser?.displayName || currentUser?.email}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-[#0A192F] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5 text-amber-400" />
                Active Conversations
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-white/10 text-amber-400 rounded-full">
                {chats.length} {chats.length === 1 ? 'chat' : 'chats'}
              </span>
            </div>
            
            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="p-12 text-center text-gray-400">
                  <div className="inline-block w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-sm">Loading conversations...</p>
                </div>
              ) : chats.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <MessageSquare className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                  <p className="font-medium text-white mb-1">No conversations started yet</p>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto mb-4">
                    Explore our vetted professionals and click "Chat" to begin a discussion about your project.
                  </p>
                </div>
              ) : (
                chats.map(chat => (
                  <div 
                    key={chat.id} 
                    onClick={() => setActiveChat(chat)}
                    className="p-4 sm:p-6 hover:bg-white/5 cursor-pointer transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-white/10 shrink-0 overflow-hidden border border-white/10 flex items-center justify-center">
                        {chat.professionalPicture ? (
                          <img src={chat.professionalPicture} alt={chat.professionalName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-amber-400 font-bold text-lg">
                            {chat.professionalName?.charAt(0) || 'P'}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                            {chat.professionalName}
                          </h4>
                          <span className="text-[10px] text-gray-400 shrink-0 hidden sm:inline">
                            {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 truncate max-w-md">
                          {chat.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-amber-400 mb-2">How It Works</h3>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Connect directly with verified professionals across technology, creative design, and engineering. Chat history is synchronized in real-time.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Clock className="w-4 h-4" />
              <span>Real-time instant synchronization</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
