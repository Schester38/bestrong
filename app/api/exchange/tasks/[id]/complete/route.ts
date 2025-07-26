import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { z } from "zod";

interface User {
  id: string;
  phone: string;
  password: string;
  credits: number;
  pseudo: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ExchangeTask {
  id: string;
  type: string;
  url: string;
  credits: number;
  actionsRestantes: number;
  createur: string;
  createdAt: string;
  updatedAt: string;
}

interface ExchangeTaskCompletion {
      id: string;
  exchangeTaskId: string;
  userId: string;
  completedAt: string;
  verified: boolean;
  verificationDate?: string;
  verificationResult?: string;
}

// Chemins vers les fichiers de stockage
const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
const tasksFilePath = path.join(process.cwd(), 'data', 'tasks.json');
const completionsFilePath = path.join(process.cwd(), 'data', 'completions.json');

// Fonctions utilitaires
function loadUsers(): User[] {
  try {
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error);
  }
  return [];
}

function saveUsers(users: User[]): void {
  try {
    const dataDir = path.dirname(usersFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des utilisateurs:', error);
  }
}

function loadTasks(): ExchangeTask[] {
  try {
    if (fs.existsSync(tasksFilePath)) {
      const data = fs.readFileSync(tasksFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des tâches:', error);
  }
  return [];
}

function saveTasks(tasks: ExchangeTask[]): void {
  try {
    const dataDir = path.dirname(tasksFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des tâches:', error);
  }
}

function loadCompletions(): ExchangeTaskCompletion[] {
  try {
    if (fs.existsSync(completionsFilePath)) {
      const data = fs.readFileSync(completionsFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des complétions:', error);
  }
  return [];
}

function saveCompletions(completions: ExchangeTaskCompletion[]): void {
  try {
    const dataDir = path.dirname(completionsFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(completionsFilePath, JSON.stringify(completions, null, 2));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des complétions:', error);
  }
}

// Fonction de vérification automatique selon le type de tâche
async function verifyTaskAction(task: ExchangeTask, userId: string): Promise<{ verified: boolean; result: string }> {
  try {
    console.log(`Vérification de la tâche ${task.id} (${task.type}) pour l'utilisateur ${userId}`);
    
    switch (task.type) {
      case 'LIKE':
        return await verifyLikeAction(task.url, userId);
      case 'FOLLOW':
        return await verifyFollowAction(task.url, userId);
      case 'COMMENT':
        return await verifyCommentAction(task.url, userId);
      case 'SHARE':
        return await verifyShareAction(task.url, userId);
      default:
        return { verified: false, result: 'Type de tâche non reconnu' };
    }
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return { verified: false, result: 'Erreur lors de la vérification' };
  }
}

// Vérification d'un like
async function verifyLikeAction(url: string, userId: string): Promise<{ verified: boolean; result: string }> {
  try {
    // Ici tu peux brancher une vraie API TikTok pour vérifier le like
    // Pour l'instant, simulation avec délai
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulation : 80% de chance que la vérification soit positive
    const isVerified = Math.random() > 0.2;
    
    if (isVerified) {
      console.log(`✅ Like vérifié pour ${userId} sur ${url}`);
      return { verified: true, result: 'Like vérifié avec succès' };
    } else {
      console.log(`❌ Like non trouvé pour ${userId} sur ${url}`);
      return { verified: false, result: 'Like non détecté sur la vidéo' };
    }
  } catch {
    return { verified: false, result: 'Erreur lors de la vérification du like' };
  }
}

// Vérification d'un follow
async function verifyFollowAction(url: string, userId: string): Promise<{ verified: boolean; result: string }> {
  try {
    // Simulation avec délai
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulation : 85% de chance que la vérification soit positive
    const isVerified = Math.random() > 0.15;
    
    if (isVerified) {
      console.log(`✅ Follow vérifié pour ${userId} sur ${url}`);
      return { verified: true, result: 'Follow vérifié avec succès' };
    } else {
      console.log(`❌ Follow non trouvé pour ${userId} sur ${url}`);
      return { verified: false, result: 'Follow non détecté sur le compte' };
    }
  } catch {
    return { verified: false, result: 'Erreur lors de la vérification du follow' };
  }
}

// Vérification d'un commentaire
async function verifyCommentAction(url: string, userId: string): Promise<{ verified: boolean; result: string }> {
  try {
    // Simulation avec délai
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulation : 70% de chance que la vérification soit positive
    const isVerified = Math.random() > 0.3;
    
    if (isVerified) {
      console.log(`✅ Commentaire vérifié pour ${userId} sur ${url}`);
      return { verified: true, result: 'Commentaire vérifié avec succès' };
    } else {
      console.log(`❌ Commentaire non trouvé pour ${userId} sur ${url}`);
      return { verified: false, result: 'Commentaire non détecté sur la vidéo' };
    }
  } catch {
    return { verified: false, result: 'Erreur lors de la vérification du commentaire' };
  }
}

// Vérification d'un partage
async function verifyShareAction(url: string, userId: string): Promise<{ verified: boolean; result: string }> {
  try {
    // Simulation avec délai
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Simulation : 75% de chance que la vérification soit positive
    const isVerified = Math.random() > 0.25;
    
    if (isVerified) {
      console.log(`✅ Partage vérifié pour ${userId} sur ${url}`);
      return { verified: true, result: 'Partage vérifié avec succès' };
    } else {
      console.log(`❌ Partage non trouvé pour ${userId} sur ${url}`);
      return { verified: false, result: 'Partage non détecté' };
    }
  } catch {
    return { verified: false, result: 'Erreur lors de la vérification du partage' };
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
    const completions = loadCompletions();
    const tasks = loadTasks();
    const users = loadUsers();

    // Vérifier si déjà complété
    const already = completions.find(c => c.exchangeTaskId === exchangeTaskId && c.userId === userId);
    if (already) {
      return NextResponse.json({ error: "Déjà complété par cet utilisateur" }, { status: 409 });
    }

    // Trouver la tâche
    const task = tasks.find(t => t.id === exchangeTaskId);
    if (!task) {
      return NextResponse.json({ error: "Tâche non trouvée" }, { status: 404 });
    }

    // Vérifier s'il reste des actions
    if (task.actionsRestantes <= 0) {
      return NextResponse.json({ error: "Aucune action restante pour cette tâche" }, { status: 400 });
    }

    // Vérification automatique de l'action
    console.log(`🔍 Début de la vérification automatique pour ${userId} sur la tâche ${task.type}`);
    const verification = await verifyTaskAction(task, userId);

    // Créer la complétion avec le résultat de la vérification
    const newCompletion: ExchangeTaskCompletion = {
      id: Date.now().toString(),
      exchangeTaskId,
      userId,
      completedAt: new Date().toISOString(),
      verified: verification.verified,
      verificationResult: verification.result
    };
    
    completions.push(newCompletion);
    saveCompletions(completions);

    // Décrémenter actionsRestantes
    task.actionsRestantes -= 1;
    task.updatedAt = new Date().toISOString();
    saveTasks(tasks);

    if (verification.verified) {
      // Créditer l'utilisateur si la vérification est positive
      let user = users.find(u => u.id === userId);
      if (!user) {
        // Si l'utilisateur n'est pas trouvé par ID, essayer par pseudo
        user = users.find(u => u.pseudo === userId);
        if (!user) {
          return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }
      }
      
      user.credits += task.credits;
      user.updatedAt = new Date().toISOString();
      saveUsers(users);

      console.log(`💰 ${userId} crédité de ${task.credits} crédits pour la tâche ${task.type}`);

      return NextResponse.json({ 
        success: true,
        verified: true,
        creditsEarned: task.credits,
        remainingActions: task.actionsRestantes,
        message: verification.result
      });
    } else {
      // Action non vérifiée
      console.log(`❌ Vérification échouée pour ${userId}: ${verification.result}`);

      return NextResponse.json({ 
        success: true,
        verified: false,
        message: verification.result,
        remainingActions: task.actionsRestantes
      });
    }

  } catch {
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
    const completions = loadCompletions();
    const tasks = loadTasks();
    const users = loadUsers();

    // Trouver la complétion
    const completion = completions.find(c => c.id === completionId && c.exchangeTaskId === exchangeTaskId);
    if (!completion) {
      return NextResponse.json({ error: "Complétion non trouvée" }, { status: 404 });
    }

    if (completion.verified) {
      return NextResponse.json({ error: "Complétion déjà vérifiée" }, { status: 400 });
    }

    if (approved) {
      // Marquer comme vérifiée manuellement
      completion.verified = true;
      completion.verificationDate = new Date().toISOString();
      completion.verificationResult = "Vérification manuelle approuvée";
      saveCompletions(completions);

      // Trouver la tâche
      const task = tasks.find(t => t.id === exchangeTaskId);
      if (!task) {
        return NextResponse.json({ error: "Tâche non trouvée" }, { status: 404 });
      }

      // Créditer l'utilisateur qui a complété
      let user = users.find(u => u.id === completion.userId);
      if (!user) {
        // Si l'utilisateur n'est pas trouvé par ID, essayer par pseudo
        user = users.find(u => u.pseudo === completion.userId);
        if (!user) {
          return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }
      }
      
      user.credits += task.credits;
      user.updatedAt = new Date().toISOString();
      saveUsers(users);

      return NextResponse.json({ 
        success: true,
        message: "Complétion approuvée manuellement et crédits attribués",
        creditsEarned: task.credits
      });
    } else {
      // Rejeter la complétion
      const filteredCompletions = completions.filter(c => c.id !== completionId);
      saveCompletions(filteredCompletions);

      // Remettre l'action restante
      const task = tasks.find(t => t.id === exchangeTaskId);
      if (task) {
        task.actionsRestantes += 1;
        task.updatedAt = new Date().toISOString();
        saveTasks(tasks);
      }

      return NextResponse.json({ 
        success: true,
        message: "Complétion rejetée manuellement"
      });
    }

  } catch (error) {
    console.error('Erreur lors de la vérification manuelle:', error);
    return NextResponse.json({ error: "Erreur lors de la vérification", details: error }, { status: 400 });
  }
} 