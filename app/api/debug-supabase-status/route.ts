import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  try {
    console.log('🔍 Diagnostic complet de Supabase...');
    
    const results: any = {
      environment: {
        url: supabaseUrl ? 'Définie' : 'Manquante',
        anonKey: supabaseAnonKey ? 'Définie' : 'Manquante',
        serviceKey: supabaseServiceKey ? 'Définie' : 'Manquante'
      },
      connection: {},
      tables: {},
      data: {},
      cache: {}
    };

    // Test de connexion avec clé anonyme
    if (supabaseAnonKey) {
      const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
      
      try {
        const { data: connectionTest, error: connectionError } = await supabaseAnon
          .from('users')
          .select('count')
          .limit(1);
        
        results.connection.anon = {
          success: !connectionError,
          error: connectionError?.message || null,
          data: connectionTest
        };
      } catch (err) {
        results.connection.anon = {
          success: false,
          error: err instanceof Error ? err.message : String(err)
        };
      }
    }

    // Test de connexion avec clé de service
    if (supabaseServiceKey) {
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
      
      try {
        const { data: serviceTest, error: serviceError } = await supabaseService
          .from('users')
          .select('count')
          .limit(1);
        
        results.connection.service = {
          success: !serviceError,
          error: serviceError?.message || null,
          data: serviceTest
        };
      } catch (err) {
        results.connection.service = {
          success: false,
          error: err instanceof Error ? err.message : String(err)
        };
      }
    }

    // Test de toutes les tables principales
    const tablesToTest = [
      'users', 'tasks', 'task_completions', 'messages', 
      'notifications', 'suggestions', 'activities', 
      'boost_orders', 'app_stats', 'abonnements'
    ];

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Vérifier d'abord si la table abonnements existe dans information_schema
    try {
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'abonnements');
      
      console.log('Vérification table abonnements:', tableExists, tableCheckError);
    } catch (err) {
      console.log('Erreur vérification table abonnements:', err);
    }

    for (const tableName of tablesToTest) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(5);
        
        results.tables[tableName] = {
          exists: !error,
          error: error?.message || null,
          count: data?.length || 0,
          sample: data?.[0] ? Object.keys(data[0]) : null,
          hasData: data && data.length > 0
        };
      } catch (err) {
        results.tables[tableName] = {
          exists: false,
          error: err instanceof Error ? err.message : String(err),
          count: 0,
          sample: null,
          hasData: false
        };
      }
    }

    // Test des données spécifiques
    try {
      const { data: userCount, error: userCountError } = await supabase
        .from('users')
        .select('*', { count: 'exact' });
      
      results.data.userCount = {
        success: !userCountError,
        count: userCount?.length || 0,
        error: userCountError?.message || null
      };
    } catch (err) {
      results.data.userCount = {
        success: false,
        count: 0,
        error: err instanceof Error ? err.message : String(err)
      };
    }

    // Test des statistiques
    try {
      const { data: stats, error: statsError } = await supabase
        .from('app_stats')
        .select('*');
      
      results.data.stats = {
        success: !statsError,
        data: stats,
        error: statsError?.message || null
      };
    } catch (err) {
      results.data.stats = {
        success: false,
        data: null,
        error: err instanceof Error ? err.message : String(err)
      };
    }

    // Vérification du cache local
    if (typeof window !== 'undefined') {
      results.cache.localStorage = {
        currentUser: localStorage.getItem('currentUser'),
        hasData: localStorage.getItem('currentUser') !== null
      };
    }

    // Analyse des résultats
    const workingTables = Object.entries(results.tables)
      .filter(([_, table]: [string, any]) => table.exists)
      .map(([name, _]) => name);

    const tablesWithData = Object.entries(results.tables)
      .filter(([_, table]: [string, any]) => table.hasData)
      .map(([name, _]) => name);

    results.analysis = {
      totalTables: tablesToTest.length,
      workingTables: workingTables.length,
      tablesWithData: tablesWithData.length,
      workingTableNames: workingTables,
      tablesWithDataNames: tablesWithData,
      siteShouldWork: workingTables.length > 0,
      hasRealData: tablesWithData.length > 0
    };

    console.log('📊 Résultats du diagnostic:', results.analysis);

    return NextResponse.json({
      success: true,
      message: 'Diagnostic complet effectué',
      results,
      summary: {
        siteFunctional: results.analysis.siteShouldWork,
        hasRealData: results.analysis.hasRealData,
        workingTables: results.analysis.workingTables,
        tablesWithData: results.analysis.tablesWithData
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    return NextResponse.json({ 
      error: 'Erreur lors du diagnostic',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 