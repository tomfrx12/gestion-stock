import { NextResponse } from "next/server";
import {db} from "../../../../lib/db";

export async function GET(req, { params }) {
    try {
        const { nom } = await params;
        const nomDecoded = decodeURIComponent(nom);
        // const [rows] = await db.query(
        //     `SELECT entreprise.*, users.*
        //      FROM entreprise 
        //      LEFT JOIN users ON entreprise.id_users = users.id 
        //      WHERE entreprise.nom = ?`,
        //     [nomDecoded]
        // );

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

// export async function PUT(req) {
//     try {
//         const body = await req.json();
//         const { id_users, name, firstname, num_tel_fixe, num_tel_portable, adresse_mail } = body;

//         if (!id_users) {
//             return NextResponse.json({ error: "ID Utilisateur manquant" }, { status: 400 });
//         }

//         await db.query(
//             `UPDATE users SET 
//                 name = ?, 
//                 firstname = ?, 
//                 num_tel_fixe = ?, 
//                 num_tel_portable = ?, 
//                 adresse_mail = ? 
//              WHERE id = ?`,
//             [name, firstname, num_tel_fixe, num_tel_portable, adresse_mail, id_users]
//         );

//         return NextResponse.json({ message: "Fondateur mis à jour !" }, { status: 200 });
//     } catch (err) {
//         console.error(err);
//         return NextResponse.json({ error: "Erreur lors de la modification" }, { status: 500 });
//     }
// }