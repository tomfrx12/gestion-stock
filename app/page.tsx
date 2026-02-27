"use client";
import { useState, useEffect } from 'react';
import "./globals.css";


type Produit = {
    idproduit: number;
    nom: string;
    description: string;
    categorie: string;
    idfournisseur: number;
    quantite: number;
};

export default function Stock() {
    const [produits, setProduits] = useState<Produit[]>([]);

    useEffect(() => {
        async function fetchProduits() {
            try {
                const res = await fetch('/api/stock');
                const data = await res.json();
                setProduits(data);
            } catch (err) {
                console.error('Erreur pour chercher les produits:', err);
            }
        }
        fetchProduits();
    }, []);

    return (
        <main className='p-2'>
            <h1>Produits en stock</h1>
            <div className='grid grid-cols-4 gap-2'>
                {produits.map((produit) => (
                    <ul className='border-2 border-black my-2 p-4 flex flex-col' key={produit.idproduit}>
                        <li className='hover:bg-gray-200'>{produit.nom}</li>
                        <li className='hover:bg-gray-200'>{produit.description}</li>
                        <li className='hover:bg-gray-200'>{produit.categorie}</li>
                        <li className='hover:bg-gray-200'>{produit.idfournisseur}</li>
                        <li className='hover:bg-gray-200'>{produit.quantite}</li>
                    </ul>
                ))}
            </div>
        </main>
    );
}