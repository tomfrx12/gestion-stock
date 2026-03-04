import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET() {
    try {
        const [rows] = await db.query("SELECT * FROM entreprise");
        return NextResponse.json(rows);
    } catch (err) {
        console.error("Erreur GET:", err);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { id_entreprise, nom_entreprise, reference_client, id_users } = body;

        const errors = {};
        if (!nom_entreprise) return NextResponse.json({ error: "Un nom d'entreprise est requis.", errors: {nom_entreprise: "Un nom d'entreprise est requis." }}, {status: 400 });
        if (!reference_client) return NextResponse.json({ error: "Une référence client est requis.", errors: {reference_client: "La date estUne référence client est requis."}}, {status: 400 });
        if (!id_users) return NextResponse.json({ error: "Au moins un utilisateurs est requis.", errors: {id_users: "Au moins un utilisateurs est requis." }}, {status: 400 });

        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ error: "Validation échouée", errors }, { status: 400 });
        }

        const [rowsRef] = await db.query("SELECT reference_client FROM entreprise WHERE reference_client = ?", [reference_client]);

        if (rowsRef.length > 0) {
            return NextResponse.json({ error: "Cette référence client existe déjà", errors: {reference_client: "Cette référence client existe déjà" }}, {status: 400 });
        }
        
        if (body.reference_client.includes(' ')) {
            return NextResponse.json({ error: "La référence client ne peut pas contenir d'espace", errors: { reference_client: "La référence client ne peut pas contenir d'espace" }}, { status: 400 });
        };

        
        const [rowsName] = await db.query("SELECT nom_entreprise FROM produits WHERE nom_entreprise = ?", [nom_entreprise]);

        if (rowsName.length > 0) {
            return NextResponse.json({ error: "Ce nom est déjà attribué", errors: {nom_entreprise: "Ce nom est déjà attribué" }}, {status: 400 });
        }

        await db.query(
            "INSERT INTO entreprise (id_entreprise, nom_entreprise, reference_client, id_users) VALUES (?, ?, ?, ?,)",
            [id_entreprise, nom_entreprise, reference_client, id_users]
        );

        return NextResponse.json({ message: "Entreprise ajouté" }, { status: 201 });
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

        await db.query("DELETE FROM entreprise WHERE id_entreprise = ?", [suppr]);

        return NextResponse.json({ message: "Entreprise supprimé avec succès" }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const { id_entreprise, nom_entreprise, reference_client, id_users } = body;

         const [rowsRef] = await db.query(
            "SELECT id_entreprise FROM entreprise WHERE reference_client = ? AND id_entreprise != ?", 
            [reference_client, id_entreprise]
        );

        if (rowsRef.length > 0) {
            return NextResponse.json({ error: "Cet référence client est déjà utilisé par une autre entreprise", errors: { reference_client: "Cet référence client est déjà utilisé par une autre entreprise" }}, { status: 400 });
        }

        const [rowsName] = await db.query(
            "SELECT id_entreprise FROM entreprise WHERE nom_entreprise = ? AND id_entreprise != ?", 
            [nom_entreprise, id_entreprise]
        );

        if (rowsName.length > 0) {
            return NextResponse.json({ error: "Ce nom est déjà utilisé par une autre entreprise", errors: { nom_entreprise: "Ce nom est déjà utilisé par une autre entreprise" }}, { status: 400 });
        }

        const sql = `
            UPDATE entreprise 
            SET nom_entreprise = ?, reference_client = ?, id_users = ?
            WHERE id_entreprise = ?
        `;
        
        await db.query(sql, [
            id_entreprise, 
            nom_entreprise, 
            reference_client.toUpperCase(), 
            id_users
        ]);

        return NextResponse.json({ message: "Mise à jour réussie" }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erreur serveur lors de la modification" }, { status: 500 });
    }
}