 # - faire : 
  - Editeur
  - Genres
  - Jeux
  - CSS
  - README
  - ah oui, index.hbs -> footer
  - ajouter des images ( logo )
  - README
  - submit a enlever
# readme fait par ia, à changer
# 🎮 Vapeur

**Vapeur est une mini-application Web permettant de gérer une bibliothèque de jeu vidéo, avec leurs éditeurs et les différents genres de jeux existants.**


## 💻 Comment l'installer ?



## 📄 Fonctionnalités (suivant le cahier des charges) :
- Disposer des éléments suivants : Jeux, Éditeurs, Types (cf structure de la base de données)
- Ajouter les CRUD pour chaque élément
- Afficher une page principale sur laquelle on peut ajouter un ou plusieurs jeux mis en avant
- Les listes doivent être triées par ordre alphabétique
- Inclure une navigation principale
- Rendre tous les éléments cliquables (*Cliquer sur un jeu permet d'accéder aussi à son éditeur, duquel on peut voir tous les jeux associés...*)



## 📁 Structure globale du projet

**Version en cours de développement !**
```
Vapeur/
├── js/                      # Scripts côté serveur
│   └── seed.js              # Script de seed pour la base de données
├── prisma/                  # Configuration base de données
│   ├── schema.prisma        # Schéma de la DB (SQLite)
│   └── migrations/          # Historique des migrations
├── public/                  # Fichiers statiques
│   └── css/
│       └── style.css        # Styles principaux
├── views/                   # Templates Handlebars
│   ├── editors/             # Pages éditeurs
│   │   ├── index.hbs        # Liste des éditeurs
│   │   ├── details.hbs      # Page détail éditeur
│   │   ├── new.hbs          # Formulaire création éditeur
│   │   └── edit.hbs         # Formulaire modification éditeur
│   ├── games/               # Pages jeux
│   │   ├── index.hbs        # Liste des jeux
│   │   ├── details.hbs      # Page détail jeu
│   │   ├── new.hbs          # Formulaire création jeu
│   │   └── edit.hbs         # Formulaire modification jeu
│   ├── types/               # Pages types de jeux
│   │   ├── index.hbs        # Liste des types
│   │   └── details.hbs      # Page détail type
│   ├── partials/            # Composants réutilisables
│   │   └── footer.hbs       # Pied de page
│   ├── layout.hbs           # Template principal
│   └── index.hbs            # Page d'accueil avec jeux mis en avant
├── main.js                  # Serveur Express avec toutes les routes
├── package.json             # Dépendances npm
└── README.md                # Documentation
```

## 🗄️ Modèle de données

```prisma
```

```


#### </> Technologies utilisées 
- Express
- Nodemon
- Prisma v6.19.0
- sqlite3
- Handlebars
- Vs Code
- langage principaux : Js, HTML, CSS


>*Ce projet est réalisé dans le cadre du cours **R3.01 Développement Web** - IUT Informatique*

---

>Réalisé par ia et piqué sur corentin chitwood, quel goat