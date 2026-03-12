"use client";
import { useEffect, useState } from "react";

export default function Stock() {
    const [produits, setProduits] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [previous, setPrevious] = useState(0);
    const [next, setNext] = useState(10);
    const [rowsShown, setRowsShown] = useState(10);
    const [form, setForm] = useState({
        date_de_commande: "",
        fournisseur: "",
        designation: "",
        numero_de_serie: "",
        adresse_mac: "",
        commentaire: "",
    });
    const [error, setError] = useState("");

    async function fetchProduits() {
        try {
            const res = await fetch("/api/stock");
            if (!res.ok) {
                setError("Erreur lors du chargement");
                setProduits([]);
                return;
            }
            setProduits(await res.json());
        } catch (err) {
            setError(`Erreur : ${err.message}`);
        }
    }

    useEffect(() => { 
        fetchProduits();
    }, []);

    function startEdit(produit) {
        setForm({
            date_de_commande: produit.date_de_commande,
            fournisseur: produit.fournisseur,
            designation: produit.designation,
            numero_de_serie: produit.numero_de_serie,
            adresse_mac: produit.adresse_mac,
            commentaire: produit.commentaire,
        });
        setEditingId(produit.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        
        const method = editingId ? "PUT" : "POST";

        try {
            const res = await fetch("/api/stock", {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingId ? { ...form, id: editingId } : form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Erreur lors de l'envoi");
                return;
            }

            setForm({ date_de_commande: "", fournisseur: "", designation: "", numero_de_serie: "", adresse_mac: "", commentaire: "" });
            setEditingId(null);
            setShowForm(false);
            fetchProduits();
        } catch (err) {
            setError(`Erreur : ${err.message}`);
        }
    }

    async function handleDelete(id) {
        setError("");
        try {
            const res = await fetch(`/api/stock?suppr=${id}`, { method: "DELETE" });
            if (!res.ok) {
                setError("Erreur lors de la suppression");
                return;
            }
            fetchProduits();
        } catch (err) {
            setError(`Erreur : ${err.message}`);
        }
    }

    return (
        <main className="p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-blue-600">Gestion du Stock</h1>
                <button 
                    onClick={() => {
                        setShowForm(!showForm);
                        if(showForm) setEditingId(null);
                    }} 
                    className={`flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg transition-all font-semibold shadow-sm ${showForm ? "mb-4": "mb-4"}`} 
                >
                    {showForm ? "Annuler" : "Ajouter un produit"}
                    <span className={`transition-transform duration-300 ${showForm ? "rotate-180" : "rotate-0"}`}>▼</span>
                </button>

                {showForm && (
                    <section className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <form onSubmit={handleSubmit} className={`grid grid-cols-2 gap-4 p-6 rounded-lg shadow-sm mb-8 border-t-4 ${editingId ? "bg-orange-50 border-orange-400" : "bg-gray-50 border-blue-400"}`}>
                            <h2 className="col-span-2 font-bold text-gray-700">
                                {editingId ? `Modification du produit` : "Nouveau produit"}
                            </h2>
                            <div className="flex flex-col">
                                <label className="text-sm font-semibold mb-1">Date</label>
                                <input className="border p-2 rounded" type="date" value={form.date_de_commande} onChange={(e) => setForm({ ...form, date_de_commande: e.target.value })} />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm font-semibold mb-1">Fournisseur</label>
                                <input className="border p-2 rounded" type="text" value={form.fournisseur} onChange={(e) => setForm({ ...form, fournisseur: e.target.value })} />
                            </div>

                            <div className="flex flex-col col-span-2">
                                <label className="text-sm font-semibold mb-1">Désignation</label>
                                <input className="border p-2 rounded" type="text" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
                            </div>

                            <div className="col-span-2 grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="text-sm font-semibold mb-1">N° de Série</label>
                                    <input className="border p-2 rounded uppercase" type="text" value={form.numero_de_serie} onChange={(e) => setForm({ ...form, numero_de_serie: e.target.value.toUpperCase() })} />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-semibold mb-1">Adresse MAC</label>
                                    <input className="border p-2 rounded uppercase" type="text" value={form.adresse_mac} onChange={(e) => setForm({ ...form, adresse_mac: e.target.value.toUpperCase() })} />
                                </div>
                            </div>

                            <textarea className="border p-2 rounded col-span-2" placeholder="Commentaire" value={form.commentaire} onChange={(e) => setForm({ ...form, commentaire: e.target.value })} />

                            <button type="submit" className={`col-span-2 text-white font-bold py-2 px-4 rounded transition shadow ${editingId ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-500 hover:bg-blue-600"}`}>
                                {editingId ? "Enregistrer les modifications" : "Ajouter au stock"}
                            </button>
                        </form>
                    </section>
                )}

                {error && <p className="text-red-600 bg-red-100 p-3 my-4 rounded">{error}</p>}
            </div>



            <div className="max-w-8xl mx-auto shadow-md rounded-lg">
                <table className="w-full text-left bg-white">
                    <thead className="bg-gray-200 text-gray-700">
                        <tr>
                            <th className="p-3 flex gap-2 items-center">
                                <label>Nombre de lignes</label>
                                <select className="border border-solid border-black rounded-sm p-1 bg-white" name="nb_row_shown" onChange={(e) => (setPrevious(Number(0)), setNext(Number(e.target.value)), setRowsShown(Number(e.target.value)), console.log(previous, next, rowsShown))}>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </th>
                        </tr>
                        <tr>
                            <th className="p-3">Désignation</th>
                            <th className="p-3">Fournisseur</th>
                            <th className="p-3">N° Série</th>
                            <th className="p-3">Adresse Mac</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Commentaire</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {produits.slice(previous, next).map((produit) => (
                            <tr key={produit.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium">{produit.designation}</td>
                                <td className="p-3">{produit.fournisseur}</td>
                                <td className="p-3">{produit.numero_de_serie}</td>
                                <td className="p-3">{produit.adresse_mac}</td>
                                <td className="p-3">{produit.date_de_commande}</td>
                                <td className="p-3">{produit.commentaire}</td>
                                <td className="p-3 text-right space-x-2">
                                    <button onClick={() => startEdit(produit)} className="text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-3 py-1 rounded transition-colors text-sm font-bold">
                                        Modifier
                                    </button>
                                    <button onClick={() => handleDelete(produit.id)} className="text-red-600 bg-red-50 hover:bg-red-600 hover:text-white px-3 py-1 rounded transition-colors text-sm font-bold">
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-3 flex justify-center gap-4">
                    <button 
                        className={`border border-gray-400 rounded-md p-4 max-h-4 max-w-4 flex items-center justify-center text-center ${previous === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => {
                        const futurPrevious = previous - rowsShown;

                        if (futurPrevious >= 0) {
                            setPrevious(futurPrevious);
                            setNext(next - rowsShown);
                        }
                        }}
                        disabled={previous === 0}
                    >
                        {`<`}
                    </button>

                    <button 
                        className={`border border-gray-400 rounded-md p-4 max-h-4 max-w-4 flex items-center justify-center text-center ${next >= produits.length ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => {                    
                        if (next < produits.length) {
                            setPrevious(previous + rowsShown);
                            setNext(next + rowsShown);
                        }
                        }}
                        disabled={next >= produits.length}
                    >
                        {`>`}
                    </button>
                </div>
            </div>
        </main>
    );
}