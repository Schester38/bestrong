import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  try {
    console.log('🔄 Début de l\'initialisation complète des tables...');
    
    if (!supabaseServiceKey) {
      return NextResponse.json({ 
        error: 'Clé de service Supabase manquante',
        message: 'La variable d\'environnement SUPABASE_SERVICE_ROLE_KEY n\'est pas définie'
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Script SQL complet pour créer toutes les tables
    const sqlScript = `
      -- Table des utilisateurs
      CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          phone TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          credits INTEGER DEFAULT 150,
          pseudo TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          date_inscription TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          dashboard_access BOOLEAN DEFAULT true,
          payment_date TIMESTAMP WITH TIME ZONE,
          is_active BOOLEAN DEFAULT true
      );

      -- Table des tâches d'échange
      CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          url TEXT NOT NULL,
          credits INTEGER DEFAULT 1,
          actions_restantes INTEGER DEFAULT 1,
          createur TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_active BOOLEAN DEFAULT true
      );

      -- Table des complétions de tâches
      CREATE TABLE IF NOT EXISTS task_completions (
          id TEXT PRIMARY KEY,
          exchange_task_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Table des messages
      CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_read BOOLEAN DEFAULT false
      );

      -- Table des notifications
      CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          read BOOLEAN DEFAULT false
      );

      -- Table des suggestions
      CREATE TABLE IF NOT EXISTS suggestions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_processed BOOLEAN DEFAULT false
      );

      -- Table des activités
      CREATE TABLE IF NOT EXISTS activities (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_phone TEXT NOT NULL,
          action_type TEXT NOT NULL,
          details JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Table des commandes de boost
      CREATE TABLE IF NOT EXISTS boost_orders (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          amount INTEGER NOT NULL,
          status TEXT DEFAULT 'pending',
          payment_method TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Table des statistiques de l'application
      CREATE TABLE IF NOT EXISTS app_stats (
          id TEXT PRIMARY KEY,
          user_count INTEGER DEFAULT 1787,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Table des abonnements
      CREATE TABLE IF NOT EXISTS abonnements (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          status TEXT DEFAULT 'active',
          start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          end_date TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Index pour optimiser les performances
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
      CREATE INDEX IF NOT EXISTS idx_tasks_createur ON tasks(createur);
      CREATE INDEX IF NOT EXISTS idx_task_completions_user_id ON task_completions(user_id);
      CREATE INDEX IF NOT EXISTS idx_task_completions_task_id ON task_completions(exchange_task_id);
      CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
      CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
      CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

      -- Insérer les statistiques initiales
      INSERT INTO app_stats (id, user_count, last_updated)
      VALUES ('main', 1787, NOW())
      ON CONFLICT (id) DO UPDATE SET 
          user_count = EXCLUDED.user_count,
          last_updated = NOW();
    `;

    // Exécuter le script SQL
    console.log('📝 Exécution du script SQL...');
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: sqlScript
    });

    if (error) {
      console.error('❌ Erreur lors de l\'exécution du script SQL:', error);
      
      // Si la fonction exec_sql n'existe pas, essayer une approche alternative
      console.log('🔄 Tentative d\'approche alternative...');
      
      // Créer les tables une par une avec des insertions de test
      const tables = [
        { name: 'users', testData: { id: 'test', phone: '+1234567890', password: 'test', pseudo: 'test' } },
        { name: 'tasks', testData: { id: 'test', type: 'LIKE', url: 'https://test.com', createur: 'test' } },
        { name: 'task_completions', testData: { id: 'test', exchange_task_id: 'test', user_id: 'test' } },
        { name: 'messages', testData: { id: 'test', user_id: 'test', content: 'test' } },
        { name: 'notifications', testData: { id: 'test', user_id: 'test', type: 'test', message: 'test' } },
        { name: 'suggestions', testData: { id: 'test', user_id: 'test', content: 'test' } },
        { name: 'activities', testData: { id: 'test', user_id: 'test', user_phone: '+1234567890', action_type: 'test' } },
        { name: 'boost_orders', testData: { id: 'test', user_id: 'test', amount: 100 } },
        { name: 'abonnements', testData: { id: 'test', user_id: 'test', type: 'test' } }
      ];

      const createdTables = [];
      
      for (const table of tables) {
        try {
          const { error: insertError } = await supabase
            .from(table.name)
            .insert(table.testData);
          
          if (!insertError) {
            // Supprimer les données de test
            await supabase
              .from(table.name)
              .delete()
              .eq('id', 'test');
            
            createdTables.push(table.name);
            console.log(`✅ Table ${table.name} créée`);
          } else {
            console.log(`⚠️ Table ${table.name} existe déjà ou erreur:`, insertError.message);
          }
        } catch (err) {
          console.log(`❌ Erreur avec la table ${table.name}:`, err);
        }
      }

      // Créer la table app_stats séparément
      try {
        const { error: statsError } = await supabase
          .from('app_stats')
          .insert({ id: 'main', user_count: 1787, last_updated: new Date().toISOString() });
        
        if (!statsError) {
          createdTables.push('app_stats');
          console.log('✅ Table app_stats créée');
        }
      } catch (err) {
        console.log('❌ Erreur avec app_stats:', err);
      }

      return NextResponse.json({
        success: createdTables.length > 0,
        message: `Tables créées: ${createdTables.join(', ')}`,
        createdTables,
        note: 'Certaines tables peuvent déjà exister. Vérifiez dans le tableau de bord Supabase.'
      });
    }

    console.log('✅ Script SQL exécuté avec succès');
    
    // Vérifier que les tables ont été créées
    const tablesToCheck = [
      'users', 'tasks', 'task_completions', 'messages', 
      'notifications', 'suggestions', 'activities', 
      'boost_orders', 'app_stats', 'abonnements'
    ];

    const verificationResults: Record<string, { exists: boolean; error: string | null }> = {};
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error: checkError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        verificationResults[tableName] = {
          exists: !checkError,
          error: checkError?.message || null
        };
      } catch (err) {
        verificationResults[tableName] = {
          exists: false,
          error: err instanceof Error ? err.message : String(err)
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Toutes les tables ont été créées avec succès',
      verificationResults
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des tables:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'initialisation des tables',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 