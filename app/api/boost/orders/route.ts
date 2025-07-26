import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { z } from "zod";

interface BoostOrder {
  id: string;
  type: "FOLLOWERS" | "VIEWS" | "LIKES" | "COMMENTS";
  quantity: number;
  amount: number;
  paymentMethod?: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

const ordersFilePath = path.join(process.cwd(), 'data', 'boost-orders.json');

function loadOrders(): BoostOrder[] {
  try {
    if (fs.existsSync(ordersFilePath)) {
      const data = fs.readFileSync(ordersFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des commandes:', error);
  }
  return [];
}

function saveOrders(orders: BoostOrder[]): void {
  try {
    const dataDir = path.dirname(ordersFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des commandes:', error);
  }
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
    
    const orders = loadOrders();
    const newOrder: BoostOrder = {
      id: Date.now().toString(),
      type,
      quantity,
      amount,
      paymentMethod,
      status: phone === ADMIN_PHONE ? "COMPLETED" : "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    orders.push(newOrder);
    saveOrders(orders);

    return NextResponse.json(newOrder, { status: 201 });
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

    const orders = loadOrders();
    let filteredOrders = orders;

    if (status) {
      filteredOrders = orders.filter(order => order.status === status);
    }

    // Trier par date de création décroissante
    filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(filteredOrders);
  } catch (error) {
    console.error("Erreur récupération commandes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" },
      { status: 500 }
    );
  }
} 