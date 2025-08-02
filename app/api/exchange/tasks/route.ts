import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { z } from "zod";
import { logActivity } from '../../../utils/activities';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client Supabase côté serveur - utiliser la clé anon pour l'instant
const supabase = createClient(
  supabaseUrl || 'https://jdemxmntzsetwrhzzknl.supabase.co',
  supabaseAnonKey || 'sb_publishable_W8PK0Nvw_TBQkPfvJKoOTw_CYTRacwN'
);

// Fonction pour vérifier si Supabase est configuré
function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Interfaces
interface User {
  id: string;
  phone: string;
  password: string;
  credits: number;
  pseudo: string | null;
  created_at: string;
  updated_at: string;
}

interface ExchangeTask {
  id: string;
  type: string;
  url: string;
  credits: number;
  actions_restantes: number;
  createur: string;
  created_at: string;
  updated_at: string;
}

interface ExchangeTaskCompletion {
  id: string;
  exchange_task_id: string;
  user_id: string;
  completed_at: string;
}

const createTaskSchema = z.object({
  type: z.enum(["LIKE", "FOLLOW", "COMMENT", "SHARE"]),
  url: z.string().min(1, "Lien requis").refine(val => val.includes("tiktok.com"), {
    message: "Le lien doit contenir tiktok.com"
  }),
  actionsRestantes: z.number().min(1, "Au moins 1 action"),
  createur: z.string().min(1, "Nom du créateur requis"),
});

const ADMIN_PHONE = "+237699486146";

