"use client";
import { use, useEffect, useState } from "react";

export default function PageEntreprise({ params }) {    
    const resolvedParams = use(params);
    const nomUrl = decodeURIComponent(resolvedParams.nom); 

    const [entreprise, setEntreprise] = useState(null);

    const [count, setCount] = useState(0);
    
    const [users, setUsers] = useState([]);
    const [editingId, setEditingId] = useState(false);
    const [form, setForm] = useState({
        name: "",
        firstname: "",
        num_tel_fixe: "",
        num_tel_portable: "",
        adresse_mail: ""
    });
    const [showForm, setShowForm] = useState(false);

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
        try {
            const res = await fetch(`/api/users`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error("Erreur:", err);
        }
    }

    // async function fetchEmailCount(setCount) {
    //     try {
    //         const res = await fetch("/api/stats/emails");
    //         if (!res.ok) throw new Error("Erreur lors de la récupération");
            
    //         const data = await res.json();
    //         setCount(data.count);
    //     } catch (err) {
    //         console.error("Erreur compteur emails:", err.message);
    //     }
    // }

    useEffect(() => {
        fetchEntreprise();
        // fetchEmailCount(setCount);
        fetchUsers();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        
        const method = editingId ? "PUT" : "POST";

        try {
            const res = await fetch("/api/users", {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingId ? { ...form, id: editingId } : form),
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
        } catch (err) {
            setError(`Erreur : ${err.message}`);
        }
    }

    // function startEdit() {
    //     setFormUser({
    //         name: users.name,
    //         firstname: users.firstname,
    //         num_tel_fixe: users.num_tel_fixe,
    //         num_tel_portable: users.num_tel_portable,
    //         adresse_mail: users.adresse_mail,
    //     });
    //     setEditingIdUser(users.id);
    // }

    //     async function handleDelete(id) {
    //     try {
    //         const res = await fetch(`/api/users?suppr=${id}`, { method: "DELETE" });
    //         if (!res.ok) {
    //             return;
    //         }
    //         fetchUsers();
    //     } catch (err) {
    //         console.error(err);
    //     }
    // }

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
                    className={`flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg transition-all font-semibold shadow-sm ${showForm ? "mb-4": "mb-4"}`} 
                >
                    {showForm ? "Annuler" : "Ajouter un utilisateur"}
                    <span className={`transition-transform duration-300 ${showForm ? "rotate-180" : "rotate-0"}`}>▼</span>
                </button>
            </div>


            {showForm && (
                <section className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleSubmit} className={`max-w-4xl mx-auto grid grid-cols-2 gap-4 p-6 rounded-lg shadow-sm mb-8 border-t-4 ${editingId ? "bg-orange-50 border-orange-400" : "bg-gray-50 border-blue-400"}`}>
                        <h2 className="col-span-2 font-bold text-gray-700">
                            {`Nouveau utilisateur de l'entreprise`}
                        </h2>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold mb-1">Nom: </label>
                            <input className="border p-2 rounded" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold mb-1">Prénom: </label>
                            <input className="border p-2 rounded" type="text" value={form.firstname} onChange={(e) => setForm({ ...form, firstname: e.target.value })}/>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold mb-1">Fixe: </label>
                            <input className="border p-2 rounded" type="text" value={form.num_tel_fixe} onChange={(e) => setForm({ ...form, num_tel_fixe: e.target.value })}/>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold mb-1">Portable: </label>
                            <input className="border p-2 rounded" type="text" value={form.num_tel_portable} onChange={(e) => setForm({ ...form, num_tel_portable: e.target.value })}/>
                        </div>
                        <div className="col-span-2 flex flex-col">
                            <label className="text-sm font-semibold mb-1">Adresse mail: </label>
                            <input className="border p-2 rounded" type="text" value={form.adresse_mail} onChange={(e) => setForm({ ...form, adresse_mail: e.target.value })}/>
                        </div>
                        
                        <button type="submit" className={`col-span-2 text-white font-bold py-2 px-4 rounded transition shadow ${editingId ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-500 hover:bg-blue-600"}`}>
                            {editingId ? "Enregistrer les modifications" : "Ajouter l'entreprise"}
                        </button>
                    </form>
                </section>
            )}
            
            {/* <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6 border border-gray-200">
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="font-bold text-gray-600">Prénom: </label>
                        {editingId ? (
                            <input className="ml-2 border p-2 rounded bg-gray-50 focus:bg-white outline-blue-500" type="text" value={form.firstname} onChange={(e) => setForm({ ...form, firstname: e.target.value })}/>
                        ) : (
                            <span className="ml-2">{entreprise.firstname}</span>
                        )}
                    </div>

                    <div>
                        <label className="font-bold text-gray-600">Nom: </label>
                        {editingId ? (
                            <input className="ml-2 border p-2 rounded bg-gray-50 focus:bg-white outline-blue-500" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/>
                        ) : (
                            <span className="ml-2">{entreprise.name}</span>
                        )}
                    </div>

                    <div>
                        <label className="font-bold text-gray-600">Numéro téléphone fixe: </label>
                        {editingId ? (
                            <input className="ml-2 border p-2 rounded bg-gray-50 focus:bg-white outline-blue-500" type="text" value={form.num_tel_fixe} onChange={(e) => setForm({ ...form, num_tel_fixe: e.target.value })}/>
                        ) : (
                            <span className="ml-2">{entreprise.num_tel_fixe}</span>
                        )}
                    </div>

                    <div>
                        <label className="font-bold text-gray-600">Numéro téléphone portable: </label>
                        {editingId ? (
                            <input className="ml-2 border p-2 rounded bg-gray-50 focus:bg-white outline-blue-500" type="text" value={form.num_tel_portable} onChange={(e) => setForm({ ...form, num_tel_portable: e.target.value })}/>
                        ) : (
                            <span className="ml-2">{entreprise.num_tel_portable}</span>
                        )}
                    </div>

                    <div>
                        <label className="font-bold text-gray-600">Email: </label>
                        {editingId ? (
                            <input className="ml-2 border p-2 rounded bg-gray-50 focus:bg-white outline-blue-500" type="text" value={form.adresse_mail} onChange={(e) => setForm({ ...form, adresse_mail: e.target.value })}/>
                        ) : (
                            <span className="ml-2">{entreprise.adresse_mail}</span>
                        )}
                    </div>
                </div>
            </div> */}

            <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6 border border-gray-200 my-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-blue-600">Utilisateurs</h2>
                    <p>{`Nombre d'utilisateurs: `}
                        <span className="font-semibold text-blue-600">{count}</span>
                    </p>
                </div>

                <div className="shadow-md rounded-lg">
                    <table className="w-full text-left bg-white">
                        <thead className="bg-gray-200 text-gray-700">
                            <tr>
                                <th className="p-3">Nom</th>
                                <th className="p-3">Prénom</th>
                                <th className="p-3">Fixe</th>
                                <th className="p-3">Portable</th>
                                <th className="p-3">Adresse mail</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{user.firstname}</td>
                                    <td className="p-3">{user.name}</td>
                                    <td className="p-3">{user.num_tel_fixe}</td>
                                    <td className="p-3">{user.num_tel_portable}</td>
                                    <td className="p-3">{user.adresse_mail}</td>
                                    <td className="p-3 text-right space-x-2">
                                        <button onClick={() => startEdit(user)} className="text-orange-600 bg-orange-50 hover:bg-orange-600 hover:text-white px-3 py-1 rounded transition-colors text-sm font-bold">
                                            Modifier
                                        </button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 bg-red-50 hover:bg-red-600 hover:text-white px-3 py-1 rounded transition-colors text-sm font-bold">
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}