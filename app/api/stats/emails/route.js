import { NextResponse } from "next/server";
import {db} from "../../../../lib/db";

export async function GET() {
    try {
        const [rows] = await db.query("SELECT COUNT(*) AS total FROM users WHERE adresse_mail IS NOT NULL");
        
        return NextResponse.json({ count: rows[0].total });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}