// Fonction pour initialiser les tables si nécessaire
async function ensureTablesExist() {
  try {
    // Vérifier si la table tasks existe
    const { data: tasksTest, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);
    
    if (tasksError && tasksError.message.includes('relation "tasks" does not exist')) {
      console.log('🔄 Table tasks manquante, initialisation...');
      
      // Créer la table tasks
      const { error: createTasksError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            url TEXT NOT NULL,
            credits INTEGER NOT NULL DEFAULT 1,
            actions_restantes INTEGER NOT NULL,
            createur TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (createTasksError) {
        console.error('❌ Erreur création table tasks:', createTasksError);
        throw new Error('Impossible de créer la table tasks');
      }
    }
    
    // Vérifier si la table task_completions existe
    const { data: completionsTest, error: completionsError } = await supabase
      .from('task_completions')
      .select('*')
      .limit(1);
    
    if (completionsError && completionsError.message.includes('relation "task_completions" does not exist')) {
      console.log('🔄 Table task_completions manquante, initialisation...');
      
      // Créer la table task_completions
      const { error: createCompletionsError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS task_completions (
            id TEXT PRIMARY KEY,
            exchange_task_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (createCompletionsError) {
        console.error('❌ Erreur création table task_completions:', createCompletionsError);
        throw new Error('Impossible de créer la table task_completions');
      }
    }
    
    console.log('✅ Tables vérifiées/initialisées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des tables:', error);
    throw error;
  }
}

// Créer une tâche d'échange
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Début création de tâche...');
    
    // Vérifier la configuration Supabase
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Configuration Supabase manquante, simulation de création de tâche');
      
      const body = await request.json();
      const { type, url, actionsRestantes, createur } = createTaskSchema.parse(body);
      
      // Simuler une création de tâche
      const simulatedTask = {
        id: Date.now().toString(),
        type,
        url,
        credits: 1,
        actionsRestantes,
        createur,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('✅ Tâche simulée créée:', simulatedTask);
      return NextResponse.json(simulatedTask, { status: 201 });
    }
    
    // S'assurer que les tables existent
    await ensureTablesExist();
    
    const body = await request.json();
    console.log('📝 Données reçues:', body);
    
    const { type, url, actionsRestantes, createur } = createTaskSchema.parse(body);
    const credits = 1; // Crédit fixe de 1 pour toutes les tâches
    
    console.log('✅ Validation des données réussie:', { type, url, actionsRestantes, createur });
    
    // Bypass admin : accès total
    if (createur === ADMIN_PHONE) {
      console.log('👑 Création de tâche admin...');
      
      const newTask = {
        id: Date.now().toString(),
        type,
        url,
        credits,
        actions_restantes: actionsRestantes,
        createur,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('tasks')
        .insert(newTask);

      if (error) {
        console.error('❌ Erreur création tâche admin:', error);
        return NextResponse.json({ 
          error: "Erreur lors de la création de la tâche", 
          details: error.message 
        }, { status: 500 });
      }

      console.log('✅ Tâche admin créée avec succès');
      
      const transformedTask = {
        id: newTask.id,
        type: newTask.type,
        url: newTask.url,
        credits: newTask.credits,
        actionsRestantes: newTask.actions_restantes,
        createur: newTask.createur,
        createdAt: newTask.created_at,
        updatedAt: newTask.updated_at
      };
      return NextResponse.json(transformedTask, { status: 201 });
    }
    
    // Trouver l'utilisateur par téléphone ou pseudo
    console.log('🔍 Recherche utilisateur:', createur);
    
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .or(`phone.eq.${createur},pseudo.eq.${createur}`)
      .maybeSingle();
    
    if (userError) {
      console.error('❌ Erreur recherche utilisateur:', userError);
      return NextResponse.json({ 
        error: "Erreur lors de la recherche de l'utilisateur",
        details: userError.message 
      }, { status: 500 });
    }
    
    if (!user) {
      console.log('👤 Utilisateur non trouvé, création...');
      
      const newUser = {
        id: Date.now().toString(),
        phone: createur,
        password: '',
        credits: 100,
        pseudo: createur,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (createError) {
        console.error('❌ Erreur création utilisateur:', createError);
        return NextResponse.json({ 
          error: "Erreur lors de la création de l'utilisateur",
          details: createError.message 
        }, { status: 500 });
      }

      user = createdUser;
      console.log('✅ Nouvel utilisateur créé:', user.id);
    } else {
      console.log('✅ Utilisateur trouvé:', user.id, 'Crédits:', user.credits);
    }
    
    const totalCost = 1; // Coût fixe de 1 crédit pour créer une tâche
    console.log(`💰 Vérification crédits: ${user.credits} >= ${totalCost}`);
    
    if (user.credits < totalCost) {
      console.log(`❌ Crédits insuffisants: ${user.credits} < ${totalCost}`);
      return NextResponse.json({ 
        error: "Crédits insuffisants",
        details: `Vous avez ${user.credits} crédits, il vous faut ${totalCost} crédit(s)`
      }, { status: 400 });
    }
    
    // Débiter les crédits
    console.log('💳 Débit des crédits...');
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        credits: user.credits - totalCost,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Erreur mise à jour crédits:', updateError);
      return NextResponse.json({ 
        error: "Erreur lors de la mise à jour des crédits",
        details: updateError.message 
      }, { status: 500 });
    }

    console.log(`✅ Crédits débités: ${user.credits - totalCost} restants`);
    
    // Créer la tâche
    console.log('📝 Création de la tâche...');
    const newTask = {
      id: Date.now().toString(),
      type,
      url,
      credits,
      actions_restantes: actionsRestantes,
      createur,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: taskError } = await supabase
      .from('tasks')
      .insert(newTask);

    if (taskError) {
      console.error('❌ Erreur création tâche:', taskError);
      return NextResponse.json({ 
        error: "Erreur lors de la création de la tâche",
        details: taskError.message 
      }, { status: 500 });
    }

    console.log('✅ Tâche créée avec succès:', newTask.id);

    // Enregistrer l'activité de création de tâche
    try {
    await logActivity({
      userId: user.id,
      userPhone: user.phone,
      userPseudo: user.pseudo,
      type: 'task_created',
      description: `Création d'une tâche ${type} pour ${actionsRestantes} actions`,
      details: { taskId: newTask.id, taskType: type, actionsCount: actionsRestantes, creditsPerAction: credits },
      credits: totalCost
    });
      console.log('✅ Activité enregistrée');
    } catch (activityError) {
      console.warn('⚠️ Erreur lors de l\'enregistrement de l\'activité:', activityError);
    }
    
      const transformedTask = {
        id: newTask.id,
        type: newTask.type,
        url: newTask.url,
        credits: newTask.credits,
        actionsRestantes: newTask.actions_restantes,
        createur: newTask.createur,
        createdAt: newTask.created_at,
        updatedAt: newTask.updated_at
      };
    
    console.log('🎉 Création de tâche terminée avec succès');
      return NextResponse.json(transformedTask, { status: 201 });
    
  } catch (error) {
    console.error('❌ Erreur POST /api/exchange/tasks:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: "Erreur lors de la création de la tâche", 
        details: error.message,
        type: error.constructor.name
      }, { status: 400 });
    } else {
      return NextResponse.json({ 
        error: "Erreur lors de la création de la tâche", 
        details: String(error)
      }, { status: 400 });
    }
  }
}

