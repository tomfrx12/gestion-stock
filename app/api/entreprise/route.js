import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET() {
    try {
        const [rows] = await db.query("SELECT * FROM entreprise JOIN users ON entreprise.id_users = users.id;");
        return NextResponse.json(rows);
    } catch (err) {
        console.error("Erreur GET:", err);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { nom, reference_client, name, firstname, num_tel_fixe, num_tel_portable, adresse_mail } = body;

        const errors = {};
        if (!nom) return NextResponse.json({ error: "Un nom d'entreprise est requis."}, {status: 400 });
        if (!reference_client) return NextResponse.json({ error: "Une référence client est requis."}, {status: 400 });
        if (!name) return NextResponse.json({ error: "Le nom du fondateur est requis."}, {status: 400 });
        if (!adresse_mail) return NextResponse.json({ error: "Une adresse mail est requise."}, {status: 400 });

        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ error: "Validation échouée" }, { status: 400 });
        }

        const [rowsRef] = await db.query("SELECT reference_client FROM entreprise WHERE reference_client = ?", [reference_client]);

        if (rowsRef.length > 0) {
            return NextResponse.json({ error: "Cette référence client existe déjà"}, {status: 400 });
        }
        
        if (body.reference_client.includes(' ')) {
            return NextResponse.json({ error: "La référence client ne peut pas contenir d'espace"}, { status: 400 });
        };

        
        const [rowsName] = await db.query("SELECT nom FROM entreprise WHERE nom = ?", [nom]);

        if (rowsName.length > 0) {
            return NextResponse.json({ error: "Ce nom est déjà attribué"}, {status: 400 });
        }

        const [rowsFondateur] = await db.query("SELECT name, firstname, num_tel_fixe, num_tel_portable, adresse_mail FROM users WHERE name = ? AND firstname = ? AND num_tel_fixe = ? AND num_tel_portable = ? AND adresse_mail = ?",
            [name, firstname, num_tel_fixe, num_tel_portable, adresse_mail]
        );

        if (rowsFondateur.length > 0) {
            return NextResponse.json({ error: "Ce fondateur existe déjà"}, {status: 400 });
        }

        const [userResult] = await db.query(
            "INSERT INTO users (name, firstname, num_tel_fixe, num_tel_portable, adresse_mail) VALUES (?, ?, ?, ?, ?)",
            [name, firstname, num_tel_fixe, num_tel_portable, adresse_mail]
        );

        const newUserId = userResult.insertId;
        await db.query(
            "INSERT INTO entreprise (nom, reference_client, id_users) VALUES (?, ?, ?)",
            [nom, reference_client, newUserId]
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

        const sql = `
            UPDATE entreprise 
            SET nom = ?, reference_client = ?
            WHERE id = ?
        `;
        
        await db.query(sql, [
            nom, 
            reference_client.toUpperCase(), 
            id
        ]);

        return NextResponse.json({ message: "Entreprise mise à jour avec succès" }, { status: 200 });

    } catch (err) {
        console.error("Erreur PUT détaillée :", err.message);
        return NextResponse.json({ 
            error: "Erreur serveur lors de la modification", 
            details: err.message 
        }, { status: 500 });
    }
}