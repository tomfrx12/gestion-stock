import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const [rows] = await db.query("SELECT * FROM produits");
        return NextResponse.json(rows);
    } catch (err) {
        console.error("Erreur GET:", err);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { date_de_commande, fournisseur, designation, numero_de_serie, adresse_mac, commentaire } = body;

    if (!designation || !numero_de_serie) {
        return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    await db.query(
		"INSERT INTO produits (date_de_commande, fournisseur, designation, numero_de_serie, adresse_mac, commentaire) VALUES (?, ?, ?, ?, ?, ?)",
		[date_de_commande, fournisseur, designation, numero_de_serie, adresse_mac, commentaire]
    );

    return NextResponse.json({ success: true });
	} catch (err) {
		console.error("Erreur POST:", err);
		return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
	}
}