import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Activity {
  id: string;
  userId: string;
  userPhone: string;
  userPseudo?: string;
  type: 'login' | 'register' | 'logout' | 'task_created' | 'task_completed' | 'credits_earned' | 'credits_spent';
  description: string;
  details?: Record<string, unknown>;
  timestamp: string;
  credits?: number;
}

// Chemin vers le fichier de stockage des activités
const activitiesFilePath = path.join(process.cwd(), 'data', 'activities.json');

// Fonction pour charger les activités depuis le fichier
function loadActivities(): Activity[] {
  try {
    if (fs.existsSync(activitiesFilePath)) {
      const data = fs.readFileSync(activitiesFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des activités:', error);
  }
  return [];
}

// Fonction pour sauvegarder les activités dans le fichier
function saveActivities(activities: Activity[]): void {
  try {
    // Créer le dossier data s'il n'existe pas
    const dataDir = path.dirname(activitiesFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(activitiesFilePath, JSON.stringify(activities, null, 2));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des activités:', error);
  }
}

// Fonction pour ajouter une activité
function addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): void {
  const activities = loadActivities();
  const newActivity: Activity = {
    ...activity,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  };
  activities.unshift(newActivity); // Ajouter au début
  saveActivities(activities);
}

// API pour récupérer les activités
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let activities = loadActivities();
    
    // Filtrer par utilisateur si spécifié
    if (userId) {
      activities = activities.filter(activity => activity.userId === userId);
    }
    
    // Filtrer par date si spécifié
    if (startDate || endDate) {
      activities = activities.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && end) {
          return activityDate >= start && activityDate <= end;
        } else if (start) {
          return activityDate >= start;
        } else if (end) {
          return activityDate <= end;
        }
        return true;
      });
    }
    
    return NextResponse.json({
      activities: activities,
      total: activities.length
    });

  } catch (error) {
    console.error('Erreur lors du chargement des activités:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// API pour ajouter une activité
export async function POST(request: NextRequest) {
  try {
    const activityData = await request.json();
    
    // Validation des données
    if (!activityData.userId || !activityData.userPhone || !activityData.type || !activityData.description) {
      return NextResponse.json(
        { error: 'Données d\'activité incomplètes' },
        { status: 400 }
      );
    }

    // Ajouter l'activité
    addActivity(activityData);

    return NextResponse.json({
      message: 'Activité ajoutée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'activité:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 