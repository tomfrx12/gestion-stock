import { NextResponse } from "next/server";
import {db} from "../../../lib/db";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const nomBoite = searchParams.get("nom_entreprise");

        if (!nomBoite) {
            return NextResponse.json({ error: "Nom d'entreprise manquant" }, { status: 400 });
        }

        const [rows] = await db.query(`
            SELECT users.* FROM users
            JOIN membre ON users.id = membre.id_user
            JOIN entreprise ON membre.id_entreprise = entreprise.id
            WHERE entreprise.nom = ?
            ORDER By id DESC
        `, [nomBoite]);

        return NextResponse.json(rows);
    } catch (err) {
        console.error("Erreur GET:", err);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, firstname, num_tel_fixe, num_tel_portable, adresse_mail, id_entreprise } = body;

        if (!name) { return NextResponse.json({ error: "Nom d'utilisateur manquant"}, { status: 400})};
        if (!firstname) { return NextResponse.json({ error: "Prénom d'utilisateur manquant"}, { status: 400})};
        if (!adresse_mail) { return NextResponse.json({ error: "Adresse mail d'utilisateur manquant"}, { status: 400})};

        if (!adresse_mail.includes('@')) {
            return NextResponse.json({ error: "Email invalide" }, { status: 400 });
        }

        const [resultUser] = await db.query(
            `INSERT INTO users (name, firstname, num_tel_fixe, num_tel_portable, adresse_mail) 
             VALUES (?, ?, ?, ?, ?)`,
            [name, firstname, num_tel_fixe, num_tel_portable, adresse_mail]
        );

        const newUserId = resultUser.insertId;

        await db.query(
            `INSERT INTO membre (id_user, id_entreprise) VALUES (?, ?)`,
            [newUserId, id_entreprise]
        );

        return NextResponse.json({ message: "Utilisateur créé et lié à l'entreprise" }, { status: 201 });

    } catch (err) {
        console.error("Erreur création:", err);
        return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const suppr = searchParams.get("suppr");

        if (!suppr) {
            return NextResponse.json({ error: "ID manquant" }, { status: 400 });
        }

        await db.query("DELETE FROM membre WHERE id_user = ?", [suppr]);

        const [result] = await db.query("DELETE FROM users WHERE id = ?", [suppr]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        return NextResponse.json({ message: "Utilisateur et ses liens supprimés" }, { status: 200 });

    } catch (err) {
        console.error("Erreur DELETE:", err);
        return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const { id, name, firstname, num_tel_fixe, num_tel_portable, adresse_mail } = body;

        if (!id) {
            return NextResponse.json({ error: "L'identifiant de l'utilisateur est manquant." }, { status: 400 });
        }

        await db.query(
            `UPDATE users 
            SET name = ?, firstname = ?, num_tel_fixe = ?, num_tel_portable = ?, adresse_mail = ?
            WHERE id = ?`,
            [name, firstname, num_tel_fixe, num_tel_portable, adresse_mail, id]
        );

        return NextResponse.json({ message: "Utilisateur mis à jour avec succès" }, { status: 200 });

    } catch (err) {
        console.error("Erreur modification:", err);
        return NextResponse.json({ error: "Erreur lors de la modification" }, { status: 500 });;
    }
}