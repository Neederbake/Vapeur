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
        const games = await prisma.jeux.findMany({
            where: { featured: true }, // ceux qui sont en avant
            include: { editeur: true },
            orderBy: { titre: 'asc' },
        });
        
        res.render("index", { games, hasGames: games.length > 0 });
    } catch (error) {
        console.error("Erreur accueil:", error);
        res.status(500).send("Erreur serveur");
    }
});


//////////////////////////////////////////////////////////////////////////////
//////////////////// ROUTES JEUX /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////// 

/* Petit récap rapide, ça fait toujours plaisir :
   - La liste des jeux          ( get /games)
   - La création d'un jeu       ( get /games/new)
   - La création d'un jeu       ( post /games)
   - Le détail d'un jeu         ( get /games/:id)
   - La modification d'un jeu   ( get /games/:id/edit)
   - La modification d'un jeu   ( post /games/:id/edit)
   - La suppression d'un jeu    ( post /games/:id/delete)
*/

// Liste de tous les jeux
app.get("/games", async (req, res) => {
    try {
        const games = await prisma.jeux.findMany({
            include: { editeur: true },
            orderBy: { titre: 'asc' },
        });
        
        res.render("jeux/index", { games, hasGames: games.length > 0 });
    } catch (error) {
        console.error("Erreur liste jeux:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Formulaire création jeu
app.get("/games/new", async (req, res) => {
    try {
        const types = await prisma.genres.findMany({ orderBy: { nom: 'asc' } });
        const editors = await prisma.editeurs.findMany({ orderBy: { nom: 'asc' } });
        
        res.render("jeux/new", { types, editors });
    } catch (error) {
        console.error("Erreur formulaire jeu:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Créer un jeu
app.post("/games", async (req, res) => {
    try {
        const { titre, description, genre, editeurId, featured } = req.body;
        
        await prisma.jeux.create({
            data: {
                titre,
                description: description || "",
                genre: genre || "",
                editeurId: editeurId ? parseInt(editeurId) : null,
                featured: featured === "on",
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
        const game = await prisma.jeux.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { editeur: true },
        });
        
        if (!game) return res.status(404).send("Jeu non trouvé");
        res.render("jeux/details", { game });
    } catch (error) {
        console.error("Erreur détail jeu:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Formulaire modification jeu
app.get("/games/:id/edit", async (req, res) => {
    try {
        const game = await prisma.jeux.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { editeur: true },
        });
        
        if (!game) return res.status(404).send("Jeu non trouvé");
        
        const types = await prisma.genres.findMany({ orderBy: { nom: 'asc' } });
        const editors = await prisma.editeurs.findMany({ orderBy: { nom: 'asc' } });
        
        res.render("jeux/edit", { game, types, editors });
    } catch (error) {
        console.error("Erreur formulaire edit jeu:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Mettre à jour un jeu
app.post("/games/:id/edit", async (req, res) => {
    try {
        const { titre, description, genre, editeurId, featured } = req.body;

        await prisma.jeux.update({
            where: { id: parseInt(req.params.id) },
            data: {
                titre,
                description: description || "",
                genre: genre || "",
                editeurId: editeurId ? parseInt(editeurId) : null,
                featured: featured === "on",
            },
        });
        res.redirect(`/games/${req.params.id}`);
    } 
    catch (error) {
        console.error("Erreur mise à jour jeu : ", error);
        res.status(500).send("Erreur lors de la mise à jour");
    }
});

// Validé
// Post pour supprimer un jeu 
app.post("/games/:id/delete", async (req, res) => {
    try {
        await prisma.jeux.delete({ where: { id: parseInt(req.params.id) } });
        res.redirect("/games");
    } 
    catch (error) {
        console.error("Erreur suppression de jeu : ", error);
        res.status(500).send("Erreur lors de la suppression");
    }
});

//////////////////////////////////////////////////////////////////////////////
//////////////////// ROUTES GENRES ///////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////// 

/* Petit récap rapide, ça fait toujours plaisir :
   - La liste des genres    ( get /types)
   - La détail d'un genre   ( get /types/:id")
*/

// Liste des genres
app.get("/types", async (req, res) => {
    try {
        const types = await prisma.genres.findMany({
            include: { jeux: true },
            orderBy: { nom: 'asc' },
        });

       
        res.render("genres/index", { types });
    } catch (error) {
        console.error("Erreur liste genres:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Détail d'un genre
app.get("/types/:id", async (req, res) => {
    try {
        const type = await prisma.genres.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { jeux: { orderBy: { nom: 'asc' } } },
        });
        
        if (!type) return res.status(404).send("Genre non trouvé");
        res.render("genres/details", { type });
    } catch (error) {
        console.error("Erreur détail genre:", error);
        res.status(500).send("Erreur serveur");
    }
});

//////////////////////////////////////////////////////////////////////////////
//////////////////// ROUTES ÉDITEURS /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////// 

/* Petit récap rapide, ça fait toujours plaisir :
   - La liste des éditeurs          ( get /editors")
   - La détail d'un genre           ( get /editors/new)
   - La création d'un éditeur       ( post /editors)
   - La détail d'un éditeur         ( get /editors/:id")
   - La modification d'un éditeur   ( get /editors/:id/edit)
   - La modification d'un éditeur   ( post /editors/:id/edit)
   - La suppression d'un éditeur    ( post /editors/:id/delete
*/

// Liste des éditeurs
app.get("/editors", async (req, res) => {
    try {
        const editors = await prisma.editeurs.findMany({
            include: { jeux_publies: true },
            orderBy: { nom: 'asc' },
        });
        
        res.render("editeurs/index", { editors });
    } catch (error) {
        console.error("Erreur liste éditeurs:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Formulaire création éditeur
app.get("/editors/new", (req, res) => {
    res.render("editeurs/new");
});

// Créer un éditeur
app.post("/editors", async (req, res) => {
    try {
        await prisma.editeurs.create({ data: { nom: req.body.nom } });
        res.redirect("/editors");
    } catch (error) {
        console.error("Erreur création éditeur:", error);
        res.status(500).send("Erreur lors de la création");
    }
});

// Détail d'un éditeur
app.get("/editors/:id", async (req, res) => {
    try {
        const editor = await prisma.editeurs.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { jeux_publies: { orderBy: { nom: 'asc' } } },
        });
        
        if (!editor) return res.status(404).send("Éditeur non trouvé");
        res.render("editeurs/details", { editor });
    } catch (error) {
        console.error("Erreur détail éditeur:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Formulaire modification éditeur
app.get("/editors/:id/edit", async (req, res) => {
    try {
        const editor = await prisma.editeurs.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        
        if (!editor) return res.status(404).send("Éditeur non trouvé");
        res.render("editeurs/edit", { editor });
    } catch (error) {
        console.error("Erreur formulaire edit éditeur:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Mettre à jour un éditeur
app.post("/editors/:id/edit", async (req, res) => {
    try {
        await prisma.editeurs.update({
            where: { id: parseInt(req.params.id) },
            data: { nom: req.body.nom },
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
        await prisma.editeurs.delete({ where: { id: parseInt(req.params.id) } });
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