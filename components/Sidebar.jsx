"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 transition-colors"
            >
                ☰
            </button>

            {isOpen && (
                <div 
                    className="fixed inset-0 bg-opacity-50 z-40 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 text-2xl">×</button>
                    </div>

                    <button 
                        onClick={() => (router.back(), setIsOpen(false))} 
                        className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-4"
                    >
                        <span className="mr-2">←</span> Retour
                    </button>

                    <nav className="space-y-4 flex-1">
                        <Link href="/index" onClick={() => setIsOpen(false)} className="block p-3 hover:bg-blue-50 rounded-lg text-gray-700 font-medium">Accueil</Link>
                        <Link href="/entreprise" onClick={() => setIsOpen(false)} className="block p-3 hover:bg-blue-50 rounded-lg text-gray-700 font-medium">Entreprises</Link>
                        <Link href="/stock" onClick={() => setIsOpen(false)} className="block p-3 hover:bg-blue-50 rounded-lg text-gray-700 font-medium">Produits</Link>
                    </nav>
                </div>
            </div>
        </>
    );
}