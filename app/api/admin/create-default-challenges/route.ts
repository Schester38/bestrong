import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables Supabase manquantes dans create-default-challenges:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey
  });
}

const supabase = createClient(
  supabaseUrl || 'https://jdemxmntzsetwrhzzknl.supabase.co',
  supabaseAnonKey || 'sb_publishable_W8PK0Nvw_TBQkPfvJKoOTw_CYTRacwN'
);

export async function POST(request: NextRequest) {
  try {
    console.log('=== CRÉATION DÉFIS AUTOMATIQUE ===');

    // Étape 1: Vérifier la connexion à la table
    console.log('1. Test connexion table activities...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('activities')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erreur connexion table:', tableError);
      return NextResponse.json({ 
        error: 'Erreur connexion table activities: ' + tableError.message 
      }, { status: 500 });
    }
    console.log('✅ Connexion table OK');

    // Étape 2: Vérifier les défis existants
    console.log('2. Vérification défis existants...');
    const { data: existingChallenges, error: checkError } = await supabase
      .from('activities')
      .select('id')
      .eq('type', 'task_created')
      .limit(1);

    if (checkError) {
      console.error('❌ Erreur vérification défis:', checkError);
      return NextResponse.json({ 
        error: 'Erreur vérification défis existants: ' + checkError.message 
      }, { status: 500 });
    }

    if (existingChallenges && existingChallenges.length > 0) {
      console.log('✅ Défis existent déjà');
      return NextResponse.json({ 
        message: 'Des défis existent déjà. Utilisez l\'interface admin pour les gérer.',
        existing: true
      });
    }
    console.log('✅ Aucun défi existant');

    // Étape 3: Récupérer un utilisateur admin
    console.log('3. Récupération utilisateur admin...');
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, phone, pseudo')
      .limit(1);

    if (userError || !existingUser || existingUser.length === 0) {
      console.error('❌ Erreur utilisateurs:', userError);
      return NextResponse.json({ 
        error: 'Aucun utilisateur trouvé: ' + (userError?.message || 'Table users vide') 
      }, { status: 500 });
    }
    console.log('✅ Utilisateur trouvé:', existingUser[0]);

    const adminUser = existingUser[0];

    // Étape 4: Créer les défis avec le type autorisé
    console.log('4. Création des défis...');
    const defaultChallenges = [
      {
        id: (Date.now() + 1).toString(),
        user_id: adminUser.id,
        user_phone: adminUser.phone,
        user_pseudo: adminUser.pseudo || 'Admin',
        type: 'task_created',
        description: '🎯 Créateur du jour - Publiez 3 contenus de qualité',
        created_at: new Date().toISOString()
      },
      {
        id: (Date.now() + 2).toString(),
        user_id: adminUser.id,
        user_phone: adminUser.phone,
        user_pseudo: adminUser.pseudo || 'Admin',
        type: 'task_created',
        description: '❤️ Engagement quotidien - Obtenez 100 likes sur vos contenus',
        created_at: new Date().toISOString()
      },
      {
        id: (Date.now() + 3).toString(),
        user_id: adminUser.id,
        user_phone: adminUser.phone,
        user_pseudo: adminUser.pseudo || 'Admin',
        type: 'task_created',
        description: '📈 Stratège social - Gagnez 500 nouveaux followers',
        created_at: new Date().toISOString()
      },
      {
        id: (Date.now() + 4).toString(),
        user_id: adminUser.id,
        user_phone: adminUser.phone,
        user_pseudo: adminUser.pseudo || 'Admin',
        type: 'task_created',
        description: '🔥 Viral Hunter - Créez un contenu qui dépasse 10k vues',
        created_at: new Date().toISOString()
      },
      {
        id: (Date.now() + 5).toString(),
        user_id: adminUser.id,
        user_phone: adminUser.phone,
        user_pseudo: adminUser.pseudo || 'Admin',
        type: 'task_created',
        description: '⭐ Influenceur confirmé - Atteignez 10k followers',
        created_at: new Date().toISOString()
      },
      {
        id: (Date.now() + 6).toString(),
        user_id: adminUser.id,
        user_phone: adminUser.phone,
        user_pseudo: adminUser.pseudo || 'Admin',
        type: 'task_created',
        description: '🎵 Challenge TikTok - Participez à 5 challenges populaires',
        created_at: new Date().toISOString()
      }
    ];

    const insertedChallenges = [];
    let successCount = 0;

    for (let i = 0; i < defaultChallenges.length; i++) {
      const challenge = defaultChallenges[i];
      console.log(`Insertion défi ${i + 1}/${defaultChallenges.length}...`);
      
      try {
        const { data: insertedChallenge, error: insertError } = await supabase
          .from('activities')
          .insert(challenge)
          .select()
          .single();

        if (insertError) {
          console.error(`❌ Erreur défi ${i + 1}:`, insertError);
          continue;
        }

        if (insertedChallenge) {
          insertedChallenges.push(insertedChallenge);
          successCount++;
          console.log(`✅ Défi ${i + 1} créé: ${challenge.description}`);
        }
      } catch (error) {
        console.error(`❌ Exception défi ${i + 1}:`, error);
        continue;
      }
    }

    console.log(`=== RÉSULTAT: ${successCount}/${defaultChallenges.length} défis créés ===`);

    if (successCount === 0) {
      return NextResponse.json({ 
        error: 'Aucun défi créé. Vérifiez les logs du serveur.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: `🎉 ${successCount} défis créés avec succès !`,
      challenges: insertedChallenges
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur: ' + (error instanceof Error ? error.message : 'Erreur inconnue')
    }, { status: 500 });
  }
} 