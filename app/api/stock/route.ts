import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const [rows] = await db.query("SELECT * FROM produits");
        return NextResponse.json(rows);
    } catch (err) {
        console.error(err);
        return new NextResponse("Erreur serveur", { status: 500 });
    }
}