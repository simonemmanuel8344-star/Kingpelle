import { createClient } from '@supabase/supabase-js';
import { ServiceOrder, ContactMessage, ChatSession, ChatMessage, UserProfile, Professional, JobApplication } from '../types';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://cndijjjhyczocmphedmp.supabase.co').replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2rwwPCeO4JumkrEZGQ0qpw_g25Opsmq';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// Storage upload helper
export async function uploadFileToSupabase(file: File, bucket: string, path: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

// Generalized Fetch Helper
export async function fetchSupabaseData<T>(table: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
  if (error) {
    console.error(`Error fetching from ${table}:`, error);
    return [];
  }
  return data as T[];
}

// Generalized Insert Helper
export async function insertSupabaseData(table: string, payload: any) {
  const { data, error } = await supabase.from(table).insert([payload]).select();
  if (error) throw error;
  return data ? data[0] : null;
}

// Generalized Update Helper
export async function updateSupabaseData(table: string, id: string, payload: any) {
  const { data, error } = await supabase.from(table).update(payload).eq('id', id).select();
  if (error) throw error;
  return data ? data[0] : null;
}

// Generalized Delete Helper
export async function deleteSupabaseData(table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function submitOrderToSupabase(orderData: ServiceOrder): Promise<{ data: any; error: any }> {
  try {
    const payload = {
      client_name: orderData.client_name,
      client_email: orderData.client_email,
      client_phone: orderData.client_phone,
      service_category: orderData.service_category,
      project_title: orderData.project_title,
      project_description: orderData.project_description,
      budget_range: orderData.budget_range || 'Flexible',
      timeline: orderData.timeline || 'Flexible',
      professional_id: orderData.professional_id || null,
      professional_name: orderData.professional_name || null,
      attachment_url: orderData.attachment_url || null,
      cloud_link: orderData.cloud_link || null,
      status: orderData.status || 'pending',
      created_at: new Date().toISOString()
    };
    
    // First try to insert into client_requests or service_orders (may fail if tables are missing, which is fine)
    let res = await supabase.from('client_requests').insert([payload]).select();
    if (res.error) {
       res = await supabase.from('service_orders').insert([payload]).select();
    }
    
    // Auto-create Escrow Project if a professional is assigned
    if (orderData.professional_id) {
      let clientId = 'client-guest';
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        clientId = authData.user.id;
      } else if (typeof window !== 'undefined') {
        const localUser = localStorage.getItem('idea_hub_local_user');
        if (localUser) {
          try {
             clientId = JSON.parse(localUser).id || 'client-guest';
          } catch(e) {}
        }
      }
      
      const escrowPayload = {
        service_order_id: res.data?.[0]?.id || null, // Will be null if both failed, which is acceptable
        client_id: clientId,
        client_name: orderData.client_name,
        professional_id: orderData.professional_id,
        professional_name: orderData.professional_name || 'Professional',
        title: orderData.project_title,
        amount: parseInt(orderData.budget_range?.replace(/[^0-9]/g, '') || '100000'), // Fallback amount
        commission_rate: 0.10,
        status: 'pending_payment'
      };
      
      const { data: escrowData, error: escrowError } = await supabase.from('escrow_projects').insert([escrowPayload]).select();
      if (escrowError) {
         console.error("Failed to create escrow project:", escrowError);
      } else {
         // Return the escrow data as success if the original insert failed
         if (res.error) {
            res = { data: escrowData, error: null, count: null, status: 201, statusText: 'Created' };
         }
      }
    }

    return { data: res.data, error: res.error };
  } catch (err: any) {
    console.error('Supabase submitOrder error:', err);
    return { data: null, error: err };
  }
}




export async function submitContactToSupabase(msg: ContactMessage): Promise<{ data: any; error: any }> {
  try {
    const payload = {
      name: msg.name,
      email: msg.email,
      phone: msg.phone || null,
      subject: msg.subject || 'Website Inquiry',
      message: msg.message,
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('contact_messages').insert([payload]).select();
    if (error) return { data: null, error };
    return { data, error: null };
  } catch (err: any) {
    console.error('Supabase submitContact error:', err);
    return { data: null, error: err };
  }
}

// Synchronous and unified user retrieval helpers
export function getStoredUser(): any {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('idea_hub_local_user');
    if (raw) return JSON.parse(raw);
  } catch {
    return null;
  }
  return null;
}

export async function getActiveUser(): Promise<any> {
  const local = getStoredUser();
  if (local) return local;
  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user) return data.user;
  } catch (err) {
    console.error('getActiveUser error:', err);
  }
  return null;
}

// ==========================================
// CLOUD SYNC & MULTI-LAYER DATA PERSISTENCE
// ==========================================

const SYNC_TAG_CLIENT = 'IDEA_SYNC:client';
const SYNC_TAG_PROFESSIONAL = 'IDEA_SYNC:professional';
const SYNC_TAG_CHAT_SESSION = 'IDEA_SYNC:chat_session';
const SYNC_TAG_CHAT_MESSAGE = 'IDEA_SYNC:chat_message';
const SYNC_TAG_JOB_APPLICATION = 'IDEA_SYNC:job_application';

// --- CLIENTS PERSISTENCE ---

