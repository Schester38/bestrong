import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

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
    // Bypass admin : accès total
    if (phone === ADMIN_PHONE) {
      const order = await prisma.boostOrder.create({
        data: {
          type,
          quantity,
          amount,
          paymentMethod,
          status: "COMPLETED",
        },
      });
      return NextResponse.json(order, { status: 201 });
    }

    // Créer la commande de boost
    const order = await prisma.boostOrder.create({
      data: {
        type,
        quantity,
        amount,
        paymentMethod,
        status: "PENDING",
      },
    });

    return NextResponse.json(order, { status: 201 });
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

    const where: {
      status?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
    } = {};

    if (status) {
      where.status = status as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
    }

    const orders = await prisma.boostOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erreur récupération commandes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" },
      { status: 500 }
    );
  }
} 