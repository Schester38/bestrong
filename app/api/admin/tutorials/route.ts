import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Récupérer tous les tutoriels
export async function GET(request: NextRequest) {
  try {
    const { data: tutorials, error } = await supabase
      .from('tutorials')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur récupération tutoriels:', error)
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
    }

    return NextResponse.json(tutorials || [])
  } catch (error) {
    console.error('Erreur API tutoriels:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer un nouveau tutoriel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, steps, targetAudience, isActive } = body

    // Validation
    if (!name || !description) {
      return NextResponse.json({ error: 'Nom et description requis' }, { status: 400 })
    }

    const tutorial = {
      name,
      description,
      steps: steps || [],
      target_audience: targetAudience || 'all',
      is_active: isActive !== undefined ? isActive : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('tutorials')
      .insert([tutorial])
      .select()
      .single()

    if (error) {
      console.error('Erreur création tutoriel:', error)
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur API création tutoriel:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour un tutoriel
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, steps, targetAudience, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const updates = {
      name,
      description,
      steps: steps || [],
      target_audience: targetAudience,
      is_active: isActive,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('tutorials')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour tutoriel:', error)
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur API mise à jour tutoriel:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un tutoriel
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const { error } = await supabase
      .from('tutorials')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur suppression tutoriel:', error)
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur API suppression tutoriel:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 