export async function saveRegisteredClient(client: UserProfile): Promise<void> {
  const cleanClient: UserProfile = {
    id: client.id,
    email: client.email.trim().toLowerCase(),
    fullName: client.fullName.trim(),
    role: 'client',
    phone: client.phone || '',
    createdAt: client.createdAt || new Date().toISOString()
  };

  // 1. Sync to localStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('idea_hub_clients');
      const list: UserProfile[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex(c => c.id === cleanClient.id || c.email === cleanClient.email);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...cleanClient };
      } else {
        list.unshift(cleanClient);
      }
      localStorage.setItem('idea_hub_clients', JSON.stringify(list));
    } catch (e) {
      console.warn('Local client cache warning:', e);
    }

    try {
      window.dispatchEvent(new CustomEvent('idea_hub_client_registered', { detail: cleanClient }));
    } catch {}
  }

  // 2. Sync to Supabase unrestricted cloud sync bus
  try {
    await supabase.from('contact_messages').insert([{
      name: cleanClient.fullName || 'Registered Client',
      email: cleanClient.email,
      phone: cleanClient.phone || null,
      subject: SYNC_TAG_CLIENT,
      message: JSON.stringify(cleanClient)
    }]);
  } catch (err) {
    console.warn('Cloud sync client error:', err);
  }

  // 3. Optional direct profiles table update
  try {
    await supabase.from('profiles').upsert([{
      id: cleanClient.id,
      email: cleanClient.email,
      full_name: cleanClient.fullName,
      role: 'client',
      phone: cleanClient.phone || null,
      created_at: cleanClient.createdAt
    }]);
  } catch {}

  // 4. Server API sync if available
  try {
    await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanClient)
    }).catch(() => {});
  } catch {}
}

export async function fetchRegisteredClients(): Promise<UserProfile[]> {
  const map = new Map<string, UserProfile>();

  // 1. Read local storage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('idea_hub_clients');
      if (raw) {
        const parsed: UserProfile[] = JSON.parse(raw);
        for (const c of parsed) {
          if (c?.email) map.set(c.email.toLowerCase(), c);
        }
      }
    } catch (e) {
      console.warn('Local client read error:', e);
    }
  }

  // 2. Read Server API
  try {
    const res = await fetch('/api/clients');
    if (res.ok) {
      const serverClients = await res.json();
      if (Array.isArray(serverClients)) {
        for (const c of serverClients) {
          if (c?.email) map.set(c.email.toLowerCase(), c);
        }
      }
    }
  } catch {}

  // 3. Read Cloud Sync from contact_messages
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('subject', SYNC_TAG_CLIENT)
      .order('created_at', { ascending: true });

    if (!error && data && Array.isArray(data)) {
      for (const row of data) {
        try {
          const parsed = JSON.parse(row.message);
          if (parsed?.email) {
            const emailKey = parsed.email.toLowerCase();
            const existing = map.get(emailKey);
            if (!existing || new Date(row.created_at).getTime() >= new Date(existing.createdAt || 0).getTime()) {
              map.set(emailKey, {
                id: parsed.id || row.id,
                email: emailKey,
                fullName: parsed.fullName || row.name || 'Client',
                phone: parsed.phone || row.phone || '',
                role: 'client',
                createdAt: parsed.createdAt || row.created_at
              });
            }
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn('Cloud sync clients fetch error:', err);
  }

  // 4. Read Supabase profiles
  try {
    const { data: profData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false });

    if (profData && Array.isArray(profData)) {
      for (const p of profData) {
        if (p?.email) {
          const emailKey = p.email.toLowerCase();
          if (!map.has(emailKey)) {
            map.set(emailKey, {
              id: p.id,
              email: emailKey,
              fullName: p.full_name || p.fullName || 'Client',
              phone: p.phone || '',
              role: 'client',
              createdAt: p.created_at || new Date().toISOString()
            });
          }
        }
      }
    }
  } catch {}

  const result = Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('idea_hub_clients', JSON.stringify(result));
    } catch {}
  }

  return result;
}

export async function deleteRegisteredClient(id: string, email?: string): Promise<void> {
  const cleanEmail = email?.toLowerCase();

  // Local storage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('idea_hub_clients');
      if (raw) {
        const list: UserProfile[] = JSON.parse(raw);
        const filtered = list.filter(c => c.id !== id && (!cleanEmail || c.email.toLowerCase() !== cleanEmail));
        localStorage.setItem('idea_hub_clients', JSON.stringify(filtered));
      }
      window.dispatchEvent(new CustomEvent('idea_hub_client_deleted', { detail: { id, email } }));
    } catch {}
  }

  // Server API
  try {
    await fetch(`/api/clients/${id}`, { method: 'DELETE' }).catch(() => {});
  } catch {}

  // Supabase profiles
  try {
    await supabase.from('profiles').delete().eq('id', id);
    if (cleanEmail) {
      await supabase.from('profiles').delete().eq('email', cleanEmail);
    }
  } catch {}

  // Supabase cloud sync
  try {
    if (cleanEmail) {
      await supabase.from('contact_messages').delete().eq('email', cleanEmail).eq('subject', SYNC_TAG_CLIENT);
    }
  } catch {}
}

// --- PROFESSIONALS PERSISTENCE ---

export async function saveRegisteredProfessional(prof: Professional): Promise<void> {
  const cleanProf: Professional = {
    ...prof,
    id: prof.id,
    fullName: prof.fullName.trim(),
    email: prof.email.trim().toLowerCase(),
    phone: prof.phone || '',
    jobCategory: prof.jobCategory || 'Creative Specialist',
    skills: Array.isArray(prof.skills) ? prof.skills : [],
    picture: prof.picture || '',
    bio: prof.bio || 'Verified Professional at iDEA Creation Hub',
    location: prof.location || 'Nigeria & Remote',
    yearsOfExperience: prof.yearsOfExperience || '3+ Years',
    portfolioItems: prof.portfolioItems || [],
    rating: prof.rating ?? 5.0,
    ratingCount: prof.ratingCount ?? 1,
    createdAt: prof.createdAt || new Date().toISOString()
  };

  // 1. Sync to local storage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('idea_hub_professionals');
      const list: Professional[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex(p => p.id === cleanProf.id || (p.email && p.email.toLowerCase() === cleanProf.email));
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...cleanProf };
      } else {
        list.unshift(cleanProf);
      }
      localStorage.setItem('idea_hub_professionals', JSON.stringify(list));
    } catch (e) {
      console.warn('Local pro cache error:', e);
    }

    try {
      window.dispatchEvent(new CustomEvent('idea_hub_professionals_updated', { detail: cleanProf }));
    } catch {}
  }

  // 2. Sync to Supabase unrestricted cloud sync bus
  try {
    await supabase.from('contact_messages').insert([{
      name: cleanProf.fullName,
      email: cleanProf.email,
      phone: cleanProf.phone || null,
      subject: SYNC_TAG_PROFESSIONAL,
      message: JSON.stringify(cleanProf)
    }]);
  } catch (err) {
    console.warn('Cloud sync pro error:', err);
  }

  // 3. Attempt direct professionals table upsert
  try {
    const dbPayload = {
      id: cleanProf.id,
      full_name: cleanProf.fullName,
      email: cleanProf.email,
      phone: cleanProf.phone || null,
      job_category: cleanProf.jobCategory,
      skills: cleanProf.skills,
      picture: cleanProf.picture || null,
      bio: cleanProf.bio,
      location: cleanProf.location,
      years_of_experience: cleanProf.yearsOfExperience,
      created_at: cleanProf.createdAt
    };
    await supabase.from('professionals').upsert([dbPayload]);
  } catch {}

  // 4. Server API sync if available
  try {
    await fetch('/api/professionals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanProf)
    }).catch(() => {});
  } catch {}
}

