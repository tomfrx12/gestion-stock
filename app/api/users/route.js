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
        `, [nomBoite]);

        return NextResponse.json(rows);
    } catch (err) {
        console.error("Erreur GET:", err);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// export async function POST(req) {
//     try {
//         const body = await req.json();
//         const { name, firstname, num_tel_fixe, num_tel_portable, adresse_mail } = body;

//         const isOnlyDigitsNumTelFixe = /^[0-9 ]+$/.test(body.num_tel_fixe);
//         if (!isOnlyDigitsNumTelFixe) {
//             return NextResponse.json(
//                 { error: "Le numéro téléphone fixe doit contenir uniquement des chiffres (pas de lettres, ou de symboles)" }, 
//                 { status: 400 }
//             );
//         }

//         const isOnlyDigitsNumTelPortable = /^[0-9 ]+$/.test(body.num_tel_portable);
//         if (!isOnlyDigitsNumTelPortable) {
//             return NextResponse.json(
//                 { error: "Le numéro téléphone portable doit contenir uniquement des chiffres (pas de lettres, ou de symboles)" }, 
//                 { status: 400 }
//             );
//         }

//         const isIncludeAt = /@/.test(body.adresse_mail);
//         if (!isIncludeAt) {
//             return NextResponse.json(
//                 { error: "L'adresse mail est invalide (veuillez rajouter l'arobase)" }, 
//                 { status: 400 }
//             );
//         }

//         await db.query(
//             "INSERT INTO users (name, firstname, num_tel_fixe, num_tel_portable, adresse_mail) VALUES (?, ?, ?, ?, ?)",
//             [name, firstname, num_tel_fixe, num_tel_portable, adresse_mail]
//         );

//         return NextResponse.json({ message: "Utilisateur ajouté" }, { status: 201 });
//     } catch (err) {
//         console.error("Erreur POST:", err);
//         return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
//     }
// }

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, firstname, num_tel_fixe, num_tel_portable, adresse_mail, id_entreprise } = body;

        // if (!adresse_mail.includes('@')) {
        //     return NextResponse.json({ error: "Email invalide" }, { status: 400 });
        // }

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

// export async function DELETE(req) {
//     try {
//         const { searchParams } = new URL(req.url);
//         const suppr = searchParams.get("suppr");

//         if (!suppr) {
//             return NextResponse.json({ error: "ID manquant" }, { status: 400 });
//         }

//         await db.query("UPDATE entreprise SET id_users = NULL WHERE id_users = ?", [suppr]);
//         await db.query("DELETE FROM users WHERE id = ?", [suppr]);

//         return NextResponse.json({ message: "Utilisateur supprimé avec succès" }, { status: 200 });

//     } catch (err) {
//         console.error(err);
//         return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
//     }
// }