"use client";
import { use, useEffect, useState } from "react";

export default function PageEntreprise({ params }) {    
    const resolvedParams = use(params);
    const nomUrl = decodeURIComponent(resolvedParams.nom); 

    const [entreprise, setEntreprise] = useState(null);
    const [count, setCount] = useState(0);
    const [users, setUsers] = useState([]);
    
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        name: "",
        firstname: "",
        num_tel_fixe: "",
        num_tel_portable: "",
        adresse_mail: ""
    });
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");

    async function fetchEntreprise() {
        try {
            const res = await fetch(`/api/entreprise/${encodeURIComponent(nomUrl)}`);
            if (res.ok) {
                const data = await res.json();
                setEntreprise(data);
            }
        } catch (err) {
            console.error("Erreur:", err);
        }
    }

    async function fetchUsers() {
        if (!nomUrl) return;
        try {
            const res = await fetch(`/api/users?nom_entreprise=${encodeURIComponent(nomUrl)}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error("Erreur:", err);
        }
    }

    async function fetchEmailCount(setCount) {
        try {
            const res = await fetch(`/api/stats/emails?nom_entreprise=${encodeURIComponent(nomUrl)}`);
            if (!res.ok) throw new Error("Erreur lors de la récupération");
            const data = await res.json();
            setCount(data.count);
        } catch (err) {
            console.error("Erreur compteur emails:", err.message);
        }
    }

    useEffect(() => {
        fetchEntreprise();
        fetchEmailCount(setCount);
        fetchUsers();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/users", {
                method: editingId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify( editingId ? { ...form, id: editingId, id_entreprise: entreprise.id } : { ...form, id_entreprise: entreprise.id } ),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Erreur lors de l'envoi");
                return;
            }

            setForm({        
                name: "",
                firstname: "",
                num_tel_fixe: "",
                num_tel_portable: "",
                adresse_mail: ""
            });
            setEditingId(null);
            setShowForm(false);
            fetchUsers();
            fetchEmailCount(setCount);
        } catch (err) {
            setError(`Erreur : ${err.message}`);
        }
    }

    function startEdit(user) {
        setForm({
            name: user.name,
            firstname: user.firstname,
            num_tel_fixe: user.num_tel_fixe,
            num_tel_portable: user.num_tel_portable,
            adresse_mail: user.adresse_mail,
        });
        setEditingId(user.id);
    }

    async function handleDelete(id) {
        try {
            const res = await fetch(`/api/users?suppr=${id}`, { method: "DELETE" });
            if (!res.ok) return;
            fetchUsers();
            fetchEmailCount(setCount);
        } catch (err) {
            console.error(err);
        }
    }

    if (!entreprise) return <p className="p-10">Chargement...</p>;

    return (
        <main className="p-6 mx-auto">
            <h1 className="max-w-4xl mx-auto text-3xl font-bold mb-4">
                {`Fiche de l'entreprise:`} <span className="text-blue-600">{entreprise.nom}</span>
            </h1>

            <div className="max-w-4xl mx-auto">
                <button 
                    onClick={() => {
                        setShowForm(!showForm);
                        if(showForm) setEditingId(null);
                    }} 
                    className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg transition-all font-semibold shadow-sm mb-4" 
                >
                    {showForm ? "Annuler" : "Ajouter un utilisateur"}
                    <span className={`transition-transform duration-300 ${showForm ? "rotate-180" : "rotate-0"}`}>▼</span>
                </button>
            </div>

            {showForm && !editingId && (
                <section className="animate-in fade-in slide-in-from-top-4 duration-300 max-w-4xl mx-auto mb-8">
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 p-6 bg-gray-50 rounded-lg shadow-sm border-t-4 border-blue-400">
                        <h2 className="col-span-2 font-bold text-gray-700">Nouvel utilisateur</h2>
                        <input className="border p-2 rounded" placeholder="Nom" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/>
                        <input className="border p-2 rounded" placeholder="Prénom" type="text" value={form.firstname} onChange={(e) => setForm({ ...form, firstname: e.target.value })}/>
                        <input className="border p-2 rounded" placeholder="Fixe" type="text" value={form.num_tel_fixe} onChange={(e) => setForm({ ...form, num_tel_fixe: e.target.value })}/>
                        <input className="border p-2 rounded" placeholder="Portable" type="text" value={form.num_tel_portable} onChange={(e) => setForm({ ...form, num_tel_portable: e.target.value })}/>
                        <input className="col-span-2 border p-2 rounded" placeholder="Email" type="text" value={form.adresse_mail} onChange={(e) => setForm({ ...form, adresse_mail: e.target.value })}/>
                        <button type="submit" className="col-span-2 bg-blue-500 text-white font-bold py-2 rounded">Ajouter</button>
                    </form>
                </section>
            )}

            {error && <p className="max-w-4xl mx-auto text-red-600 bg-red-100 p-3 my-4 rounded">{error}</p>}
            
            <div className="max-w-8xl mx-auto bg-white shadow rounded-lg p-6 border border-gray-200 my-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-blue-600">Utilisateurs</h2>
                    <p>{`Nombre d'utilisateur: `} <span className="font-semibold text-blue-600">{count}</span></p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left bg-white">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="p-3">Nom</th>
                                <th className="p-3">Prénom</th>
                                <th className="p-3">Fixe</th>
                                <th className="p-3">Portable</th>
                                <th className="p-3">Email</th>
                                <th className="p-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className={`border-b hover:bg-gray-50 ${editingId === user.id ? "bg-orange-50" : ""}`}>
                                    {editingId === user.id ? (
                                        <>
                                            <td className="p-2"><input className="border w-full p-1 rounded" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/></td>
                                            <td className="p-2"><input className="border w-full p-1 rounded" type="text" value={form.firstname} onChange={(e) => setForm({ ...form, firstname: e.target.value })}/></td>
                                            <td className="p-2"><input className="border w-full p-1 rounded" type="text" value={form.num_tel_fixe} onChange={(e) => setForm({ ...form, num_tel_fixe: e.target.value })}/></td>
                                            <td className="p-2"><input className="border w-full p-1 rounded" type="text" value={form.num_tel_portable} onChange={(e) => setForm({ ...form, num_tel_portable: e.target.value })}/></td>
                                            <td className="p-2"><input className="border w-full p-1 rounded" type="text" value={form.adresse_mail} onChange={(e) => setForm({ ...form, adresse_mail: e.target.value })}/></td>
                                            <td className="p-2 text-center space-x-2">
                                                <button onClick={handleSubmit} className="text-green-600 font-bold text-xs uppercase">Valider</button>
                                                <button onClick={() => setEditingId(null)} className="text-gray-500 font-bold text-xs uppercase">Annuler</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-3">{user.name}</td>
                                            <td className="p-3">{user.firstname}</td>
                                            <td className="p-3">{user.num_tel_fixe}</td>
                                            <td className="p-3">{user.num_tel_portable}</td>
                                            <td className="p-3">{user.adresse_mail}</td>
                                            <td className="p-3 text-center space-x-2">
                                                <button onClick={() => startEdit(user)} className="text-orange-600 bg-orange-50 hover:bg-orange-600 hover:text-white px-3 py-1 rounded transition-colors text-sm font-bold">Modifier</button>
                                                <button onClick={() => handleDelete(user.id)} className="text-red-600 bg-red-50 hover:bg-red-600 hover:text-white px-3 py-1 rounded transition-colors text-sm font-bold">Supprimer</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}