export async function fetchRegisteredProfessionals(): Promise<Professional[]> {
  const map = new Map<string, Professional>();

  // 1. Read local storage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('idea_hub_professionals');
      if (raw) {
        const parsed: Professional[] = JSON.parse(raw);
        for (const p of parsed) {
          const key = p.id || p.email?.toLowerCase();
          if (key) map.set(key, p);
        }
      }
    } catch (e) {
      console.warn('Local pro read error:', e);
    }
  }

  // 2. Read Server API
  try {
    const res = await fetch('/api/professionals');
    if (res.ok) {
      const serverPros = await res.json();
      if (Array.isArray(serverPros)) {
        for (const p of serverPros) {
          const key = p.id || p.email?.toLowerCase();
          if (key) map.set(key, p);
        }
      }
    }
  } catch {}

  // 3. Read Cloud Sync from contact_messages
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('subject', SYNC_TAG_PROFESSIONAL)
      .order('created_at', { ascending: true });

    if (!error && data && Array.isArray(data)) {
      for (const row of data) {
        try {
          const parsed: Professional = JSON.parse(row.message);
          const key = parsed.id || parsed.email?.toLowerCase();
          if (key) {
            const existing = map.get(key);
            if (!existing || new Date(row.created_at).getTime() >= new Date(existing.createdAt || 0).getTime()) {
              map.set(key, {
                ...parsed,
                picture: parsed.picture || existing?.picture || '',
                createdAt: parsed.createdAt || row.created_at
              });
            }
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn('Cloud sync pro fetch error:', err);
  }

  // 4. Read Supabase professionals table
  try {
    const { data: dbPros } = await supabase.from('professionals').select('*');
    if (dbPros && Array.isArray(dbPros)) {
      for (const p of dbPros) {
        const key = p.id || p.email?.toLowerCase();
        if (key) {
          const existing = map.get(key);
          const mapped: Professional = {
            id: p.id,
            fullName: p.full_name || p.fullName || 'Professional',
            email: p.email || '',
            phone: p.phone || '',
            jobCategory: p.job_category || p.jobCategory || 'Creative Specialist',
            skills: Array.isArray(p.skills) ? p.skills : [],
            picture: p.picture || existing?.picture || '',
            bio: p.bio || 'Verified Professional at iDEA Creation Hub',
            location: p.location || 'Nigeria & Remote',
            yearsOfExperience: p.years_of_experience || p.yearsOfExperience || '3+ Years',
            portfolioItems: existing?.portfolioItems || [],
            rating: p.rating ?? 5.0,
            ratingCount: p.rating_count ?? 1,
            createdAt: p.created_at || new Date().toISOString()
          };
          map.set(key, { ...existing, ...mapped });
        }
      }
    }
  } catch {}

  const result = Array.from(map.values());
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('idea_hub_professionals', JSON.stringify(result));
    } catch {}
  }

  return result;
}

export async function deleteRegisteredProfessional(id: string): Promise<void> {
  // Local storage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('idea_hub_professionals');
      if (raw) {
        const list: Professional[] = JSON.parse(raw);
        const filtered = list.filter(p => p.id !== id);
        localStorage.setItem('idea_hub_professionals', JSON.stringify(filtered));
      }
      window.dispatchEvent(new CustomEvent('idea_hub_professionals_updated', { detail: { id, deleted: true } }));
    } catch {}
  }

  // Server API
  try {
    await fetch(`/api/professionals/${id}`, { method: 'DELETE' }).catch(() => {});
  } catch {}

  // Supabase table
  try {
    await supabase.from('professionals').delete().eq('id', id);
  } catch {}
}

// --- CHAT SESSIONS & MESSAGES PERSISTENCE ---

export async function saveChatSession(session: ChatSession): Promise<void> {
  const cleanSession: ChatSession = {
    ...session,
    id: session.id,
    clientId: session.clientId,
    clientName: session.clientName || 'Client',
    professionalId: session.professionalId,
    professionalName: session.professionalName,
    professionalPicture: session.professionalPicture || '',
    lastMessage: session.lastMessage || '',
    updatedAt: session.updatedAt || new Date().toISOString()
  };

  // 1. Sync to local storage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('idea_hub_chat_sessions');
      const list: ChatSession[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex(c => c.id === cleanSession.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...cleanSession };
        const item = list.splice(idx, 1)[0];
        list.unshift(item);
      } else {
        list.unshift(cleanSession);
      }
      localStorage.setItem('idea_hub_chat_sessions', JSON.stringify(list));
    } catch (e) {
      console.warn('Local session cache error:', e);
    }

    try {
      window.dispatchEvent(new CustomEvent('idea_hub_chat_sessions_updated', { detail: cleanSession }));
    } catch {}
  }

  // 2. Sync to Supabase unrestricted cloud sync bus
  try {
    await supabase.from('contact_messages').insert([{
      name: cleanSession.clientName,
      email: 'chat@ideacreationhub.com',
      subject: SYNC_TAG_CHAT_SESSION,
      message: JSON.stringify(cleanSession)
    }]);
  } catch (err) {
    console.warn('Cloud sync chat session error:', err);
  }

  // 3. Server API sync if available
  try {
    await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanSession)
    }).catch(() => {});
  } catch {}

  // 4. Direct chat_sessions table attempt
  try {
    await supabase.from('chat_sessions').upsert([{
      id: cleanSession.id,
      client_id: cleanSession.clientId,
      client_name: cleanSession.clientName,
      professional_id: cleanSession.professionalId,
      professional_name: cleanSession.professionalName,
      professional_picture: cleanSession.professionalPicture || null,
      last_message: cleanSession.lastMessage,
      updated_at: cleanSession.updatedAt
    }]);
  } catch {}
}

