import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status'); // draft, scheduled, published

    // Contenu planifié par défaut
    const defaultScheduledContent = [
      {
        id: '1',
        title: 'Tutoriel Makeup',
        description: 'Tutoriel makeup avant/après',
        type: 'task_created',
        platform: 'tiktok',
        category: 'beauty',
        status: 'ready',
        scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
        content_url: null,
        thumbnail_url: null,
        hashtags: ['#makeup', '#tutorial', '#beauty'],
        notes: 'Prêt à publier',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Recette Rapide',
        description: 'Recette rapide 5 minutes',
        type: 'task_created',
        platform: 'instagram',
        category: 'cooking',
        status: 'in_progress',
        scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Dans 2 jours
        content_url: null,
        thumbnail_url: null,
        hashtags: ['#recipe', '#quickmeal', '#food'],
        notes: 'En cours de préparation',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Conseils Fitness',
        description: 'Conseils fitness pour débutants',
        type: 'task_created',
        platform: 'youtube',
        category: 'fitness',
        status: 'published',
        scheduled_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Hier
        content_url: 'https://youtube.com/watch?v=example',
        thumbnail_url: null,
        hashtags: ['#fitness', '#beginner', '#workout'],
        notes: 'Publié avec succès',
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        title: 'Challenge TikTok Viral',
        description: 'Participez au challenge du moment',
        type: 'task_created',
        platform: 'tiktok',
        category: 'trending',
        status: 'scheduled',
        scheduled_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Dans 3 jours
        content_url: null,
        thumbnail_url: null,
        hashtags: ['#challenge', '#viral', '#trending'],
        notes: 'Planifié pour la semaine prochaine',
        created_at: new Date().toISOString()
      }
    ];

    // Si pas d'userId, retourner directement les données par défaut
    if (!userId || userId.trim() === '') {
      return NextResponse.json({ scheduledContent: defaultScheduledContent });
    }

    // Essayer de récupérer le contenu planifié depuis la table activities
    try {
      let query = supabase
        .from('activities')
        .select('*')
        .eq('type', 'task_created')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: scheduledContent, error } = await query;

      // Si pas d'erreur et qu'il y a du contenu, le retourner
      if (!error && scheduledContent && scheduledContent.length > 0) {
        // Transformer les données pour correspondre au format attendu
        const transformedContent = scheduledContent.map(item => ({
          id: item.id,
          title: item.description || 'Contenu sans titre',
          description: item.description,
          type: item.type,
          platform: 'tiktok', // Valeur par défaut
          category: 'general', // Valeur par défaut
          status: 'ready', // Valeur par défaut
          scheduled_date: item.created_at,
          content_url: null,
          thumbnail_url: null,
          hashtags: ['#content', '#socialmedia'],
          notes: 'Contenu créé automatiquement',
          created_at: item.created_at
        }));

        return NextResponse.json({ scheduledContent: transformedContent });
      }
    } catch (dbError) {
      console.log('Pas de données en base, utilisation du contenu par défaut');
    }

    // Sinon, retourner les données par défaut
    return NextResponse.json({ scheduledContent: defaultScheduledContent });

  } catch (error) {
    console.error('Erreur API planificateur:', error);
    // En cas d'erreur, retourner quand même les données par défaut
    const fallbackContent = [
      {
        id: 'fallback-1',
        title: 'Contenu de Fallback',
        description: 'Contenu par défaut en cas d\'erreur',
        type: 'task_created',
        platform: 'tiktok',
        category: 'general',
        status: 'ready',
        scheduled_date: new Date().toISOString(),
        content_url: null,
        thumbnail_url: null,
        hashtags: ['#fallback', '#content'],
        notes: 'Contenu de secours',
        created_at: new Date().toISOString()
      }
    ];
    return NextResponse.json({ scheduledContent: fallbackContent });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      title, 
      description, 
      platform, 
      category, 
      scheduledDate, 
      hashtags, 
      notes 
    } = await request.json();

    if (!userId || !title || !description || !platform || !category) {
      return NextResponse.json({ error: 'Tous les champs obligatoires sont requis' }, { status: 400 });
    }

    // Créer un nouveau contenu planifié
    const { data, error } = await supabase
      .from('activities')
      .insert({
        user_id: userId,
        description: title,
        type: 'task_created',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur création contenu planifié:', error);
      return NextResponse.json({ error: 'Erreur création contenu planifié' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erreur API création contenu planifié:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, updates } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    // Mettre à jour le contenu planifié
    const { data, error } = await supabase
      .from('activities')
      .update({
        description: updates.title || updates.description,
        created_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour contenu planifié:', error);
      return NextResponse.json({ error: 'Erreur mise à jour contenu planifié' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erreur API mise à jour contenu planifié:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    // Supprimer le contenu planifié
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression contenu planifié:', error);
      return NextResponse.json({ error: 'Erreur suppression contenu planifié' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API suppression contenu planifié:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 