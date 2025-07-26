import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Report {
  id: string; // id du signalement
  taskId: string;
  reporter: string; // pseudo ou id
  reason?: string;
  date: string;
}

const reportsFilePath = path.join(process.cwd(), 'data', 'reports.json');

function loadReports(): Report[] {
  try {
    if (fs.existsSync(reportsFilePath)) {
      const data = fs.readFileSync(reportsFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des signalements:', error);
  }
  return [];
}

function saveReports(reports: Report[]): void {
  try {
    const dataDir = path.dirname(reportsFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(reportsFilePath, JSON.stringify(reports, null, 2));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des signalements:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { taskId, reporter, reason } = await request.json();
    if (!taskId || !reporter) {
      return NextResponse.json({ error: 'taskId et reporter sont requis' }, { status: 400 });
    }
    const reports = loadReports();
    const newReport: Report = {
      id: Date.now().toString(),
      taskId,
      reporter,
      reason,
      date: new Date().toISOString(),
    };
    reports.push(newReport);
    saveReports(reports);
    return NextResponse.json({ message: 'Signalement enregistré', report: newReport });
  } catch (error) {
    console.error('Erreur lors du signalement:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
} 