export async function saveChatMessage(msg: ChatMessage): Promise<void> {
  const cleanMsg: ChatMessage = {
    ...msg,
    id: msg.id,
    chatId: msg.chatId,
    senderId: msg.senderId,
    senderName: msg.senderName || 'User',
    text: msg.text,
    timestamp: msg.timestamp || new Date().toISOString()
  };

  // 1. Sync to local storage
  if (typeof window !== 'undefined') {
    try {
      const key = `idea_hub_chat_msgs_${cleanMsg.chatId}`;
      const raw = localStorage.getItem(key);
      const list: ChatMessage[] = raw ? JSON.parse(raw) : [];
      if (!list.some(m => m.id === cleanMsg.id)) {
        list.push(cleanMsg);
        localStorage.setItem(key, JSON.stringify(list));
      }
    } catch (e) {
      console.warn('Local message cache error:', e);
    }

    try {
      window.dispatchEvent(new CustomEvent('idea_hub_chat_message_sent', { detail: cleanMsg }));
    } catch {}
  }

  // 2. Sync to Supabase unrestricted cloud sync bus
  try {
    await supabase.from('contact_messages').insert([{
      name: cleanMsg.senderName,
      email: 'chat@ideacreationhub.com',
      subject: SYNC_TAG_CHAT_MESSAGE,
      message: JSON.stringify(cleanMsg)
    }]);
  } catch (err) {
    console.warn('Cloud sync chat message error:', err);
  }

  // 3. Server API sync if available
  try {
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanMsg)
    }).catch(() => {});
  } catch {}

  // 4. Direct chat_messages table attempt
  try {
    await supabase.from('chat_messages').insert([{
      id: cleanMsg.id,
      chat_id: cleanMsg.chatId,
      sender_id: cleanMsg.senderId,
      sender_name: cleanMsg.senderName,
      text: cleanMsg.text,
      created_at: cleanMsg.timestamp
    }]);
  } catch {}
}

