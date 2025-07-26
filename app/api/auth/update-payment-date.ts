import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    let users: Record<string, unknown>[] = [];
    if (fs.existsSync(usersFilePath)) {
      users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    }
    const idx = users.findIndex((u: Record<string, unknown>) => u && typeof u === 'object' && 'id' in u && u.id === userId);
    if (idx === -1) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    (users[idx] as Record<string, unknown>).dateDernierPaiement = new Date().toISOString();
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 