# Gestion de Stock & Inventaire

Application Fullstack moderne développée avec **Next.js** pour la gestion d'inventaire, le suivi des entreprises et l'attribution de matériel aux collaborateurs.

## Fonctionnalités Clés

* **Inventaire Dynamique** : Gestion complète (CRUD) des produits (Désignation, Fournisseur, S/N, MAC, Dates).
* **Recherche Intelligente** : Barre de recherche globale filtrant en temps réel.
* **Logique Métier Avancée** :
    * Attribution de produits aux entreprises.
    * Attribution granulaire aux utilisateurs/employés.
    * **Intégrité des données** : Le déréférencement d'un produit au niveau de l'entreprise nettoie automatiquement les attributions utilisateurs en base de données.
* **Interface Responsive** : Design épuré avec Tailwind CSS, incluant une pagination ajustable et des formulaires animés.

## Structure Technique

### Architecture des API (`app/api/`)
- **`/stock`** : Gestion du stock central (GET, POST, PUT, DELETE).
- **`/entreprise`** : Gestion des entreprises.
- **`/users`** : Gestion des utilisateurs.
- **`/attribuer/entreprise`** : Liaison Produit ↔ Entreprise et logique de nettoyage.
- **`/attribuer/user`** : Liaison Produit ↔ Utilisateur.

### Stack Technologique
- **Framework** : Next.js 14+ (App Router)
- **Base de données** : MySQL
- **ORM/Query Builder** : Accès direct via `mysql2` ([`lib/db.ts`](lib/db.ts))
- **Styling** : Tailwind CSS

## Installation & Lancement

1. **Cloner le projet** :
   ```sh
   git clone https://github.com/tomfrx12/gestion-stock.git
   cd gestion-stock
2. **Installer les dépendances** :
    ```sh
    npm install
3. **Configuration de l'environnement** :

    Créer un fichier .env à la racine et configurer les accès MySQL :
    ```sh
    HOST=localhost
    USER=root
    PASSWORD=secret
    DATABASE=bd
4. **Lancer le serveur de développement** :
    ```sh
    npm run dev
## Prérequis
Node.js 18+

Instance MySQL active

##  Auteur
Tom FOURNEAUX