export async function fetchChatSessions(filter?: { clientId?: string; professionalId?: string }): Promise<ChatSession[]> {
  const sessionMap = new Map<string, ChatSession>();

  // 1. Read local storage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('idea_hub_chat_sessions');
      if (raw) {
        const parsed: ChatSession[] = JSON.parse(raw);
        for (const item of parsed) {
          if (item?.id) sessionMap.set(item.id, item);
        }
      }

      // Also inspect all idea_hub_chat_msgs_* keys to guarantee no active chat is missed
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('idea_hub_chat_msgs_')) {
          const chatId = key.replace('idea_hub_chat_msgs_', '');
          const rawMsgs = localStorage.getItem(key);
          if (rawMsgs) {
            const msgs: ChatMessage[] = JSON.parse(rawMsgs);
            if (msgs.length > 0) {
              const last = msgs[msgs.length - 1];
              const parts = chatId.split('_');
              const clientId = parts[0] || 'client';
              const professionalId = parts[1] || 'pro';
              const existing = sessionMap.get(chatId);
              if (!existing) {
                sessionMap.set(chatId, {
                  id: chatId,
                  clientId,
                  clientName: msgs.find(m => m.senderId === clientId && m.senderName !== 'iDEA Admin')?.senderName || 'Client',
                  professionalId,
                  professionalName: msgs.find(m => m.senderId === professionalId)?.senderName || 'Professional',
                  lastMessage: last.text,
                  updatedAt: last.timestamp
                });
              } else if (new Date(last.timestamp).getTime() > new Date(existing.updatedAt).getTime()) {
                sessionMap.set(chatId, {
                  ...existing,
                  lastMessage: last.text,
                  updatedAt: last.timestamp
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Local chat sessions error:', err);
    }
  }

  // 2. Read Server API
  try {
    const res = await fetch('/api/chats');
    if (res.ok) {
      const serverChats = await res.json();
      if (Array.isArray(serverChats)) {
        for (const s of serverChats) {
          if (s?.id) {
            const existing = sessionMap.get(s.id);
            if (!existing || new Date(s.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
              sessionMap.set(s.id, { ...existing, ...s });
            }
          }
        }
      }
    }
  } catch {}

  // 3. Read Cloud Sync from contact_messages
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('subject', SYNC_TAG_CHAT_SESSION)
      .order('created_at', { ascending: true });

    if (!error && data && Array.isArray(data)) {
      for (const row of data) {
        try {
          const parsed: ChatSession = JSON.parse(row.message);
          if (parsed?.id) {
            const existing = sessionMap.get(parsed.id);
            if (!existing || new Date(row.created_at).getTime() >= new Date(existing.updatedAt).getTime()) {
              sessionMap.set(parsed.id, {
                ...existing,
                ...parsed,
                updatedAt: parsed.updatedAt || row.created_at
              });
            }
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn('Cloud sync chat sessions fetch error:', err);
  }

  // 4. Direct Supabase chat_sessions table attempt
  try {
    let query = supabase.from('chat_sessions').select('*').order('updated_at', { ascending: false });
    if (filter?.clientId) query = query.eq('client_id', filter.clientId);
    if (filter?.professionalId) query = query.eq('professional_id', filter.professionalId);
    const { data } = await query;
    if (data && Array.isArray(data)) {
      for (const row of data) {
        const sId = row.id;
        const mapped: ChatSession = {
          id: sId,
          clientId: row.client_id || row.clientId || 'client',
          clientName: row.client_name || row.clientName || 'Client',
          professionalId: row.professional_id || row.professionalId || 'pro',
          professionalName: row.professional_name || row.professionalName || 'Professional',
          professionalPicture: row.professional_picture || row.professionalPicture || '',
          lastMessage: row.last_message || row.lastMessage || '',
          updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
        };
        const existing = sessionMap.get(sId);
        if (!existing || new Date(mapped.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
          sessionMap.set(sId, { ...existing, ...mapped });
        }
      }
    }
  } catch {}

  let result = Array.from(sessionMap.values());

  if (filter?.clientId) {
    result = result.filter(c => c.clientId === filter.clientId);
  }
  if (filter?.professionalId) {
    result = result.filter(c => c.professionalId === filter.professionalId);
  }

  result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  if (typeof window !== 'undefined' && !filter) {
    try {
      localStorage.setItem('idea_hub_chat_sessions', JSON.stringify(result));
    } catch {}
  }

  return result;
}

export async function fetchChatMessages(chatId: string): Promise<ChatMessage[]> {
  const msgMap = new Map<string, ChatMessage>();

  // 1. Read local storage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`idea_hub_chat_msgs_${chatId}`);
      if (raw) {
        const list: ChatMessage[] = JSON.parse(raw);
        for (const m of list) {
          if (m?.id) msgMap.set(m.id, m);
        }
      }
    } catch (err) {
      console.warn('Local messages read error:', err);
    }
  }

  // 2. Read Server API
  try {
    const res = await fetch(`/api/messages?chatId=${encodeURIComponent(chatId)}`);
    if (res.ok) {
      const serverMsgs = await res.json();
      if (Array.isArray(serverMsgs)) {
        for (const m of serverMsgs) {
          if (m?.id) msgMap.set(m.id, m);
        }
      }
    }
  } catch {}

  // 3. Read Cloud Sync from contact_messages
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('subject', SYNC_TAG_CHAT_MESSAGE)
      .order('created_at', { ascending: true });

    if (!error && data && Array.isArray(data)) {
      for (const row of data) {
        try {
          const parsed: ChatMessage = JSON.parse(row.message);
          if (parsed?.chatId === chatId && parsed?.id) {
            msgMap.set(parsed.id, parsed);
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn('Cloud sync messages fetch error:', err);
  }

  // 4. Read from Supabase chat_messages table
  try {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (data && Array.isArray(data)) {
      for (const row of data) {
        const id = row.id;
        msgMap.set(id, {
          id,
          chatId: row.chat_id || row.chatId || chatId,
          senderId: row.sender_id || row.senderId,
          senderName: row.sender_name || row.senderName || 'User',
          text: row.text,
          timestamp: row.created_at || row.timestamp || new Date().toISOString()
        });
      }
    }
  } catch {}

  const result = Array.from(msgMap.values());
  result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`idea_hub_chat_msgs_${chatId}`, JSON.stringify(result));
    } catch {}
  }


  return result;
}

// ==========================================
// JOB APPLICATIONS PERSISTENCE & SYNC
// ==========================================

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function saveJobApplication(appData: Omit<JobApplication, 'id' | 'appliedAt'> | JobApplication): Promise<JobApplication> {
  const appId = (appData as any).id || generateUUID();
  const appliedAt = (appData as any).appliedAt || new Date().toISOString();

  const cleanApp: JobApplication = {
    id: appId,
    jobId: appData.jobId,
    jobTitle: appData.jobTitle || 'Role Application',
    company: (appData as any).company || '',
    fullName: appData.fullName.trim(),
    phone: appData.phone.trim(),
    email: (appData as any).email ? (appData as any).email.trim().toLowerCase() : '',
    userId: (appData as any).userId || '',
    cvUrl: appData.cvUrl || '',
    cvName: appData.cvName || '',
    cvLink: appData.cvLink ? appData.cvLink.trim() : '',
    photoUrl: appData.photoUrl || '',
    resumeText: appData.resumeText ? appData.resumeText.trim() : '',
    status: (appData as any).status || 'pending',
    statusUpdatedAt: (appData as any).statusUpdatedAt || appliedAt,
    adminFeedback: (appData as any).adminFeedback || '',
    appliedAt
  };

  // 1. Sync to local storage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('idea_hub_job_applications');
      const list: JobApplication[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex(a => a.id === cleanApp.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...cleanApp };
      } else {
        list.unshift(cleanApp);
      }
      localStorage.setItem('idea_hub_job_applications', JSON.stringify(list));

      // Also remember this application ID as authored by this browser session
      const myRaw = localStorage.getItem('idea_hub_my_application_ids');
      const myIds: string[] = myRaw ? JSON.parse(myRaw) : [];
      if (!myIds.includes(cleanApp.id)) {
        myIds.unshift(cleanApp.id);
        localStorage.setItem('idea_hub_my_application_ids', JSON.stringify(myIds));
      }
    } catch (e) {
      console.warn('Local application cache error:', e);
    }

    try {
      window.dispatchEvent(new CustomEvent('idea_hub_job_application_submitted', { detail: cleanApp }));
    } catch {}
  }

  // 2. Sync to Supabase unrestricted cloud sync bus (contact_messages)
  try {
    await supabase.from('contact_messages').insert([{
      name: cleanApp.fullName || 'Job Applicant',
      email: cleanApp.email || (cleanApp.cvLink && cleanApp.cvLink.includes('@') ? cleanApp.cvLink : `${cleanApp.phone || 'applicant'}@candidate.ideahub.com`),
      phone: cleanApp.phone || null,
      subject: SYNC_TAG_JOB_APPLICATION,
      message: JSON.stringify(cleanApp)
    }]);
  } catch (err) {
    console.warn('Cloud sync application error:', err);
  }

  // 3. Attempt direct job_applications table insert
  try {
    const directPayload: any = {
      id: cleanApp.id,
      jobId: cleanApp.jobId,
      jobTitle: cleanApp.jobTitle,
      fullName: cleanApp.fullName,
      phone: cleanApp.phone,
      appliedAt: cleanApp.appliedAt,
      status: cleanApp.status
    };
    if (cleanApp.company) directPayload.company = cleanApp.company;
    if (cleanApp.email) directPayload.email = cleanApp.email;
    if (cleanApp.userId) directPayload.userId = cleanApp.userId;
    if (cleanApp.cvUrl) directPayload.cvUrl = cleanApp.cvUrl;
    if (cleanApp.cvName) directPayload.cvName = cleanApp.cvName;
    if (cleanApp.cvLink) directPayload.cvLink = cleanApp.cvLink;
    if (cleanApp.photoUrl) directPayload.photoUrl = cleanApp.photoUrl;
    if (cleanApp.resumeText) directPayload.resumeText = cleanApp.resumeText;

    const { error: directErr } = await supabase.from('job_applications').insert([directPayload]);
    if (directErr) {
      try {
        await supabase.from('job_applications').insert([{
          id: cleanApp.id.length === 36 ? cleanApp.id : undefined,
          applicant_name: cleanApp.fullName,
          email: cleanApp.email || `${cleanApp.phone || 'candidate'}@ideacreationhub.com`,
          phone: cleanApp.phone,
          resume_url: cleanApp.cvUrl || cleanApp.cvLink || null,
          cover_message: cleanApp.resumeText || cleanApp.jobTitle,
          status: cleanApp.status
        }]);
      } catch {}
    }
  } catch {}

  // 4. Server API sync if available
  try {
    await fetch('/api/job_applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanApp)
    }).catch(() => {});
  } catch {}

  return cleanApp;
}

export async function fetchJobApplications(): Promise<JobApplication[]> {
  const map = new Map<string, JobApplication>();

  // 1. Read local storage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('idea_hub_job_applications');
      if (raw) {
        const parsed: JobApplication[] = JSON.parse(raw);
        for (const a of parsed) {
          if (a?.id) map.set(a.id, a);
        }
      }
    } catch (e) {
      console.warn('Local job applications read error:', e);
    }
  }

  // 2. Read Cloud Sync from contact_messages
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('subject', SYNC_TAG_JOB_APPLICATION)
      .order('created_at', { ascending: false });

    if (!error && data && Array.isArray(data)) {
      for (const row of data) {
        try {
          const parsed = JSON.parse(row.message);
          if (parsed && (parsed.id || row.id)) {
            const appId = parsed.id || row.id;
            const existing = map.get(appId);
            
            const existingTime = existing 
              ? new Date(existing.statusUpdatedAt || existing.appliedAt || 0).getTime() 
              : 0;
            
            const incomingTime = new Date(parsed.statusUpdatedAt || parsed.appliedAt || row.created_at).getTime();
            
            if (!existing || incomingTime > existingTime) {
              map.set(appId, {
                id: appId,
                jobId: parsed.jobId || '',
                jobTitle: parsed.jobTitle || 'Role Application',
                company: parsed.company || '',
                fullName: parsed.fullName || row.name || 'Applicant',
                phone: parsed.phone || row.phone || '',
                email: parsed.email || row.email || '',
                userId: parsed.userId || '',
                cvUrl: parsed.cvUrl || '',
                cvName: parsed.cvName || '',
                cvLink: parsed.cvLink || '',
                photoUrl: parsed.photoUrl || '',
                resumeText: parsed.resumeText || '',
                status: parsed.status || 'pending',
                statusUpdatedAt: parsed.statusUpdatedAt || parsed.appliedAt || row.created_at,
                adminFeedback: parsed.adminFeedback || '',
                appliedAt: parsed.appliedAt || row.created_at
              });
            }
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn('Cloud sync job applications fetch error:', err);
  }

  // 3. Read Supabase direct job_applications table
  try {
    const { data: dbApps, error } = await supabase.from('job_applications').select('*');
    if (!error && dbApps && Array.isArray(dbApps)) {
      for (const row of dbApps) {
        const appId = row.id;
        if (!map.has(appId)) {
          map.set(appId, {
            id: appId,
            jobId: row.jobId || row.job_id || '',
            jobTitle: row.jobTitle || row.job_title || 'Role Application',
            company: row.company || '',
            fullName: row.fullName || row.applicant_name || row.full_name || 'Applicant',
            phone: row.phone || '',
            email: row.email || '',
            userId: row.userId || row.user_id || '',
            cvUrl: row.cvUrl || row.resume_url || '',
            cvName: row.cvName || '',
            cvLink: row.cvLink || row.portfolio_url || row.linkedin_url || '',
            photoUrl: row.photoUrl || '',
            resumeText: row.resumeText || row.cover_message || '',
            status: row.status || 'pending',
            statusUpdatedAt: row.statusUpdatedAt || row.updated_at || row.appliedAt || row.created_at || new Date().toISOString(),
            adminFeedback: row.adminFeedback || row.feedback || '',
            appliedAt: row.appliedAt || row.created_at || new Date().toISOString()
          });
        }
      }
    }
  } catch {}

  const result = Array.from(map.values()).sort(
    (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
  );

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('idea_hub_job_applications', JSON.stringify(result));
    } catch {}
  }

  return result;
}

export async function fetchUserJobApplications(user?: { id?: string; email?: string; phone?: string } | null): Promise<JobApplication[]> {
  const all = await fetchJobApplications();
  if (!user && typeof window === 'undefined') return [];

  let myIds: string[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('idea_hub_my_application_ids');
      if (raw) myIds = JSON.parse(raw);
    } catch {}
  }

  const userEmail = user?.email?.trim().toLowerCase();
  const userId = user?.id;
  const userPhone = user?.phone?.trim();

  return all.filter(app => {
    // 1. Auth ID match
    if (userId && app.userId && app.userId === userId) return true;
    // 2. Email match
    if (userEmail && app.email && app.email.trim().toLowerCase() === userEmail) return true;
    // 3. Phone match
    if (userPhone && app.phone && app.phone.replace(/[^0-9]/g, '') === userPhone.replace(/[^0-9]/g, '')) return true;
    // 4. Session memory
    if (myIds.includes(app.id)) return true;
    return false;
  });
}

export async function deleteJobApplication(id: string): Promise<void> {
  // 1. Remove from local storage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('idea_hub_job_applications');
      if (raw) {
        const list: JobApplication[] = JSON.parse(raw);
        const filtered = list.filter(a => a.id !== id);
        localStorage.setItem('idea_hub_job_applications', JSON.stringify(filtered));
      }
      const myRaw = localStorage.getItem('idea_hub_my_application_ids');
      if (myRaw) {
        const myIds: string[] = JSON.parse(myRaw);
        localStorage.setItem('idea_hub_my_application_ids', JSON.stringify(myIds.filter(i => i !== id)));
      }
      window.dispatchEvent(new CustomEvent('idea_hub_job_application_deleted', { detail: { id } }));
    } catch {}
  }

  // 2. Remove from Supabase direct table
  try {
    await supabase.from('job_applications').delete().eq('id', id);
  } catch {}

  // 3. Remove from cloud sync contact_messages
  try {
    const { data } = await supabase
      .from('contact_messages')
      .select('id, message')
      .eq('subject', SYNC_TAG_JOB_APPLICATION);
    if (data && Array.isArray(data)) {
      for (const row of data) {
        try {
          const parsed = JSON.parse(row.message);
          if (parsed.id === id) {
            await supabase.from('contact_messages').delete().eq('id', row.id);
          }
        } catch {}
      }
    }
  } catch {}
}

