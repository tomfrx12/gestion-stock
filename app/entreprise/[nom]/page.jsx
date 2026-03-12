"use client";
import React, { use, useEffect, useState } from "react";

export default function PageEntreprise({ params }) {    
    const resolvedParams = use(params);
    const nomUrl = decodeURIComponent(resolvedParams.nom); 

    const [previous, setPrevious] = useState(0);
    const [next, setNext] = useState(10);
    const [rowsShown, setRowsShown] = useState(10);

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

    const [showList, setShowList] = useState(false);
    const [listProduits, setListProduits] = useState([]);

    const [showListForUser, setShowListForUser] = useState(null);
    const [listProduitsForUser, setListProduitsForUser] = useState([]);

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

    async function fetchProduits() {
        try {
            const res = await fetch(`/api/attribuer/entreprise?nom_entreprise=${encodeURIComponent(nomUrl)}`)
        if (!res.ok) throw new Error("Erreur lors de la récupération");
            const data = await res.json();
            setListProduits(data);
        } catch (err) {
            console.error("Erreur récupération produits:", err.message);
        }
    }

    async function fetchProduitsForUser(userId) {
        if (!userId) return;
        try {
            const res = await fetch(`/api/attribuer/user?nom_entreprise=${encodeURIComponent(nomUrl)}&id_user=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setListProduitsForUser(data);
            }
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchEntreprise();
        fetchEmailCount(setCount);
        fetchUsers();
        fetchProduits();
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

    async function handleCheckboxChange(idProduit, isChecked) {
        try {
            const res = await fetch("/api/attribuer/entreprise", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_produit: idProduit,
                    nom_entreprise: isChecked ? nomUrl : null
                }),
            });

            if (res.ok) {
                await fetchProduits(); 
                if (showListForUser) {
                    fetchProduitsForUser(showListForUser);
                }
            }
        } catch (err) {
            console.error("Erreur d'assignation:", err);
        }
    }

    async function handleCheckboxChangeUser(idProduit, idUser, isChecked) {
        try {
            const res = await fetch("/api/attribuer/user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_produit: idProduit,
                    id_user: idUser,
                    isChecked: isChecked
                }),
            });

            if (res.ok) {
                fetchProduitsForUser(idUser);
            }
        } catch (err) {
            console.error("Erreur:", err);
        }
    }

    if (!entreprise) return <p className="p-10">Chargement...</p>;

    return (
        <main className="p-6 mx-auto">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">
                    {`Fiche de l'entreprise:`} <span className="text-blue-600">{entreprise.nom}</span>
                </h1>

                <div className="flex gap-8">
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

                    <button onClick={() => {setShowList(!showList)}} className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg transition-all font-semibold shadow-sm mb-4" >
                        Attribué des produits
                        <span className={`transition-transform duration-300 ${showList ? "rotate-180" : "rotate-0"}`}>▼</span>
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

                {showList && (
                    <table className="min-w-6xl justify-self-center">
                        <thead>
                            <tr>
                                <th className="p-3 flex gap-2 items-center bg-gray-200 text-gray-700">
                                    <label>Nombre de lignes</label>
                                    <select className="border border-solid border-black rounded-sm p-1 bg-white" name="nb_row_shown" onChange={(e) => (setPrevious(Number(0)), setNext(Number(e.target.value)), setRowsShown(Number(e.target.value)), console.log(previous, next, rowsShown))}>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </th>
                            </tr>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="p-3">Attribuer ?</th>
                                <th className="p-3">Désignation</th>
                                <th className="p-3">Fournisseur</th>
                                <th className="p-3">N° Série</th>
                                <th className="p-3">Adresse Mac</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Commentaire</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listProduits.map((produit) => (
                                <tr key={produit.id} className="border-b border-r border-l hover:bg-gray-50">
                                    <td>
                                        <input className="flex m-auto w-4 h-4" type="checkbox" checked={produit.id_entreprise !== null} onChange={(e) => handleCheckboxChange(produit.id, e.target.checked)}/>
                                    </td>
                                    <td className="p-3 font-medium">{produit.designation}</td>
                                    <td className="p-3">{produit.fournisseur}</td>
                                    <td className="p-3">{produit.numero_de_serie}</td>
                                    <td className="p-3">{produit.adresse_mac}</td>
                                    <td className="p-3">{produit.date_de_commande}</td>
                                    <td className="p-3">{produit.commentaire}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {error && <p className="text-red-600 bg-red-100 p-3 my-4 rounded">{error}</p>}
            </div>
            
            <div className="max-w-8xl mx-auto bg-white shadow rounded-lg p-6 border border-gray-200 my-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-blue-600">Utilisateurs</h2>
                    <p>{`Nombre d'utilisateur: `} <span className="font-semibold text-blue-600">{count}</span></p>
                </div>

                <div className="overflow-x-auto">
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
                                <th className="p-3">Nom</th>
                                <th className="p-3">Prénom</th>
                                <th className="p-3">Fixe</th>
                                <th className="p-3">Portable</th>
                                <th className="p-3">Email</th>
                                <th className="p-3 text-center">Action</th>
                            </tr>
                        </thead>
                        {users.map((user) => (
                            <tbody key={user.id}>
                                <tr className="border-b hover:bg-gray-50">
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
                                                <button 
                                                    onClick={() => {
                                                        const newId = showListForUser === user.id ? null : user.id;
                                                        setShowListForUser(newId);
                                                        if (newId) fetchProduitsForUser(newId);
                                                    }}
                                                    className={`px-3 py-1 rounded transition-colors text-sm font-bold ${showListForUser === user.id ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"}`}
                                                >
                                                    {showListForUser === user.id ? "Fermer" : "Attribuer"}
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>

                                {showListForUser === user.id && (
                                    <tr className="bg-blue-50">
                                        <td colSpan="6" className="p-4 border-b border-blue-200">
                                            <div className="bg-white p-4 rounded-lg border border-blue-100">                                              
                                                <div className="grid grid-cols-3 gap-3">
                                                    {listProduitsForUser.length > 0 ? (
                                                        listProduitsForUser.map((produit) => (
                                                            <label key={produit.id} className="flex items-center gap-3 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                                                                <input type="checkbox" className="w-4 h-4" checked={produit.est_attribue !== null} onChange={(e) => handleCheckboxChangeUser(produit.id, user.id, e.target.checked)}/>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium">{produit.designation}</span>
                                                                    <span className="text-xs text-gray-500">Numéro de série: {produit.numero_de_serie}</span>
                                                                </div>
                                                            </label>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500 text-sm italic">Aucun produit disponible pour cette entreprise. Veuillez en ajouter, ou en créer de nouveaux.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            ))}
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
                            className={`border border-gray-400 rounded-md p-4 max-h-4 max-w-4 flex items-center justify-center text-center ${next >= listProduits.length ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => {                    
                            if (next < listProduits.length) {
                                setPrevious(previous + rowsShown);
                                setNext(next + rowsShown);
                            }
                            }}
                            disabled={next >= listProduits.length}
                        >
                            {`>`}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}