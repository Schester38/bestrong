import { NextRequest, NextResponse } from 'next/server';
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

function saveMessages(messages) {
  try {
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des messages:', error);
  }
}

// Ajouter une fonction de normalisation des numéros de téléphone
function normalizePhone(phone: string): string {
  // Enlever tous les espaces et caractères spéciaux
  let normalized = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  // Si le numéro commence par 237, ajouter le +
  if (normalized.startsWith('237') && !normalized.startsWith('+237')) {
    normalized = '+' + normalized;
  }
  
  // Si le numéro commence par 6, 7, 8, 9 (numéro camerounais) sans indicatif, ajouter +237
  if (/^[6789]/.test(normalized) && !normalized.startsWith('+') && !normalized.startsWith('237')) {
    normalized = '+237' + normalized;
  }
  
  // Debug: afficher la normalisation
  console.log(`normalizePhone: "${phone}" -> "${normalized}"`);
  
  return normalized;
}

// GET /api/messages?user=xxx
export async function GET(request: NextRequest) {
  console.log('API messages GET appelée');
  const url = new URL(request.url);
  const user = url.searchParams.get('user');
  console.log('Paramètre user:', user);
  if (!user) return NextResponse.json({ error: 'Paramètre user requis' }, { status: 400 });
  
  const normalizedUser = normalizePhone(user);
  console.log('User normalisé:', normalizedUser);
  
  const messages = loadMessages();
  console.log('Messages chargés:', messages.length);
  
  // Normaliser tous les numéros dans les messages et filtrer
  const filtered = messages.filter(m => {
    const fromNormalized = normalizePhone(m.from);
    const toNormalized = normalizePhone(m.to);
    const isMatch = fromNormalized === normalizedUser || toNormalized === normalizedUser;
    console.log(`Message ${m.id}: from="${m.from}" (${fromNormalized}) to="${m.to}" (${toNormalized}) - Match: ${isMatch}`);
    return isMatch;
  });
  
  console.log('Messages filtrés:', filtered.length);
  return NextResponse.json(filtered);
}

// POST /api/messages
export async function POST(request: NextRequest) {
  try {
    const { from, to, message } = await request.json();
    if (!from || !to || !message) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }
    const messages = loadMessages();
    const newMsg = {
      id: Date.now().toString(),
      from,
      to,
      message,
      date: new Date().toISOString()
    };
    messages.push(newMsg);
    saveMessages(messages);
    return NextResponse.json(newMsg, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du message' }, { status: 500 });
  }
} 