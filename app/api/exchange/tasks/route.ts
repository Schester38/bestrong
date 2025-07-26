import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { z } from "zod";

// Interfaces
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

const createTaskSchema = z.object({
  type: z.enum(["LIKE", "FOLLOW", "COMMENT", "SHARE"]),
  url: z.string().min(1, "Lien requis").refine(val => val.includes("tiktok.com"), {
    message: "Le lien doit contenir tiktok.com"
  }),
  credits: z.number().min(1, "Crédits minimum 1"),
  actionsRestantes: z.number().min(1, "Au moins 1 action"),
  createur: z.string().min(1, "Nom du créateur requis"),
});

const ADMIN_PHONE = "+237699486146";

// Créer une tâche d'échange
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, url, credits, actionsRestantes, createur } = createTaskSchema.parse(body);
    // Bypass admin : accès total
    if (createur === ADMIN_PHONE) {
      // Créer la tâche sans débiter de crédits
      const tasks = loadTasks();
      const newTask: ExchangeTask = {
        id: Date.now().toString(),
        type,
        url,
        credits,
        actionsRestantes,
        createur,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      tasks.push(newTask);
      saveTasks(tasks);
      return NextResponse.json(newTask, { status: 201 });
    }
    
    // Charger les utilisateurs
    const users = loadUsers();
    
    // Trouver l'utilisateur par téléphone (createur contient le numéro de téléphone)
    let user = users.find(u => u.phone === createur);
    
    if (!user) {
      // Essayer de trouver par pseudo aussi
      user = users.find(u => u.pseudo === createur);
    }
    
    if (!user) {
      // Créer un nouvel utilisateur si pas trouvé
      const newUser: User = {
        id: Date.now().toString(),
        phone: createur, // Utiliser le createur comme téléphone temporaire
        password: '', // Pas de mot de passe pour les utilisateurs créés via tâches
        credits: 100,
        pseudo: createur,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.push(newUser);
      saveUsers(users);
      user = newUser;
    }
    
    const totalCost = credits * actionsRestantes;
    console.log(`Création de tâche: ${createur}, crédits actuels: ${user.credits}, coût total: ${totalCost}`);
    
    if (user.credits < totalCost) {
      console.log(`Crédits insuffisants: ${user.credits} < ${totalCost}`);
      return NextResponse.json({ error: "Crédits insuffisants" }, { status: 400 });
    }
    
    // Débiter les crédits
    user.credits -= totalCost;
    user.updatedAt = new Date().toISOString();
    saveUsers(users);
    console.log(`Crédits débités: ${user.credits} restants pour ${createur}`);
    
    // Créer la tâche
    const tasks = loadTasks();
    const newTask: ExchangeTask = {
      id: Date.now().toString(),
      type,
      url,
      credits,
      actionsRestantes,
      createur,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasks(tasks);
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/exchange/tasks:', error);
    return NextResponse.json({ error: "Erreur lors de la création de la tâche", details: error }, { status: 400 });
  }
}

// Lister toutes les tâches d'échange
export async function GET() {
  try {
    const tasks = loadTasks();
    const completions = loadCompletions();
    
    // Ajouter les complétions à chaque tâche
    const tasksWithCompletions = tasks.map(task => ({
      ...task,
      completions: completions.filter(c => c.exchangeTaskId === task.id)
    }));
    
    return NextResponse.json(tasksWithCompletions);
  } catch {
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

    // Créer la complétion
    const newCompletion: ExchangeTaskCompletion = {
      id: Date.now().toString(),
      exchangeTaskId,
      userId,
      completedAt: new Date().toISOString()
    };
    
    completions.push(newCompletion);
    saveCompletions(completions);

    // Décrémenter actionsRestantes
    task.actionsRestantes -= 1;
    task.updatedAt = new Date().toISOString();
    saveTasks(tasks);

    // Créditer l'utilisateur qui complète
    let user = users.find(u => u.pseudo === userId);
    if (!user) {
      user = {
        id: Date.now().toString(),
        phone: userId,
        password: '',
        credits: 100,
        pseudo: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.push(user);
    }
    
    user.credits += task.credits;
    user.updatedAt = new Date().toISOString();
    saveUsers(users);

    return NextResponse.json({ success: true });
  } catch {
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
    
    const tasks = loadTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);
    saveTasks(filteredTasks);
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}

 