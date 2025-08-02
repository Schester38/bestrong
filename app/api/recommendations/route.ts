import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: Récupérer les recommandations de contenu
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const platform = searchParams.get('platform') // tiktok, instagram, youtube
    const category = searchParams.get('category') // trending, viral, niche, educational
    const limit = parseInt(searchParams.get('limit') || '10')

    // Construire la requête
    let query = supabase
      .from('content_recommendations')
      .select('*')
      .eq('is_active', true)
      .order('trending_score', { ascending: false })
      .limit(limit)

    if (platform && platform !== 'all') {
      query = query.eq('platform', platform)
    }

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data: recommendations, error } = await query

    if (error) {
      console.error('Erreur récupération recommandations:', error)
      return NextResponse.json({ error: 'Erreur récupération recommandations' }, { status: 500 })
    }

    // Formater les données
    const formattedRecommendations = recommendations?.map(rec => ({
      id: rec.id,
      title: rec.title,
      description: rec.description,
      type: rec.type,
      platform: rec.platform,
      category: rec.category,
      difficulty: rec.difficulty,
      estimatedViews: rec.estimated_views,
      estimatedEngagement: rec.estimated_engagement,
      timeToCreate: rec.time_to_create,
      trendingScore: rec.trending_score,
      tags: rec.tags || [],
      hashtags: rec.hashtags || [],
      bestTimeToPost: rec.best_time_to_post,
      inspiration: rec.inspiration
    })) || []

    return NextResponse.json({ recommendations: formattedRecommendations })
  } catch (error) {
    console.error('Erreur API recommendations:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST: Créer une nouvelle recommandation (admin)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title,
      description,
      type,
      platform,
      category,
      difficulty,
      estimatedViews,
      estimatedEngagement,
      timeToCreate,
      trendingScore,
      tags,
      hashtags,
      bestTimeToPost,
      inspiration
    } = body

    // Validation des données
    if (!title || !description || !type || !platform || !category || !difficulty) {
      return NextResponse.json({ error: 'Tous les champs obligatoires sont requis' }, { status: 400 })
    }

    const newRecommendation = {
      title,
      description,
      type,
      platform,
      category,
      difficulty,
      estimated_views: estimatedViews || 0,
      estimated_engagement: estimatedEngagement || 0,
      time_to_create: timeToCreate || 0,
      trending_score: trendingScore || 0,
      tags: tags || [],
      hashtags: hashtags || [],
      best_time_to_post: bestTimeToPost,
      inspiration
    }

    const { data, error } = await supabase
      .from('content_recommendations')
      .insert(newRecommendation)
      .select()
      .single()

    if (error) {
      console.error('Erreur création recommandation:', error)
      return NextResponse.json({ error: 'Erreur création recommandation' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      recommendation: data,
      message: 'Recommandation créée avec succès'
    })
  } catch (error) {
    console.error('Erreur API recommendations POST:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT: Mettre à jour une recommandation (admin)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('content_recommendations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour recommandation:', error)
      return NextResponse.json({ error: 'Erreur mise à jour recommandation' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      recommendation: data,
      message: 'Recommandation mise à jour avec succès'
    })
  } catch (error) {
    console.error('Erreur API recommendations PUT:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE: Supprimer une recommandation (admin)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const { error } = await supabase
      .from('content_recommendations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur suppression recommandation:', error)
      return NextResponse.json({ error: 'Erreur suppression recommandation' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Recommandation supprimée avec succès'
    })
  } catch (error) {
    console.error('Erreur API recommendations DELETE:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 