// Lister toutes les tâches d'échange
export async function GET() {
  try {
    console.log('🔄 Récupération des tâches...');
    
    // S'assurer que les tables existent
    try {
      await ensureTablesExist();
    } catch (tableError) {
      console.error('❌ Erreur lors de l\'initialisation des tables:', tableError);
      return NextResponse.json({ error: 'Erreur lors de l\'initialisation des tables' }, { status: 500 });
    }
    
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('❌ Erreur récupération tâches:', tasksError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des tâches' }, { status: 500 });
    }

    console.log(`✅ ${tasks?.length || 0} tâches récupérées`);

    // Récupérer les complétions pour chaque tâche
    const tasksWithCompletions = await Promise.all((tasks || []).map(async (task) => {
      try {
        const { data: completions, error: completionsError } = await supabase
          .from('task_completions')
          .select('*')
          .eq('exchange_task_id', task.id);

        if (completionsError) {
          console.error('⚠️ Erreur récupération complétions pour tâche', task.id, ':', completionsError);
        }

        return {
          id: task.id,
          type: task.type,
          url: task.url,
          credits: task.credits,
          actionsRestantes: task.actions_restantes, // Transformation snake_case vers camelCase
          createur: task.createur,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          completions: completions?.map(comp => ({
            id: comp.id,
            userId: comp.user_id,
            completedAt: comp.completed_at
          })) || []
        };
      } catch (error) {
        console.error('⚠️ Erreur lors du traitement de la tâche', task.id, ':', error);
        return {
          id: task.id,
          type: task.type,
          url: task.url,
          credits: task.credits,
          actionsRestantes: task.actions_restantes,
          createur: task.createur,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          completions: []
        };
      }
    }));
    
    console.log('✅ Tâches avec complétions préparées');
    return NextResponse.json(tasksWithCompletions);
  } catch (error) {
    console.error('❌ Erreur GET /api/exchange/tasks:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des tâches' }, { status: 500 });
  }
}

// Valider une action d'échange (ajouter une complétion)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { exchangeTaskId, userId } = z.object({
      exchangeTaskId: z.string().min(1),
      userId: z.string().min(1),
    }).parse(body);

    // Bypass admin : accès total
    if (userId === ADMIN_PHONE) {
      return NextResponse.json({ success: true });
    }

    // Vérifier si déjà complété
    const { data: existingCompletion, error: checkError } = await supabase
      .from('task_completions')
      .select('*')
      .eq('exchange_task_id', exchangeTaskId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Erreur vérification complétion:', checkError);
      return NextResponse.json({ error: "Erreur lors de la vérification" }, { status: 500 });
    }

    if (existingCompletion) {
      return NextResponse.json({ error: "Déjà complété par cet utilisateur" }, { status: 409 });
    }

    // Trouver la tâche
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', exchangeTaskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: "Tâche non trouvée" }, { status: 404 });
    }

    // Créer la complétion
    const newCompletion = {
      id: Date.now().toString(),
      exchange_task_id: exchangeTaskId,
      user_id: userId,
      completed_at: new Date().toISOString()
    };
    
    const { error: completionError } = await supabase
      .from('task_completions')
      .insert(newCompletion);

    if (completionError) {
      console.error('Erreur création complétion:', completionError);
      return NextResponse.json({ error: "Erreur lors de la création de la complétion" }, { status: 500 });
    }

    // Décrémenter actions_restantes
    const { error: updateTaskError } = await supabase
      .from('tasks')
      .update({ 
        actions_restantes: task.actions_restantes - 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id);

    if (updateTaskError) {
      console.error('Erreur mise à jour tâche:', updateTaskError);
      return NextResponse.json({ error: "Erreur lors de la mise à jour de la tâche" }, { status: 500 });
    }

    // Créditer l'utilisateur qui complète
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('pseudo', userId)
      .maybeSingle();

    if (userError) {
      console.error('Erreur recherche utilisateur:', userError);
      return NextResponse.json({ error: "Erreur lors de la recherche de l'utilisateur" }, { status: 500 });
    }

    const creditsEarned = 5; // Gain fixe de 5 crédits pour toute tâche effectuée

    if (!user) {
      // Créer un nouvel utilisateur
      const newUser = {
        id: Date.now().toString(),
        phone: userId,
        password: '',
        credits: 100 + creditsEarned,
        pseudo: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: createError } = await supabase
        .from('users')
        .insert(newUser);

      if (createError) {
        console.error('Erreur création utilisateur:', createError);
        return NextResponse.json({ error: "Erreur lors de la création de l'utilisateur" }, { status: 500 });
      }
    } else {
      // Mettre à jour les crédits
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ 
          credits: user.credits + creditsEarned,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateUserError) {
        console.error('Erreur mise à jour crédits utilisateur:', updateUserError);
        return NextResponse.json({ error: "Erreur lors de la mise à jour des crédits" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur PATCH /api/exchange/tasks:', error);
    return NextResponse.json({ error: "Erreur lors de la validation de l'action" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression tâche:', error);
      return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE /api/exchange/tasks:', error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}

 