import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase côté serveur
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface BoostOrder {
  id: string;
  type: "FOLLOWERS" | "VIEWS" | "LIKES" | "COMMENTS";
  quantity: number;
  amount: number;
  payment_method?: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  created_at: string;
  updated_at: string;
}

const createOrderSchema = z.object({
  type: z.enum(["FOLLOWERS", "VIEWS", "LIKES", "COMMENTS"]),
  quantity: z.number().min(1, "Quantité minimale de 1"),
  amount: z.number().min(0.01, "Montant minimum de 0.01"),
  paymentMethod: z.string().optional(),
});

const ADMIN_PHONE = "+237699486146";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, quantity, amount, paymentMethod, phone } = { ...body, ...createOrderSchema.parse(body) };
    
    const newOrder = {
      id: Date.now().toString(),
      type,
      quantity,
      amount,
      payment_method: paymentMethod,
      status: phone === ADMIN_PHONE ? "COMPLETED" : "PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('boost_orders')
      .insert(newOrder)
      .select()
      .single();

    if (error) {
      console.error('Erreur création commande boost:', error);
      return NextResponse.json(
        { error: "Erreur lors de la création de la commande" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Erreur création commande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la commande" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabase
      .from('boost_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Erreur récupération commandes boost:', error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des commandes" },
        { status: 500 }
      );
    }

    return NextResponse.json(orders || []);
  } catch (error) {
    console.error("Erreur récupération commandes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" },
      { status: 500 }
    );
  }
} 