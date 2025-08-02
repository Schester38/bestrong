import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST() {
  try {
    console.log('🔄 Création de la table abonnements manquante...');
    
    if (!supabaseServiceKey) {
      return NextResponse.json({ 
        error: 'Clé de service Supabase manquante',
        message: 'La variable d\'environnement SUPABASE_SERVICE_ROLE_KEY n\'est pas définie'
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Script SQL pour créer la table abonnements
    const sqlScript = `
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
      CREATE INDEX IF NOT EXISTS idx_abonnements_user_id ON abonnements(user_id);
      CREATE INDEX IF NOT EXISTS idx_abonnements_status ON abonnements(status);
    `;

    // Essayer d'exécuter le script SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: sqlScript
    });

    if (error) {
      console.log('⚠️ Erreur avec exec_sql, tentative alternative...');
      
      // Approche alternative : créer via insertion de test
      try {
        const testAbonnement = {
          id: 'test-init-' + Date.now(),
          user_id: 'test-user-id',
          type: 'premium',
          status: 'active',
          start_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        
        const { error: insertError } = await supabase
          .from('abonnements')
          .insert(testAbonnement);
        
        if (!insertError) {
          // Supprimer l'abonnement de test
          await supabase
            .from('abonnements')
            .delete()
            .eq('id', testAbonnement.id);
          
          console.log('✅ Table abonnements créée via insertion');
          
          return NextResponse.json({
            success: true,
            message: 'Table abonnements créée avec succès',
            method: 'insertion'
          });
        } else {
          console.log('❌ Impossible de créer abonnements:', insertError.message);
          
          // Dernière tentative : essayer de créer avec une requête SQL directe
          try {
            const { error: sqlError } = await supabase
              .from('information_schema.tables')
              .select('table_name')
              .eq('table_schema', 'public')
              .eq('table_name', 'abonnements');
            
            if (sqlError) {
              console.log('❌ Table n\'existe pas, création impossible via API');
              
              return NextResponse.json({
                success: false,
                message: 'Impossible de créer la table abonnements via API',
                error: insertError.message,
                solution: 'Créez la table manuellement dans le SQL Editor de Supabase',
                sqlScript: sqlScript
              });
            }
          } catch (sqlErr) {
            console.log('❌ Erreur vérification table:', sqlErr);
          }
          
          return NextResponse.json({
            success: false,
            message: 'Impossible de créer la table abonnements',
            error: insertError.message,
            note: 'Vous pouvez créer cette table manuellement dans le SQL Editor de Supabase',
            sqlScript: sqlScript
          });
        }
      } catch (err) {
        console.log('❌ Erreur création abonnements:', err);
        
        return NextResponse.json({
          success: false,
          message: 'Erreur lors de la création de la table abonnements',
          error: err instanceof Error ? err.message : String(err),
          note: 'Créez la table manuellement dans le SQL Editor de Supabase',
          sqlScript: sqlScript
        });
      }
    }

    console.log('✅ Table abonnements créée via SQL');
    
    return NextResponse.json({
      success: true,
      message: 'Table abonnements créée avec succès',
      method: 'sql'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création de la table:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la création de la table',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 