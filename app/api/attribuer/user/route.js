import { NextResponse } from "next/server";
import {db} from "../../../../lib/db";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const nomEntreprise = searchParams.get("nom_entreprise");
        const idUser = searchParams.get("id_user");

        if (!nomEntreprise || !idUser) {
            return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
        }

        const [rows] = await db.query(`
            SELECT 
                produits.*, 
                attribuer_produits.id_user AS est_attribue
            FROM produits
            LEFT JOIN attribuer_produits ON produits.id = attribuer_produits.id_produit AND attribuer_produits.id_user = ?
            WHERE produits.id_entreprise = (SELECT id FROM entreprise WHERE nom = ?)
        `, [idUser, nomEntreprise]);

        return NextResponse.json(rows);
    } catch (err) {
        console.error("Erreur GET produits user:", err);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { id_produit, id_user, isChecked } = await req.json();

        if (isChecked) {
            await db.query(
                "INSERT IGNORE INTO attribuer_produits (id_produit, id_user) VALUES (?, ?)",
                [id_produit, id_user]
            );
        } else {
            await db.query(
                "DELETE FROM attribuer_produits WHERE id_produit = ? AND id_user = ?",
                [id_produit, id_user]
            );
        }

        return NextResponse.json({ message: "Assignation utilisateur mise à jour" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erreur lors de l'assignation" }, { status: 500 });
    }
}