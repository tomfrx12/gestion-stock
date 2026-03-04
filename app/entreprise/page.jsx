"use client";
import { useEffect, useState } from "react";

export default function Stock() {
    const [entreprises, setEntreprise] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [previous, setPrevious] = useState(0);
    const [next, setNext] = useState(10);
    const [rowsShown, setRowsShown] = useState(10);
    const [form, setForm] = useState({
        nom_entreprise: "",
        reference_client: "",
        id_users: ""
    });
    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});

    async function fetchEntreprise() {
        try {
            const res = await fetch("/api/entreprise");
            if (!res.ok) {
                setError("Erreur lors du chargement");
                setEntreprise([]);
                return;
            }
            setEntreprise(await res.json());
        } catch (err) {
            setError(`Erreur : ${err.message}`);
        }
    }

    useEffect(() => { 
        fetchEntreprise(); 
    }, []);

    function startEdit(entreprise) {
        setForm({
            nom_entreprise: entreprise.nom_entreprise,
            reference_client: entreprise.reference_client,
            id_users: entreprise.id_users
        });
        setEditingId(entreprise.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setErrors({});
        
        const method = editingId ? "PUT" : "POST";

        try {
            const res = await fetch("/api/entreprise", {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingId ? { ...form, id: editingId } : form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Erreur lors de l'envoi");
                return;
            }

            setForm({ nom_entreprise: "", reference_client: "", id_users: "" });
            setEditingId(null);
            setShowForm(false);
            fetchEntreprise();
        } catch (err) {
            setError(`Erreur : ${err.message}`);
        }
    }

    async function handleDelete(id) {
        setError("");
        try {
            const res = await fetch(`/api/entreprise?suppr=${id}`, { method: "DELETE" });
            if (!res.ok) {
                setError("Erreur lors de la suppression");
                return;
            }
            fetchEntreprise();
        } catch (err) {
            setError(`Erreur : ${err.message}`);
        }
    }

    return (
        <main className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-blue-600">Gestion des Entreprises</h1>

            <button 
                onClick={() => {
                    setShowForm(!showForm);
                    if(showForm) setEditingId(null);
                }} 
                className={`flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg transition-all font-semibold shadow-sm ${showForm ? "mb-4": "mb-4"}`} 
            >
                {showForm ? "Annuler" : "Ajouter une entreprise"}
                <span className={`transition-transform duration-300 ${showForm ? "rotate-180" : "rotate-0"}`}>▼</span>
            </button>

            {showForm && (
                <section className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleSubmit} className={`grid grid-cols-2 gap-4 p-6 rounded-lg shadow-sm mb-8 border-t-4 ${editingId ? "bg-orange-50 border-orange-400" : "bg-gray-50 border-blue-400"}`}>
                        <h2 className="col-span-2 font-bold text-gray-700">
                            {editingId ? `Modification de l'entreprise` : "Nouvelle entreprise"}
                        </h2>
                        <div className="flex flex-col">
                            <label className="test-sm font-semibold mb-1">Nom</label>
                            <input className="border p-2 rounded" type="text" value={form.nom_entreprise} onChange={(e) => setForm({ ...form, nom_entreprise: e.target.value })}/>
                        </div>
                        <div className="flex flex-col">
                            <label className="test-sm font-semibold mb-1">Référence Client</label>
                            <input className="border p-2 rounded" type="text" value={form.reference_client} onChange={(e) => setForm({ ...form, reference_client: e.target.value.toUpperCase() })}/>
                        </div>
                        <div className="flex flex-col col-span-2">
                            <label className="test-sm font-semibold mb-1">Utilisateurs</label>
                            <input className="border p-2 rounded" placeholder="Ex: Gérant, Employés, ..." value={form.id_users} onChange={(e) => setForm({ ...form, id_users: e.target.value })}/>
                        </div>
                        
                        <button type="submit" className={`col-span-2 text-white font-bold py-2 px-4 rounded transition shadow ${editingId ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-500 hover:bg-blue-600"}`}>
                            {editingId ? "Enregistrer les modifications" : "Ajouter l'entreprise"}
                        </button>
                    </form>
                </section>
            )}

            {error && <p className="text-red-600 bg-red-100 p-3 my-4 rounded">{error}</p>}

            <div className="shadow-md rounded-lg">
                <table className="w-full text-left bg-white">
                    <thead className="bg-gray-200 text-gray-700">
                        <tr>
                            <th className="p-3">Nom</th>
                            <th className="p-3">Référence Client</th>
                            <th className="p-3">Utilisateurs</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
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
                    </thead>
                    <tbody>
                        {entreprises.slice(previous, next).map((entreprise) => (
                            <tr key={entreprise.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium">{entreprise.nom_entreprise}</td>
                                <td className="p-3 text-gray-600">{entreprise.reference_client}</td>
                                <td className="p-3 font-mono text-sm">{entreprise.id_users}</td>
                                <td className="p-3 text-right space-x-2">
                                    <button onClick={() => startEdit(entreprise)} className="text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-3 py-1 rounded transition-colors text-sm font-bold">
                                        Modifier
                                    </button>
                                    <button onClick={() => handleDelete(entreprise.id)} className="text-red-600 bg-red-50 hover:bg-red-600 hover:text-white px-3 py-1 rounded transition-colors text-sm font-bold">
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
                    className={`border border-gray-400 rounded-md p-4 max-h-4 max-w-4 flex items-center justify-center text-center ${next >= entreprises.length ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => {                    
                    if (next < entreprises.length) {
                        setPrevious(previous + rowsShown);
                        setNext(next + rowsShown);
                    }
                    }}
                    disabled={next >= entreprises.length}
                >
                    {`>`}
                </button>
                </div>
            </div>
        </main>
    );
}