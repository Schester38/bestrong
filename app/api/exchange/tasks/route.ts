import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { z } from "zod";
import { logActivity } from '../../../utils/activities';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase côté serveur - utiliser la clé anon pour l'instant
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Créer une tâche d'échange
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, url, actionsRestantes, createur } = createTaskSchema.parse(body);
    const credits = 1; // Crédit fixe de 1 pour toutes les tâches
    
    // Bypass admin : accès total
    if (createur === ADMIN_PHONE) {
      // Créer la tâche sans débiter de crédits
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
        console.error('Erreur création tâche admin:', error);
        return NextResponse.json({ error: "Erreur lors de la création de la tâche" }, { status: 500 });
      }

      // Transformer les données pour correspondre au format attendu par le frontend
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
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .or(`phone.eq.${createur},pseudo.eq.${createur}`)
      .maybeSingle();
    
    if (userError) {
      console.error('Erreur recherche utilisateur:', userError);
      return NextResponse.json({ error: "Erreur lors de la recherche de l'utilisateur" }, { status: 500 });
    }
    
    if (!user) {
      // Créer un nouvel utilisateur si pas trouvé
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
        console.error('Erreur création utilisateur:', createError);
        return NextResponse.json({ error: "Erreur lors de la création de l'utilisateur" }, { status: 500 });
      }

      user = createdUser;
    }
    
    const totalCost = 1; // Coût fixe de 1 crédit pour créer une tâche
    console.log(`Création de tâche: ${createur}, crédits actuels: ${user.credits}, coût total: ${totalCost}`);
    
    if (user.credits < totalCost) {
      console.log(`Crédits insuffisants: ${user.credits} < ${totalCost}`);
      return NextResponse.json({ error: "Crédits insuffisants" }, { status: 400 });
    }
    
    // Débiter les crédits
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        credits: user.credits - totalCost,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Erreur mise à jour crédits:', updateError);
      return NextResponse.json({ error: "Erreur lors de la mise à jour des crédits" }, { status: 500 });
    }

    console.log(`Crédits débités: ${user.credits - totalCost} restants pour ${createur}`);
    
    // Créer la tâche
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
      console.error('Erreur création tâche:', taskError);
      return NextResponse.json({ error: "Erreur lors de la création de la tâche" }, { status: 500 });
    }

    // Enregistrer l'activité de création de tâche
    await logActivity({
      userId: user.id,
      userPhone: user.phone,
      userPseudo: user.pseudo,
      type: 'task_created',
      description: `Création d'une tâche ${type} pour ${actionsRestantes} actions`,
      details: { taskId: newTask.id, taskType: type, actionsCount: actionsRestantes, creditsPerAction: credits },
      credits: totalCost
    });
    
          // Transformer les données pour correspondre au format attendu par le frontend
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
  } catch (error) {
    console.error('Erreur POST /api/exchange/tasks:', error);
    return NextResponse.json({ error: "Erreur lors de la création de la tâche", details: error }, { status: 400 });
  }
}

// Lister toutes les tâches d'échange
export async function GET() {
  try {
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('Erreur récupération tâches:', tasksError);
      return NextResponse.json({ error: "Erreur lors de la récupération des tâches" }, { status: 500 });
    }

    // Récupérer les complétions pour chaque tâche
    const tasksWithCompletions = await Promise.all(tasks.map(async (task) => {
      const { data: completions, error: completionsError } = await supabase
        .from('task_completions')
        .select('*')
        .eq('exchange_task_id', task.id);

      if (completionsError) {
        console.error('Erreur récupération complétions pour tâche', task.id, ':', completionsError);
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
    }));
    
    return NextResponse.json(tasksWithCompletions);
  } catch (error) {
    console.error('Erreur GET /api/exchange/tasks:', error);
    return NextResponse.json({ error: "Erreur lors de la récupération des tâches" }, { status: 500 });
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

 