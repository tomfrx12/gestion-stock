import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET() {
    try {
        const [rows] = await db.query("SELECT * FROM produits ORDER BY id DESC");
        return NextResponse.json(rows);
    } catch (err) {
        console.error("Erreur GET:", err);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { id, date_de_commande, fournisseur, designation, numero_de_serie, adresse_mac, commentaire } = body;

        const errors = {};
        if (!date_de_commande) return NextResponse.json({ error: "La date est requise.", errors: {numero_de_serie: "La date est requise." }}, {status: 400 });
        if (!fournisseur) return NextResponse.json({ error: "Le fournisseur est requis.", errors: {numero_de_serie: "Le fournisseur est requis." }}, {status: 400 });
        if (!designation) return NextResponse.json({ error: "La désignation est requise.", errors: {numero_de_serie: "La désignation est requise." }}, {status: 400 });
        if (!numero_de_serie) return NextResponse.json({ error: "Le numéro de série est requis.", errors: {numero_de_serie: "Le numéro de série est requis." }}, {status: 400 });

        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ error: "Validation échouée", errors }, { status: 400 });
        }

        const [rowsNum] = await db.query("SELECT numero_de_serie FROM produits WHERE numero_de_serie = ?", [numero_de_serie]);

        if (rowsNum.length > 0) {
            return NextResponse.json({ error: "Ce numéro de série existe déjà en stock", errors: {numero_de_serie: "Ce numéro de série existe déjà en stock" }}, {status: 400 });
        }
		
		if (body.numero_de_serie.includes(' ')) {
			return NextResponse.json({ error: "Le numéro de série ne peut pas contenir d'espace", errors: { numero_de_serie: "Le numéro de série ne peut pas contenir d'espace" }}, { status: 400 });
		};

        if (body.adresse_mac && body.adresse_mac.trim() !== "") {
            if (body.adresse_mac.includes(' ')) {
                return NextResponse.json({ 
                    error: "Format invalide", 
                    errors: { adresse_mac: "L'adresse mac ne peut pas contenir d'espace" } 
                }, { status: 400 });
            }

            const [rowsMac] = await db.query(
                "SELECT adresse_mac FROM produits WHERE adresse_mac = ?", 
                [adresse_mac]
            );

            if (rowsMac.length > 0) {
                return NextResponse.json({ 
                    error: "Doublon détecté", 
                    errors: { adresse_mac: "Cette adresse mac existe déjà en stock" } 
                }, { status: 400 });
            }
        }

        await db.query(
            "INSERT INTO produits (id, date_de_commande, fournisseur, designation, numero_de_serie, adresse_mac, commentaire) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [id, date_de_commande, fournisseur, designation, numero_de_serie, adresse_mac, commentaire]
        );

		return NextResponse.json({ message: "Produit ajouté" }, { status: 201 });
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

        await db.query("DELETE FROM produits WHERE id = ?", [suppr]);

        return NextResponse.json({ message: "Produit supprimé avec succès" }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const { id, date_de_commande, fournisseur, designation, numero_de_serie, adresse_mac, commentaire } = body;

         const [rowsNum] = await db.query(
            "SELECT id FROM produits WHERE numero_de_serie = ? AND id != ?", 
            [numero_de_serie, id]
        );

        if (rowsNum.length > 0) {
            return NextResponse.json({ error: "Ce numéro de série est déjà utilisé par un autre produit", errors: { numero_de_serie: "Ce numéro de série est déjà utilisé par un autre produit" }}, { status: 400 });
        }

        if (body.adresse_mac && body.adresse_mac.trim() !== "") {
            if (body.adresse_mac.includes(' ')) {
                return NextResponse.json({ 
                    error: "L'adresse mac ne peut pas contenir d'espace", 
                    errors: { adresse_mac: "L'adresse mac ne peut pas contenir d'espace" } 
                }, { status: 400 });
            }

            const [rowsMac] = await db.query(
                "SELECT id FROM produits WHERE adresse_mac = ? AND id != ?", 
                [adresse_mac, id]
            );

            if (rowsMac.length > 0) {
                return NextResponse.json({ 
                    error: "Cette adresse mac existe déjà en stock", 
                    errors: { adresse_mac: "Cette adresse mac existe déjà en stock" } 
                }, { status: 400 });
            }
        }

        const sql = `
            UPDATE produits 
            SET date_de_commande = ?, fournisseur = ?, designation = ?, numero_de_serie = ?, adresse_mac = ?, commentaire = ?
            WHERE id = ?
        `;
        
        await db.query(sql, [
            date_de_commande, 
            fournisseur, 
            designation, 
            numero_de_serie.toUpperCase(), 
            adresse_mac, 
            commentaire, 
            id
        ]);

        return NextResponse.json({ message: "Mise à jour réussie" }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erreur serveur lors de la modification" }, { status: 500 });
    }
}