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

// Fonction de normalisation des numéros de téléphone
function normalizePhone(phone: string): string {
  if (!phone) return '';
  
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
  
  return normalized;
}

// POST /api/messages/delete
export async function POST(request: NextRequest) {
  try {
    const { user, contact } = await request.json();
    
    if (!user || !contact) {
      return NextResponse.json({ error: 'Utilisateur et contact requis' }, { status: 400 });
    }
    
    const normalizedUser = normalizePhone(user);
    const normalizedContact = normalizePhone(contact);
    
    // Charger tous les messages
    const allMessages = loadMessages();
    
    // Filtrer pour supprimer les messages entre ces deux utilisateurs
    const filteredMessages = allMessages.filter(m => {
      const fromNormalized = normalizePhone(m.from);
      const toNormalized = normalizePhone(m.to);
      
      return !(
        (fromNormalized === normalizedUser && toNormalized === normalizedContact) ||
        (fromNormalized === normalizedContact && toNormalized === normalizedUser)
      );
    });
    
    // Sauvegarder les messages filtrés
    saveMessages(filteredMessages);
    
    return NextResponse.json({ success: true, messagesRemoved: allMessages.length - filteredMessages.length });
  } catch (error) {
    console.error('Erreur lors de la suppression des messages:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression des messages' }, { status: 500 });
  }
}