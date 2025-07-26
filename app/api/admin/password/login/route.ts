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

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (!password) return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 });
  const admin = loadAdmin();
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (valid) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
  }
} 