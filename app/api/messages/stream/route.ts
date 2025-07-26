import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase côté serveur
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
          const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .or(`from.eq.${normalizedUser},to.eq.${normalizedUser}`)
            .order('date', { ascending: true });

          if (error) {
            console.error('Erreur récupération messages:', error);
            return;
          }

          const userMessages = messages || [];
          
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