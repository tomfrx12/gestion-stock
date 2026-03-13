import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET() {
    try {
        const [rows] = await db.query("SELECT * FROM entreprise ORDER BY id DESC");
        return NextResponse.json(rows);
    } catch (err) {
        console.error("Erreur GET:", err);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { nom, reference_client } = body;

        const errors = {};
        if (!nom) return NextResponse.json({ error: "Un nom d'entreprise est requis."}, {status: 400 });
        if (!reference_client) return NextResponse.json({ error: "Une référence client est requis."}, {status: 400 });

        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ error: "Validation échouée" }, { status: 400 });
        }

        const [rowsRef] = await db.query("SELECT reference_client FROM entreprise WHERE reference_client = ?", [reference_client]);

        if (rowsRef.length > 0) {
            return NextResponse.json({ error: "Cette référence client existe déjà"}, {status: 400 });
        }
        
        const isOnlyDigits = /^[0-9]+$/.test(body.reference_client);
        if (!isOnlyDigits) {
            return NextResponse.json(
                { error: "La référence client doit contenir uniquement des chiffres (pas de lettres, d'espaces ou de symboles)" }, 
                { status: 400 }
            );
        }
        
        const [rowsName] = await db.query("SELECT nom FROM entreprise WHERE nom = ?", [nom]);

        if (rowsName.length > 0) {
            return NextResponse.json({ error: "Ce nom est déjà attribué"}, {status: 400 });
        }

        await db.query(
            "INSERT INTO entreprise (nom, reference_client) VALUES (?, ?)",
            [nom, reference_client]
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

        await db.query("DELETE FROM entreprise WHERE id = ?", [suppr]);

        return NextResponse.json({ message: "Entreprise supprimé avec succès" }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const { id, nom, reference_client } = body;

        if (!id) {
            return NextResponse.json({ error: "L'identifiant de l'entreprise est manquant." }, { status: 400 });
        }

        const [rowsRef] = await db.query(
            "SELECT id FROM entreprise WHERE reference_client = ? AND id != ?", 
            [reference_client, id]
        );

        if (rowsRef.length > 0) {
            return NextResponse.json({ 
                error: "Cette référence client est déjà utilisée par une autre entreprise", 
                errors: { reference_client: "Référence déjà utilisée" } 
            }, { status: 400 });
        }

        const [rowsName] = await db.query(
            "SELECT id FROM entreprise WHERE nom = ? AND id != ?", 
            [nom, id]
        );

        if (rowsName.length > 0) {
            return NextResponse.json({ 
                error: "Ce nom d'entreprise est déjà utilisé", 
                errors: { nom: "Nom déjà utilisé" } 
            }, { status: 400 });
        }

        await db.query(
            `UPDATE entreprise 
            SET nom = ?, reference_client = ? 
            WHERE id = ?`,
            [nom, reference_client, id]
        );

        return NextResponse.json({ message: "Entreprise mise à jour avec succès" }, { status: 200 });

    } catch (err) {
        console.error("Erreur PUT détaillée :", err.message);
        return NextResponse.json({ 
            error: "Erreur serveur lors de la modification", 
            details: err.message 
        }, { status: 500 });
    }
}