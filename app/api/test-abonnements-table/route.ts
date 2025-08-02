import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  try {
    console.log('🔍 Test spécifique de la table abonnements...');
    
    const results: any = {
      tableExists: false,
      rlsEnabled: false,
      policies: [],
      accessTests: {},
      recommendations: []
    };

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test 1: Vérifier si la table existe dans information_schema
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'abonnements');
      
      results.tableExists = tableCheck && tableCheck.length > 0;
      console.log('Table existe dans information_schema:', results.tableExists);
    } catch (err) {
      console.log('Erreur vérification table:', err);
    }

    // Test 2: Vérifier RLS avec clé anonyme
    if (supabaseAnonKey) {
      const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
      
      try {
        const { data: anonTest, error: anonError } = await supabaseAnon
          .from('abonnements')
          .select('*')
          .limit(1);
        
        results.accessTests.anonKey = {
          success: !anonError,
          error: anonError?.message || null,
          data: anonTest
        };
      } catch (err) {
        results.accessTests.anonKey = {
          success: false,
          error: err instanceof Error ? err.message : String(err)
        };
      }
    }

    // Test 3: Vérifier avec clé de service
    if (supabaseServiceKey) {
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
      
      try {
        const { data: serviceTest, error: serviceError } = await supabaseService
          .from('abonnements')
          .select('*')
          .limit(1);
        
        results.accessTests.serviceKey = {
          success: !serviceError,
          error: serviceError?.message || null,
          data: serviceTest
        };
      } catch (err) {
        results.accessTests.serviceKey = {
          success: false,
          error: err instanceof Error ? err.message : String(err)
        };
      }
    }

    // Test 4: Vérifier les politiques RLS
    try {
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'abonnements');
      
      if (!policiesError && policies) {
        results.policies = policies;
        results.rlsEnabled = policies.length > 0;
      }
    } catch (err) {
      console.log('Erreur vérification politiques:', err);
    }

    // Générer des recommandations
    if (!results.tableExists) {
      results.recommendations.push('La table abonnements n\'existe pas. Créez-la d\'abord.');
    } else if (!results.accessTests.anonKey?.success && !results.accessTests.serviceKey?.success) {
      results.recommendations.push('La table existe mais les permissions RLS bloquent l\'accès.');
      results.recommendations.push('Exécutez le script fix_rls_permissions.sql dans le SQL Editor.');
    } else if (results.accessTests.serviceKey?.success && !results.accessTests.anonKey?.success) {
      results.recommendations.push('La clé de service fonctionne mais pas la clé anonyme.');
      results.recommendations.push('Vérifiez les politiques RLS pour les utilisateurs anonymes.');
    } else if (results.accessTests.anonKey?.success) {
      results.recommendations.push('✅ Tout fonctionne ! La table est accessible.');
    }

    // Test 5: Essayer d'insérer une donnée de test
    if (results.accessTests.serviceKey?.success) {
      try {
        const testData = {
          id: 'test-api-' + Date.now(),
          user_id: 'test-user-api',
          type: 'dashboard_access',
          status: 'active',
          start_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase
          .from('abonnements')
          .insert(testData);

        if (!insertError) {
          // Supprimer la donnée de test
          await supabase
            .from('abonnements')
            .delete()
            .eq('id', testData.id);

          results.accessTests.insertTest = {
            success: true,
            message: 'Insertion et suppression réussies'
          };
        } else {
          results.accessTests.insertTest = {
            success: false,
            error: insertError.message
          };
        }
      } catch (err) {
        results.accessTests.insertTest = {
          success: false,
          error: err instanceof Error ? err.message : String(err)
        };
      }
    }

    console.log('📊 Résultats du test abonnements:', results);

    return NextResponse.json({
      success: true,
      message: 'Test de la table abonnements terminé',
      results
    });

  } catch (error) {
    console.error('❌ Erreur lors du test abonnements:', error);
    return NextResponse.json({ 
      error: 'Erreur lors du test de la table abonnements',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 