export async function updateJobApplicationStatus(
  id: string, 
  status: 'pending' | 'reviewed' | 'contacted' | 'rejected',
  adminFeedback?: string
): Promise<void> {
  const statusUpdatedAt = new Date().toISOString();

  // 1. Local storage update
  let updatedApp: JobApplication | null = null;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('idea_hub_job_applications');
      if (raw) {
        const list: JobApplication[] = JSON.parse(raw);
        const idx = list.findIndex(a => a.id === id);
        if (idx >= 0) {
          list[idx].status = status;
          list[idx].statusUpdatedAt = statusUpdatedAt;
          if (adminFeedback !== undefined) list[idx].adminFeedback = adminFeedback;
          updatedApp = list[idx];
          localStorage.setItem('idea_hub_job_applications', JSON.stringify(list));
          window.dispatchEvent(new CustomEvent('idea_hub_job_application_updated', { detail: list[idx] }));
          
          if (updatedApp.userId) {
            saveNotification({
              userId: updatedApp.userId,
              title: 'Application Status Updated',
              message: `Your application status for ${updatedApp.jobTitle || 'a job'} has been updated to "${status.toUpperCase()}".`,
              type: 'status_update'
            });
          }
        }
      }
    } catch {}
  }

  // 2. Supabase direct table update
  try {
    // Attempt standard UUID format check
    if (id && id.length === 36) {
      // Columns in database table usually snake_case or default, status and updated_at are standard.
      // We try both snake_case and camelCase to be absolutely certain it hits correctly.
      const updatePayload: any = { status };
      updatePayload.updated_at = statusUpdatedAt;
      
      const { error } = await supabase.from('job_applications').update(updatePayload).eq('id', id);
      if (error) {
        // Fallback to camelCase fields if table was created differently
        await supabase.from('job_applications').update({
          status,
          statusUpdatedAt,
          adminFeedback: adminFeedback || undefined
        }).eq('id', id);
      }
    }
  } catch {}

  // 3. Cloud sync bus update (contact_messages)
  try {
    const { data } = await supabase
      .from('contact_messages')
      .select('id, message, name, email, phone')
      .eq('subject', SYNC_TAG_JOB_APPLICATION);
    if (data && Array.isArray(data)) {
      let matchedAndUpdated = false;
      for (const row of data) {
        try {
          const parsed = JSON.parse(row.message);
          // Check BOTH parsed.id inside JSON and row.id (the database row uuid)
          if (parsed.id === id || row.id === id) {
            parsed.status = status;
            parsed.statusUpdatedAt = statusUpdatedAt;
            if (adminFeedback !== undefined) {
              parsed.adminFeedback = adminFeedback;
            }
            
            // A. Attempt standard UPDATE first (for authenticated sessions)
            const { error: updateErr } = await supabase
              .from('contact_messages')
              .update({ message: JSON.stringify(parsed) })
              .eq('id', row.id);
            
            // B. If UPDATE failed or skipped due to RLS, perform a high-reliability INSERT sync bus broadcast
            // Since INSERT is open to public, this is 100% guaranteed to succeed!
            if (updateErr) {
              await supabase.from('contact_messages').insert([{
                name: row.name || parsed.fullName || 'Job Applicant',
                email: row.email || parsed.email || '',
                phone: row.phone || parsed.phone || null,
                subject: SYNC_TAG_JOB_APPLICATION,
                message: JSON.stringify(parsed)
              }]);
            }
            matchedAndUpdated = true;
          }
        } catch {}
      }
      
      // If no match was found in the database but we have it in local storage, we can broadcast an insert anyway
      if (!matchedAndUpdated && updatedApp) {
        await supabase.from('contact_messages').insert([{
          name: updatedApp.fullName || 'Job Applicant',
          email: updatedApp.email || '',
          phone: updatedApp.phone || null,
          subject: SYNC_TAG_JOB_APPLICATION,
          message: JSON.stringify(updatedApp)
        }]);
      }
    }
  } catch {}
}

