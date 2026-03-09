import { NextResponse } from "next/server";
import {db} from "../../../lib/db";

export async function GET() {
    try {
        const [rows] = await db.query("SELECT users.* FROM users WHERE adresse_mail IS NOT NULL");
        return NextResponse.json(rows);
    } catch (err) {
        console.error("Erreur GET:", err);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, firstname, num_tel_fixe, num_tel_portable, adresse_mail } = body;

        await db.query(
            "INSERT INTO users (name, firstname, num_tel_fixe, num_tel_portable, adresse_mail) VALUES (?, ?, ?, ?, ?)",
            [name, firstname, num_tel_fixe, num_tel_portable, adresse_mail]
        );

        return NextResponse.json({ message: "Utilisateur ajouté" }, { status: 201 });
    } catch (err) {
        console.error("Erreur POST:", err);
        return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const suppr = searchParams.get("suppr");

        if (!suppr) {
            return NextResponse.json({ error: "ID manquant" }, { status: 400 });
        }

        await db.query("UPDATE entreprise SET id_users = NULL WHERE id_users = ?", [suppr]);
        await db.query("DELETE FROM users WHERE id = ?", [suppr]);

        return NextResponse.json({ message: "Utilisateur supprimé avec succès" }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
    }
}