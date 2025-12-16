const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const prisma = new PrismaClient();
const PORT = 3008;



//////////////////////////////////////////////////////////////////////////////
//////////////////// MIDDLEWARE //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////// 


app.use(express.static("public"));
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration Handlebars
const hbs = require("hbs");
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(path.join(__dirname, "views", "partials"));


//////////////////////////////////////////////////////////////////////////////
////////////////// ROUTES ACCUEIL ////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////// 


// Page d'accueil - Jeux mis en avant
app.get("/", async (req, res) => {
    try {
        const games = await prisma.game.findMany({
            where: { highlight: true },
            include: { type: true, editor: true },
            orderBy: { title: 'asc' },
        });
        
        const gamesHTML = games.length > 0
            ? games.map(game => `
                <div class="game-card">
                    <h2><a href="/games/${game.id}">${game.title}</a></h2>
                    <p>${game.description}</p>
                    <div class="game-info">
                        ${game.type ? `<span class="badge">Genre: <a href="/types/${game.type.id}">${game.type.name}</a></span>` : ''}
                        ${game.editor ? `<span class="badge">Éditeur: <a href="/editors/${game.editor.id}">${game.editor.name}</a></span>` : ''}
                    </div>
                </div>
            `).join('')
            : '<p>Aucun jeu mis en avant pour le moment.</p><p><a href="/games/new">Ajouter un jeu</a></p>';
        
        res.render("index", { gamesHTML, hasGames: games.length > 0 });
    } catch (error) {
        console.error("Erreur accueil:", error);
        res.status(500).send("Erreur serveur");
    }
});


//////////////////////////////////////////////////////////////////////////////
//////////////////// ROUTES JEUX /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////// 


