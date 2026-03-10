import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/Sidebar";

export const metadata: Metadata = {
    title: "Gestion Stock",
    description: "Petit project pour la gestion de stock",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="fr">
            <body className="antialiased">
                <Sidebar />
                <div className="min-h-screen">
                    {children}
                </div>
            </body>
        </html>
    );
}