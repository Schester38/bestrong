import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from "zod";
import { logActivity } from '../../../../../utils/activities';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables Supabase manquantes dans route.ts:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey
  });
}

// Client Supabase côté serveur
const supabase = createClient(
  supabaseUrl || 'https://jdemxmntzsetwrhzzknl.supabase.co',
  supabaseAnonKey || 'sb_publishable_W8PK0Nvw_TBQkPfvJKoOTw_CYTRacwN'
);

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
  verified: boolean;
  verification_date?: string;
  verification_result?: string;
}

// Fonction de vérification automatique selon le type de tâche
async function verifyTaskAction(task: ExchangeTask, userId: string): Promise<{ verified: boolean; result: string }> {
  try {
    console.log(`Vérification de la tâche ${task.id} (${task.type}) pour l'utilisateur ${userId}`);
    
    // Pour l'instant, retourner une vérification simple
    // On reviendra à un système plus sophistiqué plus tard
    return { verified: true, result: 'Action vérifiée automatiquement' };
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return { verified: false, result: 'Erreur lors de la vérification' };
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { userId } = z.object({
      userId: z.string().min(1),
    }).parse(body);

    const { id: exchangeTaskId } = await params;

    console.log(`🔍 Vérification si ${userId} a déjà complété la tâche ${exchangeTaskId}`);

    // Vérifier si déjà complété
    const { data: existingCompletion, error: checkError } = await supabase
      .from('task_completions')
      .select('*')
      .eq('exchange_task_id', exchangeTaskId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Erreur vérification complétion:', checkError);
      return NextResponse.json({ 
        error: "Erreur lors de la vérification", 
        details: checkError.message 
      }, { status: 500 });
    }

    if (existingCompletion) {
      return NextResponse.json({ 
        error: "Vous avez déjà effectué cette tâche ! Vous ne pouvez pas la faire deux fois." 
      }, { status: 409 });
    }

    console.log(`🔍 Recherche de la tâche ${exchangeTaskId}`);

    // Trouver la tâche
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', exchangeTaskId)
      .single();

    if (taskError) {
      console.error('Erreur recherche tâche:', taskError);
      return NextResponse.json({ 
        error: "Tâche non trouvée", 
        details: taskError.message 
      }, { status: 404 });
    }
    
    if (!task) {
      console.error('Tâche non trouvée:', exchangeTaskId);
      return NextResponse.json({ error: "Tâche non trouvée" }, { status: 404 });
    }

    // Vérifier s'il reste des actions
    if (task.actions_restantes <= 0) {
      return NextResponse.json({ 
        error: "Cette tâche a déjà été complétée par tous les utilisateurs autorisés. Aucune action restante." 
      }, { status: 400 });
    }

    // Vérification automatique de l'action
    console.log(`🔍 Début de la vérification automatique pour ${userId} sur la tâche ${task.type}`);
    const verification = await verifyTaskAction(task, userId);

    // Créer la complétion avec le résultat de la vérification
    const newCompletion = {
      id: Date.now().toString(),
      exchange_task_id: exchangeTaskId,
      user_id: userId,
      completed_at: new Date().toISOString(),
      verified: verification.verified,
      verification_result: verification.result
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

    if (verification.verified) {
      // Créditer l'utilisateur si la vérification est positive
      let { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userError) {
        console.error('Erreur recherche utilisateur par ID:', userError);
        return NextResponse.json({ error: "Erreur lors de la recherche de l'utilisateur" }, { status: 500 });
      }

      if (!user) {
        // Si l'utilisateur n'est pas trouvé par ID, essayer par pseudo
        const { data: userByPseudo, error: pseudoError } = await supabase
          .from('users')
          .select('*')
          .eq('pseudo', userId)
          .maybeSingle();

        if (pseudoError) {
          console.error('Erreur recherche utilisateur par pseudo:', pseudoError);
          return NextResponse.json({ error: "Erreur lors de la recherche de l'utilisateur" }, { status: 500 });
        }

        if (!userByPseudo) {
          return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        user = userByPseudo;
      }
      
      const creditsEarned = 5; // Gain fixe de 5 crédits pour toute tâche effectuée
      
      // Mettre à jour les crédits
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ 
          credits: user.credits + creditsEarned,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateUserError) {
        console.error('Erreur mise à jour crédits:', updateUserError);
        return NextResponse.json({ error: "Erreur lors de la mise à jour des crédits" }, { status: 500 });
      }

      console.log(`💰 ${userId} crédité de ${creditsEarned} crédits pour la tâche ${task.type}`);

      // Enregistrer l'activité de completion de tâche
      await logActivity({
        userId: user.id,
        userPhone: user.phone,
        userPseudo: user.pseudo,
        type: 'task_completed',
        description: `Tâche ${task.type} complétée avec succès`,
        details: { taskId: task.id, taskType: task.type, creditsEarned: creditsEarned },
        credits: creditsEarned
      });

      return NextResponse.json({ 
        success: true,
        verified: true,
        creditsEarned: creditsEarned,
        remainingActions: task.actions_restantes - 1,
        message: verification.result
      });
    } else {
      // Action non vérifiée
      console.log(`❌ Vérification échouée pour ${userId}: ${verification.result}`);

      return NextResponse.json({ 
        success: true,
        verified: false,
        message: verification.result,
        remainingActions: task.actions_restantes - 1
      });
    }

  } catch (error) {
    console.error('Erreur POST /api/exchange/tasks/[id]/complete:', error);
    return NextResponse.json({ error: "Erreur lors de la validation de l'action" }, { status: 400 });
  }
}

// API pour vérifier manuellement une complétion (optionnel)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { completionId, approved } = z.object({
      completionId: z.string().min(1),
      approved: z.boolean(),
    }).parse(body);

    const { id: exchangeTaskId } = await params;

    // Trouver la complétion
    const { data: completion, error: completionError } = await supabase
      .from('task_completions')
      .select('*')
      .eq('id', completionId)
      .eq('exchange_task_id', exchangeTaskId)
      .single();

    if (completionError || !completion) {
      return NextResponse.json({ error: "Complétion non trouvée" }, { status: 404 });
    }

    if (completion.verified) {
      return NextResponse.json({ error: "Complétion déjà vérifiée" }, { status: 400 });
    }

    if (approved) {
      // Marquer comme vérifiée manuellement
      const { error: updateCompletionError } = await supabase
        .from('task_completions')
        .update({
          verified: true,
          verification_date: new Date().toISOString(),
          verification_result: "Vérification manuelle approuvée"
        })
        .eq('id', completionId);

      if (updateCompletionError) {
        console.error('Erreur mise à jour complétion:', updateCompletionError);
        return NextResponse.json({ error: "Erreur lors de la mise à jour de la complétion" }, { status: 500 });
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

      // Créditer l'utilisateur qui a complété
      let { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', completion.user_id)
        .maybeSingle();

      if (userError) {
        console.error('Erreur recherche utilisateur par ID:', userError);
        return NextResponse.json({ error: "Erreur lors de la recherche de l'utilisateur" }, { status: 500 });
      }

      if (!user) {
        // Si l'utilisateur n'est pas trouvé par ID, essayer par pseudo
        const { data: userByPseudo, error: pseudoError } = await supabase
          .from('users')
          .select('*')
          .eq('pseudo', completion.user_id)
          .maybeSingle();

        if (pseudoError) {
          console.error('Erreur recherche utilisateur par pseudo:', pseudoError);
          return NextResponse.json({ error: "Erreur lors de la recherche de l'utilisateur" }, { status: 500 });
        }

        if (!userByPseudo) {
          return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        user = userByPseudo;
      }
      
      const creditsEarned = 5; // Gain fixe de 5 crédits pour toute tâche effectuée
      
      // Mettre à jour les crédits
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ 
          credits: user.credits + creditsEarned,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateUserError) {
        console.error('Erreur mise à jour crédits:', updateUserError);
        return NextResponse.json({ error: "Erreur lors de la mise à jour des crédits" }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true,
        message: "Complétion approuvée manuellement et crédits attribués",
        creditsEarned: creditsEarned
      });
    } else {
      // Rejeter la complétion
      const { error: deleteError } = await supabase
        .from('task_completions')
        .delete()
        .eq('id', completionId);

      if (deleteError) {
        console.error('Erreur suppression complétion:', deleteError);
        return NextResponse.json({ error: "Erreur lors de la suppression de la complétion" }, { status: 500 });
      }

      // Remettre l'action restante
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', exchangeTaskId)
        .single();

      if (!taskError && task) {
        const { error: updateTaskError } = await supabase
          .from('tasks')
          .update({ 
            actions_restantes: task.actions_restantes + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id);

        if (updateTaskError) {
          console.error('Erreur mise à jour tâche:', updateTaskError);
        }
      }

      return NextResponse.json({ 
        success: true,
        message: "Complétion rejetée manuellement"
      });
    }

  } catch (error) {
    console.error('Erreur PATCH /api/exchange/tasks/[id]/complete:', error);
    return NextResponse.json({ error: "Erreur lors de la vérification", details: error }, { status: 400 });
  }
} 