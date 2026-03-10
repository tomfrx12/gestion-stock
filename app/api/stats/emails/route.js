import { NextResponse } from "next/server";
import {db} from "../../../../lib/db";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const nomBoite = searchParams.get("nom_entreprise");

        if (!nomBoite) {
            return NextResponse.json({ error: "Nom d'entreprise manquant" }, { status: 400 });
        }

        const [rows] = await db.query(`
        SELECT 
            users.*, 
            COUNT(*) OVER() AS total 
        FROM users
        JOIN membre ON users.id = membre.id_user
        JOIN entreprise ON membre.id_entreprise = entreprise.id
        WHERE entreprise.nom = ? 
        AND users.adresse_mail IS NOT NULL;
        `, [nomBoite]);

        return NextResponse.json({ count: rows[0].total });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}