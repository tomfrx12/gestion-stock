"use client";
import { useState } from 'react';

type Produit = {
  date_de_commande: string;
  fournisseur: string;
  designation: string;
  numero_de_serie: string;
  adresse_mac: string;
  commentaire: string;
};

export default function Stock() {
    const [produits, setProduits] = useState<Produit[]>([]);
    const [form, setForm] = useState({
        date_de_commande: "",
        fournisseur: "",
        designation: "",
        numero_de_serie: "",
        adresse_mac: "",
        commentaire: "",
    });

    async function fetchProduits() {
        const res = await fetch("/api/stock");
        const data = await res.json();
        setProduits(data);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        await fetch("/api/stock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        setForm({
            date_de_commande: "",
            fournisseur: "",
            designation: "",
            numero_de_serie: "",
            adresse_mac: "",
            commentaire: "",
        });

        fetchProduits();
    }

    return (
        <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">Gestion du Stock</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg shadow-sm mb-10">
            <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">Date</label>
                <input 
                    className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" 
                    type="date" 
                    value={form.date_de_commande} 
                    onChange={e => setForm({ ...form, date_de_commande: e.target.value })} 
                />
            </div>
            <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">Fournisseur</label>
                <input 
                    className="border p-2 rounded" 
                    type="text" 
                    placeholder="Ex: Unyx..." 
                    value={form.fournisseur} 
                    onChange={e => setForm({ ...form, fournisseur: e.target.value })} 
                />
            </div>
            <div className="flex flex-col col-span-2">
                <label className="text-sm font-semibold mb-1">Désignation</label>
                <input 
                    className="border p-2 rounded" type="text" 
                    placeholder="Nom du produit" 
                    value={form.designation} 
                    onChange={e => setForm({ ...form, designation: e.target.value })} 
                />
            </div>
            <input 
                className="border p-2 rounded" 
                type="text" 
                placeholder="N° de Série" 
                value={form.numero_de_serie} 
                onChange={e => setForm({ ...form, numero_de_serie: e.target.value })} 
            />
            <input 
                className="border p-2 rounded" 
                type="text" 
                placeholder="Adresse MAC"
                value={form.adresse_mac} 
                onChange={e => setForm({ ...form, adresse_mac: e.target.value })} 
            />
            <textarea 
                className="border p-2 rounded col-span-2" 
                placeholder="Commentaire" 
                value={form.commentaire} 
                onChange={e => setForm({ ...form, commentaire: e.target.value })} 
            />
        
            <button type="submit" className="col-span-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition shadow">
                Ajouter au stock
            </button>
        </form>

        <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="w-full text-left bg-white">
                <thead className="bg-gray-200 text-gray-700">
                    <tr>
                        <th className="p-3">Désignation</th>
                        <th className="p-3">Fournisseur</th>
                        <th className="p-3">N° Série</th>
                        <th className="p-3">Date Commande</th>
                    </tr>
                </thead>
                <tbody>
                    {produits.map((produit) => (
                        <tr key={produit.numero_de_serie} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{produit.designation}</td>
                            <td className="p-3 text-gray-600">{produit.fournisseur}</td>
                            <td className="p-3 font-mono text-sm">{produit.numero_de_serie}</td>
                            <td className="p-3">{produit.date_de_commande}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </main>
  );
}