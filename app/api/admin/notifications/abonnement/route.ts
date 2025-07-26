import { NextResponse } from 'next/server';
import { sendAbonnementNotifications } from '../../../../utils/abonnement';

export async function POST() {
  sendAbonnementNotifications();
  return NextResponse.json({ success: true });
} 