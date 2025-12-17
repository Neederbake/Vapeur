# 🎮 Vapeur

Application Express/Handlebars pour gérer une bibliothèque de jeux vidéo, leurs éditeurs et leurs genres. Les listes sont triées, chaque fiche est cliquable, et l’accueil met en avant les jeux « featured ».

## 🚀 Prérequis
- Node.js 18+
- SQLite (embarqué par Prisma)

## 🔧 Installation
1) Installer les dépendances : `npm install`
2) Créer un fichier `.env` à la racine avec `DATABASE_URL="file:./dev.db"`
3) Générer le client Prisma : `npx prisma generate`
4) Appliquer les migrations si nécessaire : `npx prisma migrate dev`
5) (Optionnel) Préremplir les genres via le script d’init appelé au démarrage : voir [js/seed.js](js/seed.js)

## ▶️ Scripts NPM
- `npm run dev` : lance le serveur avec nodemon sur le port 3008
- `npm start` : lance le serveur en mode production

## 📁 Arborescence (principaux fichiers)
```
Vapeur/
├─ image/                  # Assets (logo…)
├─ js/
│  └─ seed.js              # Initialisation des genres au démarrage
├─ prisma/
│  ├─ migrations/          # Historique des migrations Prisma
│  └─ schema.prisma        # Schéma de la base SQLite
├─ public/
│  └─ css/style.css        # Styles globaux
├─ views/                  # Templates Handlebars
│  ├─ editeurs/            # CRUD éditeurs
│  ├─ genres/              # Liste/détails des genres
│  ├─ jeux/                # CRUD jeux
│  ├─ errors/              # 404
│  ├─ partials/            # header/footer
│  ├─ index.hbs            # Page d’accueil (jeux en avant)
│  └─ layout.hbs           # Layout principal
├─ main.js                 # Serveur Express + routes
├─ package.json            # Dépendances et scripts
└─ README.md               # Ce fichier
```

## 🗄️ Modèle de données (Prisma)
```prisma
model Jeux {
  id          Int       @id @default(autoincrement())
  titre       String
  description String
  createdAt   DateTime  @default(now())
  featured    Boolean   @default(false)
  genreId     Int?
  genres      Genres?   @relation(fields: [genreId], references: [id])
  editeurId   Int?
  editeur     Editeurs? @relation(fields: [editeurId], references: [id])
}

model Genres {
  id           Int    @id @default(autoincrement())
  nom          String
  jeux_publies Jeux[]
}

model Editeurs {
  id           Int    @id @default(autoincrement())
  nom          String
  jeux_publies Jeux[]
}
```

## ✨ Fonctionnalités
- CRUD pour Jeux, Éditeurs, Genres
- Tri alphabétique des listes
- Page d’accueil avec jeux mis en avant (`featured`)
- Navigation cohérente et fiches entièrement cliquables

## 🧭 Points d’entrée utiles
- Routes et logique serveur : [main.js](main.js)
- Templates Handlebars : [views](views)
- Schéma et migrations : [prisma](prisma)
- Script d’initialisation des genres : [js/seed.js](js/seed.js)

---
Projet réalisé dans le cadre du cours **R3.01 Développement Web** (IUT Informatique).