// Liste de tous les jeux
app.get("/games", async (req, res) => {
    try {
        const games = await prisma.game.findMany({
            include: { type: true, editor: true },
            orderBy: { title: 'asc' },
        });
        
        const gamesHTML = games.length > 0
            ? games.map(game => `
                <div class="game-item">
                    <h2><a href="/games/${game.id}">${game.title}</a></h2>
                    <p>${game.description}</p>
                    <div class="game-meta">
                        ${game.type ? `<span class="badge">Genre: <a href="/types/${game.type.id}">${game.type.name}</a></span>` : ''}
                        ${game.editor ? `<span class="badge">Éditeur: <a href="/editors/${game.editor.id}">${game.editor.name}</a></span>` : ''}
                        ${game.highlight ? '<span class="badge badge-highlight">⭐ Mis en avant</span>' : ''}
                    </div>
                    <div class="actions">
                        <a href="/games/${game.id}/edit" class="btn btn-secondary">Modifier</a>
                        <form action="/games/${game.id}/delete" method="POST" style="display: inline;">
                            <button type="submit" class="btn btn-danger" onclick="return confirm('Êtes-vous sûr de vouloir supprimer ce jeu ?')">Supprimer</button>
                        </form>
                    </div>
                </div>
            `).join('')
            : '<p>Aucun jeu dans la collection.</p>';
        
        res.render("games/index", { gamesHTML, hasGames: games.length > 0 });
    } catch (error) {
        console.error("Erreur liste jeux:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Formulaire création jeu
app.get("/games/new", async (req, res) => {
    try {
        const types = await prisma.type.findMany({ orderBy: { name: 'asc' } });
        const editors = await prisma.editor.findMany({ orderBy: { name: 'asc' } });
        
        res.render("games/new", { types, editors });
    } catch (error) {
        console.error("Erreur formulaire jeu:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Créer un jeu
app.post("/games", async (req, res) => {
    try {
        const { title, description, released, typeId, editorId, highlight } = req.body;
        
        await prisma.game.create({
            data: {
                title,
                description: description || "",
                released: released ? new Date(released) : new Date(),
                typeId: typeId ? parseInt(typeId) : null,
                editorId: editorId ? parseInt(editorId) : null,
                highlight: highlight === "on",
            },
        });
        
        res.redirect("/games");
    } catch (error) {
        console.error("Erreur création jeu:", error);
        res.status(500).send("Erreur lors de la création");
    }
});

// Détail d'un jeu
app.get("/games/:id", async (req, res) => {
    try {
        const game = await prisma.game.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { type: true, editor: true },
        });
        
        if (!game) return res.status(404).send("Jeu non trouvé");
        res.render("games/details", { game });
    } catch (error) {
        console.error("Erreur détail jeu:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Formulaire modification jeu
app.get("/games/:id/edit", async (req, res) => {
    try {
        const game = await prisma.game.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { type: true, editor: true },
        });
        
        if (!game) return res.status(404).send("Jeu non trouvé");
        
        const types = await prisma.type.findMany({ orderBy: { name: 'asc' } });
        const editors = await prisma.editor.findMany({ orderBy: { name: 'asc' } });
        
        res.render("games/edit", { game, types, editors });
    } catch (error) {
        console.error("Erreur formulaire edit jeu:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Mettre à jour un jeu
app.post("/games/:id/edit", async (req, res) => {
    try {
        const { title, description, released, typeId, editorId, highlight } = req.body;
        
        await prisma.game.update({
            where: { id: parseInt(req.params.id) },
            data: {
                title,
                description: description || "",
                released: released ? new Date(released) : new Date(),
                typeId: typeId ? parseInt(typeId) : null,
                editorId: editorId ? parseInt(editorId) : null,
                highlight: highlight === "on",
            },
        });
        
        res.redirect(`/games/${req.params.id}`);
    } catch (error) {
        console.error("Erreur mise à jour jeu:", error);
        res.status(500).send("Erreur lors de la mise à jour");
    }
});

// Supprimer un jeu
app.post("/games/:id/delete", async (req, res) => {
    try {
        await prisma.game.delete({ where: { id: parseInt(req.params.id) } });
        res.redirect("/games");
    } catch (error) {
        console.error("Erreur suppression jeu:", error);
        res.status(500).send("Erreur lors de la suppression");
    }
});

//////////////////////////////////////////////////////////////////////////////
//////////////////// ROUTES GENRES ///////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////// 


// Liste des genres
app.get("/types", async (req, res) => {
    try {
        const types = await prisma.type.findMany({
            include: { games: true },
            orderBy: { name: 'asc' },
        });

       
        res.render("types/index", { types });
    } catch (error) {
        console.error("Erreur liste genres:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Détail d'un genre
app.get("/types/:id", async (req, res) => {
    try {
        const type = await prisma.type.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { games: { include: { editor: true }, orderBy: { title: 'asc' } } },
        });
        
        if (!type) return res.status(404).send("Genre non trouvé");
        res.render("types/details", { type });
    } catch (error) {
        console.error("Erreur détail genre:", error);
        res.status(500).send("Erreur serveur");
    }
});

//////////////////////////////////////////////////////////////////////////////
//////////////////// ROUTES ÉDITEURS /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////// 

// Liste des éditeurs
app.get("/editors", async (req, res) => {
    try {
        const editors = await prisma.editor.findMany({
            include: { games: true },
            orderBy: { name: 'asc' },
        });
        
        res.render("editors/index", { editors });
    } catch (error) {
        console.error("Erreur liste éditeurs:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Formulaire création éditeur
app.get("/editors/new", (req, res) => {
    res.render("editors/new");
});

// Créer un éditeur
app.post("/editors", async (req, res) => {
    try {
        await prisma.editor.create({ data: { name: req.body.name } });
        res.redirect("/editors");
    } catch (error) {
        console.error("Erreur création éditeur:", error);
        res.status(500).send("Erreur lors de la création");
    }
});

// Détail d'un éditeur
app.get("/editors/:id", async (req, res) => {
    try {
        const editor = await prisma.editor.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { games: { include: { type: true }, orderBy: { title: 'asc' } } },
        });
        
        if (!editor) return res.status(404).send("Éditeur non trouvé");
        res.render("editors/details", { editor });
    } catch (error) {
        console.error("Erreur détail éditeur:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Formulaire modification éditeur
app.get("/editors/:id/edit", async (req, res) => {
    try {
        const editor = await prisma.editor.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        
        if (!editor) return res.status(404).send("Éditeur non trouvé");
        res.render("editors/edit", { editor });
    } catch (error) {
        console.error("Erreur formulaire edit éditeur:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Mettre à jour un éditeur
app.post("/editors/:id/edit", async (req, res) => {
    try {
        await prisma.editor.update({
            where: { id: parseInt(req.params.id) },
            data: { name: req.body.name },
        });
        
        res.redirect(`/editors/${req.params.id}`);
    } catch (error) {
        console.error("Erreur mise à jour éditeur:", error);
        res.status(500).send("Erreur lors de la mise à jour");
    }
});

// Supprimer un éditeur
app.post("/editors/:id/delete", async (req, res) => {
    try {
        await prisma.editor.delete({ where: { id: parseInt(req.params.id) } });
        res.redirect("/editors");
    } catch (error) {
        console.error("Erreur suppression éditeur:", error);
        res.status(500).send("Erreur lors de la suppression");
    }
});

//////////////////////////////////////////////////////////////////////////////
//////////////////// INITIALISATION et DÉMARRAGE du SERVEUR //////////////////
////////////////////////////////////////////////////////////////////////////// 

const { initializeGameTypes } = require('./js/seed');

initializeGameTypes(prisma)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✓ Serveur lancé sur http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Erreur initialisation:", error);
        process.exit(1);
    });