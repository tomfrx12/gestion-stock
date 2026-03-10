"use client";

import Link from "next/link";

export default function Index() {
    return (
        <main className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
            <div className="max-w-4xl w-full text-center space-y-8">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    Gestionnaire de <span className="text-blue-600">Stock</span>
                </h1>

                <div className="flex flex-col gap-6 mx-auto">
                    <Link href="/entreprise">
                        <div className="w-full h-full p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col items-center">
                            <h2 className="text-xl font-bold text-gray-800">Entreprises</h2>
                        </div>
                    </Link>
                    <Link href="/stock">
                        <div className="w-full h-full p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col items-center">
                            <h2 className="text-xl font-bold text-gray-800">Produits</h2>
                        </div>
                    </Link>
                </div>
            </div>
        </main>
    );
}