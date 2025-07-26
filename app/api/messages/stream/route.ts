import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

const messagesFilePath = path.join(process.cwd(), 'data', 'messages.json');

function loadMessages() {
  try {
    if (fs.existsSync(messagesFilePath)) {
      const data = fs.readFileSync(messagesFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des messages:', error);
  }
  return [];
}

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
      
      const checkMessages = () => {
        try {
          const messages = loadMessages();
          const userMessages = messages.filter((m: any) => 
            normalizePhone(m.from) === normalizePhone(user) || 
            normalizePhone(m.to) === normalizePhone(user)
          );
          
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