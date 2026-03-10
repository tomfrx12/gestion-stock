import { NextResponse } from "next/server";
import {db} from "../../../../lib/db";

export async function GET(req, { params }) {
    try {
        const { nom } = await params;
        const nomDecoded = decodeURIComponent(nom);

        const [rows] = await db.query(
            `SELECT entreprise.*
             FROM entreprise 
             WHERE entreprise.nom = ?`,
            [nomDecoded]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
        }

        return NextResponse.json(rows[0], { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}