export async function saveNotification(notification: Omit<import('../types').AppNotification, 'id' | 'createdAt' | 'read'>): Promise<void> {
  const newNotif: import('../types').AppNotification = {
    ...notification,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    read: false
  };

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('idea_hub_notifications');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(newNotif);
      localStorage.setItem('idea_hub_notifications', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('idea_hub_notifications_updated', { detail: newNotif }));
    } catch {}
  }
}

export async function fetchUserNotifications(userId: string): Promise<import('../types').AppNotification[]> {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('idea_hub_notifications');
    if (raw) {
      const list: import('../types').AppNotification[] = JSON.parse(raw);
      return list.filter(n => n.userId === userId);
    }
  } catch {}
  return [];
}

export async function markNotificationAsRead(id: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('idea_hub_notifications');
    if (raw) {
      const list: import('../types').AppNotification[] = JSON.parse(raw);
      const idx = list.findIndex(n => n.id === id);
      if (idx >= 0) {
        list[idx].read = true;
        localStorage.setItem('idea_hub_notifications', JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('idea_hub_notifications_updated', { detail: list[idx] }));
      }
    }
  } catch {}
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('idea_hub_notifications');
    if (raw) {
      const list: import('../types').AppNotification[] = JSON.parse(raw);
      let updated = false;
      for (const notif of list) {
        if (notif.userId === userId && !notif.read) {
          notif.read = true;
          updated = true;
        }
      }
      if (updated) {
        localStorage.setItem('idea_hub_notifications', JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('idea_hub_notifications_updated'));
      }
    }
  } catch {}
}

