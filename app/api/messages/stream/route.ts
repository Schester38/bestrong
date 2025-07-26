import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase côté serveur
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function normalizePhone(phone: string): string {
  let normalized = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  if (normalized.startsWith('237') && !normalized.startsWith('+237')) {
    normalized = '+' + normalized;
  }
  
  if (/^[6789]/.test(normalized) && !normalized.startsWith('+') && !normalized.startsWith('237')) {
    normalized = '+237' + normalized;
  }
  
  return normalized;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const user = url.searchParams.get('user');
  
  if (!user) {
    return new Response('Paramètre user requis', { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      let lastMessageCount = 0;
      
      const checkMessages = async () => {
        try {
          const normalizedUser = normalizePhone(user);
          // Utiliser une approche différente pour la requête OR
          const { data: messagesFrom, error: errorFrom } = await supabase
            .from('messages')
            .select('*')
            .eq('from_user', normalizedUser);

          const { data: messagesTo, error: errorTo } = await supabase
            .from('messages')
            .select('*')
            .eq('to_user', normalizedUser);

          if (errorFrom || errorTo) {
            console.error('Erreur récupération messages:', errorFrom || errorTo);
            return;
          }

          const messages = [...(messagesFrom || []), ...(messagesTo || [])];
          messages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          // Transformer les données pour correspondre au format attendu par le frontend
          const transformedMessages = messages.map(msg => ({
            id: msg.id,
            from: msg.from_user,
            to: msg.to_user,
            message: msg.message,
            date: msg.date,
            lu: msg.lu
          }));

          const userMessages = transformedMessages || [];
          
          if (userMessages.length !== lastMessageCount) {
            controller.enqueue(`data: ${JSON.stringify(userMessages)}\n\n`);
            lastMessageCount = userMessages.length;
          }
        } catch (error) {
          console.error('Erreur SSE:', error);
        }
      };
      
      // Check immediately
      checkMessages();
      
      // Check every 25ms (ultra-rapide)
      const interval = setInterval(checkMessages, 25);
      
      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 