import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: Récupérer le contenu planifié d'un utilisateur
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const date = searchParams.get('date')
    const status = searchParams.get('status') // draft, scheduled, published, failed

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }

    // Construire la requête
    let query = supabase
      .from('scheduled_content')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })

    if (date) {
      query = query.eq('scheduled_date', date)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: scheduledContent, error } = await query

    if (error) {
      console.error('Erreur récupération contenu planifié:', error)
      return NextResponse.json({ error: 'Erreur récupération contenu planifié' }, { status: 500 })
    }

    // Formater les données
    const formattedContent = scheduledContent?.map(content => ({
      id: content.id,
      title: content.title,
      description: content.description,
      type: content.type,
      platform: content.platform,
      scheduledDate: content.scheduled_date,
      scheduledTime: content.scheduled_time,
      status: content.status,
      hashtags: content.hashtags || [],
      thumbnailUrl: content.thumbnail_url,
      notes: content.notes,
      autoPost: content.auto_post,
      publishedAt: content.published_at,
      createdAt: content.created_at,
      updatedAt: content.updated_at
    })) || []

    return NextResponse.json({ scheduledContent: formattedContent })
  } catch (error) {
    console.error('Erreur API scheduler:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST: Créer ou mettre à jour du contenu planifié
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      id,
      userId,
      title,
      description,
      type,
      platform,
      scheduledDate,
      scheduledTime,
      status,
      hashtags,
      thumbnailUrl,
      notes,
      autoPost
    } = body

    if (!userId || !title || !type || !platform || !scheduledDate || !scheduledTime) {
      return NextResponse.json({ error: 'Tous les champs obligatoires sont requis' }, { status: 400 })
    }

    const contentData = {
      title,
      description,
      type,
      platform,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      status: status || 'draft',
      hashtags: hashtags || [],
      thumbnail_url: thumbnailUrl,
      notes,
      auto_post: autoPost || false
    }

    let result

    if (id) {
      // Mise à jour
      const { data, error } = await supabase
        .from('scheduled_content')
        .update(contentData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Erreur mise à jour contenu planifié:', error)
        return NextResponse.json({ error: 'Erreur mise à jour contenu planifié' }, { status: 500 })
      }

      result = data
    } else {
      // Création
      const { data, error } = await supabase
        .from('scheduled_content')
        .insert({
          ...contentData,
          user_id: userId
        })
        .select()
        .single()

      if (error) {
        console.error('Erreur création contenu planifié:', error)
        return NextResponse.json({ error: 'Erreur création contenu planifié' }, { status: 500 })
      }

      result = data
    }

    return NextResponse.json({ 
      success: true, 
      content: result,
      message: id ? 'Contenu mis à jour avec succès' : 'Contenu planifié avec succès'
    })
  } catch (error) {
    console.error('Erreur API scheduler POST:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT: Mettre à jour le statut du contenu
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, userId, status, publishedAt } = body

    if (!id || !userId || !status) {
      return NextResponse.json({ error: 'ID, userId et status requis' }, { status: 400 })
    }

    const updateData: any = { status }
    
    if (status === 'published' && publishedAt) {
      updateData.published_at = publishedAt
    }

    const { data, error } = await supabase
      .from('scheduled_content')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour statut:', error)
      return NextResponse.json({ error: 'Erreur mise à jour statut' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      content: data,
      message: 'Statut mis à jour avec succès'
    })
  } catch (error) {
    console.error('Erreur API scheduler PUT:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE: Supprimer du contenu planifié
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!id || !userId) {
      return NextResponse.json({ error: 'ID et userId requis' }, { status: 400 })
    }

    const { error } = await supabase
      .from('scheduled_content')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Erreur suppression contenu planifié:', error)
      return NextResponse.json({ error: 'Erreur suppression contenu planifié' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Contenu supprimé avec succès'
    })
  } catch (error) {
    console.error('Erreur API scheduler DELETE:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 