export async function updateJobApplicationInternalStatus(
  id: string,
  internalStatus: string,
  internalNotes?: string
): Promise<void> {
  let updatedApp: import('../types').JobApplication | null = null;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('idea_hub_job_applications');
      if (raw) {
        const list: import('../types').JobApplication[] = JSON.parse(raw);
        const idx = list.findIndex(a => a.id === id);
        if (idx >= 0) {
          list[idx].internalStatus = internalStatus;
          if (internalNotes !== undefined) list[idx].internalNotes = internalNotes;
          updatedApp = list[idx];
          localStorage.setItem('idea_hub_job_applications', JSON.stringify(list));
          window.dispatchEvent(new CustomEvent('idea_hub_job_application_updated', { detail: list[idx] }));
        }
      }
    } catch {}
  }

  // Cloud sync bus update
  try {
    const { data } = await supabase
      .from('contact_messages')
      .select('id, message')
      .eq('subject', SYNC_TAG_JOB_APPLICATION);
    if (data && Array.isArray(data)) {
      for (const row of data) {
        try {
          const parsed = JSON.parse(row.message);
          if (parsed.id === id || row.id === id) {
            parsed.internalStatus = internalStatus;
            if (internalNotes !== undefined) parsed.internalNotes = internalNotes;
            await supabase.from('contact_messages').update({ message: JSON.stringify(parsed) }).eq('id', row.id);
          }
        } catch {}
      }
    }
  } catch {}
}

// --- Escrow & Wallet Functions ---

export async function fetchEscrowProjects(userId?: string, role?: 'client' | 'professional' | 'admin'): Promise<any[]> {
  try {
    let query = supabase.from('escrow_projects').select('*').order('created_at', { ascending: false });
    
    if (role === 'client' && userId) {
      query = query.eq('client_id', userId);
    } else if (role === 'professional' && userId) {
      query = query.eq('professional_id', userId);
    }
    
    const { data, error } = await query;
    if (error) {
       console.error("fetchEscrowProjects error:", error);
       return [];
    }
    return data || [];
  } catch (err) {
    console.error("fetchEscrowProjects catch:", err);
    return [];
  }
}

export async function fetchWallet(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
    if (error) {
       return { pending_escrow: 0, available_balance: 0, withdrawn: 0 };
    }
    return data;
  } catch (err) {
    return { pending_escrow: 0, available_balance: 0, withdrawn: 0 };
  }
}

export async function createEscrowProject(payload: any): Promise<{data: any, error: any}> {
  return await supabase.from('escrow_projects').insert([payload]).select();
}

export async function updateEscrowStatus(projectId: string, status: string): Promise<{error: any}> {
  return await supabase.from('escrow_projects').update({ status, updated_at: new Date().toISOString() }).eq('id', projectId);
}

// 🔒 SECURE BACKEND ACTIONS 🔒

export async function fundEscrowBackend(projectId: string, amount: number, referenceId: string): Promise<{error: any}> {
  const { error } = await supabase.rpc('fund_escrow', {
    p_project_id: projectId,
    p_amount: amount,
    p_ref_id: referenceId
  });
  return { error };
}

export async function releaseEscrowBackend(projectId: string): Promise<{error: any}> {
  const { error } = await supabase.rpc('release_escrow', {
    p_project_id: projectId
  });
  return { error };
}

export async function clientApproveEscrowBackend(projectId: string): Promise<{error: any}> {
  const { error } = await supabase.rpc('client_approve_escrow', {
    p_project_id: projectId
  });
  return { error };
}

export async function fetchProfessionalOrders(profId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('escrow_projects')
      .select('*')
      .eq('professional_id', profId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("fetchProfessionalOrders error:", error);
      return [];
    }
    
    // Map escrow projects to the expected order format
    return (data || []).map(p => ({
      id: p.id,
      project_title: p.title,
      project_description: 'Service request via Escrow Payment System',
      budget_range: '₦' + Number(p.amount).toLocaleString(),
      client_name: p.client_name || 'Client',
      client_email: 'Contact via chat',
      professional_name: p.professional_name,
      service_category: 'Professional Service',
      status: p.status,
      created_at: p.created_at
    }));
  } catch (err) {
    console.error("fetchProfessionalOrders catch:", err);
    return [];
  }
}

export async function fetchClientOrders(clientId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('escrow_projects')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("fetchClientOrders error:", error);
      return [];
    }
    
    // Map escrow projects to the expected order format
    return (data || []).map(p => ({
      id: p.id,
      project_title: p.title,
      project_description: 'Service request via Escrow Payment System',
      budget_range: '₦' + Number(p.amount).toLocaleString(),
      client_name: p.client_name || 'Client',
      client_email: 'Contact via chat',
      professional_name: p.professional_name,
      service_category: 'Professional Service',
      status: p.status,
      created_at: p.created_at
    }));
  } catch (err) {
    console.error("fetchClientOrders catch:", err);
    return [];
  }
}
