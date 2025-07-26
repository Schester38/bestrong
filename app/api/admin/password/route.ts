import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const adminFilePath = path.join(process.cwd(), 'data', 'admin.json');

function loadAdmin() {
  try {
    if (fs.existsSync(adminFilePath)) {
      const data = fs.readFileSync(adminFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erreur chargement admin:', error);
  }
  return { passwordHash: '' };
}

function saveAdmin(admin: { passwordHash: string }) {
  try {
    const dataDir = path.dirname(adminFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(adminFilePath, JSON.stringify(admin, null, 2));
  } catch (error) {
    console.error('Erreur sauvegarde admin:', error);
  }
}

export async function POST(request: NextRequest) {
  const url = request.nextUrl.pathname;
  const body = await request.json();
  const admin = loadAdmin();

  if (url.endsWith('/login')) {
    // Vérification du mot de passe
    const { password } = body;
    if (!password) return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 });
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (valid) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
    }
  } else if (url.endsWith('/change')) {
    // Changement de mot de passe
    const { oldPassword, newPassword } = body;
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }
    const valid = await bcrypt.compare(oldPassword, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Ancien mot de passe incorrect' }, { status: 401 });
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    saveAdmin({ passwordHash: newHash });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Route non supportée' }, { status: 404 });
} 