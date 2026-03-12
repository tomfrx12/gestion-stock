import { NextResponse } from "next/server";
import {db} from "../../../../lib/db";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const nomEntreprise = searchParams.get("nom_entreprise");
        

        if (!nomEntreprise) {
            return NextResponse.json({ error: "Nom manquant" }, { status: 400 });
        }

        const [ent] = await db.query("SELECT id FROM entreprise WHERE nom = ?", [nomEntreprise]);
        
        if (ent.length === 0) {
            return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
        }

        const idEntreprise = ent[0].id;

        const [rows] = await db.query(`
            SELECT * FROM produits 
            WHERE id_entreprise IS NULL 
            OR id_entreprise = ?
        `, [idEntreprise]);

        return NextResponse.json(rows);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
export async function PUT(req) {
    try {
        const { id_produit, nom_entreprise } = await req.json();
        let id_entreprise = null;

        if (nom_entreprise) {
            const [ent] = await db.query("SELECT id FROM entreprise WHERE nom = ?", [nom_entreprise]);
            if (ent.length > 0) id_entreprise = ent[0].id;
        }

        await db.query(
            "UPDATE produits SET id_entreprise = ? WHERE id = ?",
            [id_entreprise, id_produit]
        );
        
        if (!id_entreprise) {
            await db.query(
                "DELETE FROM attribuer_produits WHERE id_produit = ?",
                [id_produit]
            );
        }

        return NextResponse.json({ message: "Statut mis à jour et liens utilisateurs nettoyés" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erreur" }, { status: 500 });
    }
}