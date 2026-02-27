import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Gestion Stock",
    description: "Petit project pour la gestion de stock",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="fr">
            <body>
                {children}
            </body>
        </html>
    );
}
