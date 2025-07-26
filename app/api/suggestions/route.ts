import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const suggestionsFilePath = path.join(process.cwd(), 'data', 'suggestions.json');

function loadSuggestions() {
  try {
    if (fs.existsSync(suggestionsFilePath)) {
      const data = fs.readFileSync(suggestionsFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Erreur chargement suggestions:', e);
  }
  return [];
}

function saveSuggestions(suggestions: any[]) {
  try {
    fs.writeFileSync(suggestionsFilePath, JSON.stringify(suggestions, null, 2));
  } catch (e) {
    console.error('Erreur sauvegarde suggestions:', e);
  }
}

// POST: Ajout suggestion
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nom, numeroOuId, suggestion } = body;
    if (!nom || !numeroOuId || !suggestion) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }
    const suggestions = loadSuggestions();
    const newSuggestion = {
      id: Date.now().toString(),
      nom,
      numeroOuId,
      suggestion,
      date: new Date().toISOString()
    };
    suggestions.push(newSuggestion);
    saveSuggestions(suggestions);
    return NextResponse.json({ success: true, message: 'Suggestion envoyée avec succès.' });
  } catch (e) {
    return NextResponse.json({ error: 'Erreur lors de l\'envoi de la suggestion.' }, { status: 500 });
  }
}

// GET: Liste suggestions (admin)
export async function GET() {
  try {
    const suggestions = loadSuggestions();
    return NextResponse.json({ suggestions });
  } catch (e) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des suggestions.' }, { status: 500 });
  }
} 