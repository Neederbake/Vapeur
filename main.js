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

hbs.registerHelper('formatDate', function(date) {
    if (!date) return '';
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();

    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
});

hbs.registerHelper('displayDate', function(date) {
    if (!date) return 'Non spécifiée';
    return new Date(date).toLocaleDateString('fr-FR');
});

//////////////////////////////////////////////////////////////////////////////
////////////////// ROUTES ACCUEIL ////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////// 

// Page d'accueil - Jeux mis en avant
app.get("/", async (req, res) => {
    try {
        const games = await prisma.jeux.findMany({
            where: { featured: true },
            include: { 
                editeur: true,
                genres: true
            },
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
   - La liste des jeux          ( get /jeux)
   - La création d'un jeu       ( get /jeux/new)
   - La création d'un jeu       ( post /jeux)
   - Le détail d'un jeu         ( get /jeux/:id)
   - La modification d'un jeu   ( get /jeux/:id/edit)
   - La modification d'un jeu   ( post /jeux/:id/edit)
   - La suppression d'un jeu    ( post /jeux/:id/delete)
*/

// Liste de tous les jeux
app.get("/jeux", async (req, res) => {
    try {
        const games = await prisma.jeux.findMany({
            include: { 
                editeur: true,
                genres: true
            },
            orderBy: { titre: 'asc' },
        });
        
        res.render("jeux/index", { games, hasGames: games.length > 0 });
    } catch (error) {
        console.error("Erreur liste jeux:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Formulaire création jeu
app.get("/jeux/new", async (req, res) => {
    try {
        const genres = await prisma.genres.findMany({ orderBy: { nom: 'asc' } });
        const editeurs = await prisma.editeurs.findMany({ orderBy: { nom: 'asc' } });
        
        res.render("jeux/new", { genres, editeurs });
    } catch (error) {
        console.error("Erreur formulaire jeu:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Créer un jeu
app.post("/jeux", async (req, res) => {
    try {
        const { titre, description, genreId, editeurId, featured, dateSortie } = req.body;

        // Validation des longueurs
        if (!titre || titre.trim().length === 0) {
            return res.status(400).send("Le titre est requis");
        }
        if (titre.length > 200) {
            return res.status(400).send("Le titre ne peut pas dépasser 200 caractères");
        }
        if (description && description.length > 400) {
            return res.status(400).send("La description ne peut pas dépasser 2000 caractères");
        }

        await prisma.jeux.create({
            data: {
                titre: titre.trim(),
                description: description ? description.trim() : "",
                genreId: genreId ? parseInt(genreId) : null, // Utilisation de genreId
                editeurId: editeurId ? parseInt(editeurId) : null,
                featured: featured === "on",
                dateSortie: dateSortie ? new Date(dateSortie) : null,
            },
        });
        
        res.redirect("/jeux");
    } catch (error) {
        console.error("Erreur création jeu:", error);
        res.status(500).send("Erreur lors de la création");
    }
});

// Mettre un jeu en avant
app.get("/jeux/:id/feature", async (req, res) => {
    try {
        await prisma.jeux.update({
            where: { id: parseInt(req.params.id) },
            data: { featured: true },
        });
        res.redirect("/jeux");
    } catch (error) {
        console.error("Erreur mise en avant jeu:", error);
        res.status(500).send("Erreur lors de la mise en avant");
    }
});

// Retirer un jeu de la mise en avant
app.get("/jeux/:id/unfeature", async (req, res) => {
    try {
        await prisma.jeux.update({
            where: { id: parseInt(req.params.id) },
            data: { featured: false },
        });
        res.redirect("/jeux");
    } catch (error) {
        console.error("Erreur retrait mise en avant jeu:", error);
        res.status(500).send("Erreur lors du retrait de la mise en avant");
    }
});

// Détail d'un jeu
app.get("/jeux/:id", async (req, res) => {
    try {
        const game = await prisma.jeux.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { 
                editeur: true,
                genres: true
            },
        });
        
        if (!game) return res.status(404).send("Jeu non trouvé");
        res.render("jeux/details", { game });
    } catch (error) {
        console.error("Erreur détail jeu:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Formulaire modification jeu
app.get("/jeux/:id/edit", async (req, res) => {
    try {
        const game = await prisma.jeux.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { 
                editeur: true,
                genres: true
            },
        });
        
        if (!game) return res.status(404).send("Jeu non trouvé");
        
        const genres = await prisma.genres.findMany({ orderBy: { nom: 'asc' } });
        const editeurs = await prisma.editeurs.findMany({ orderBy: { nom: 'asc' } });
        
        res.render("jeux/edit", { game, genres, editeurs });
    } catch (error) {
        console.error("Erreur formulaire edit jeu:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Mettre à jour un jeu
app.post("/jeux/:id/edit", async (req, res) => {
    try {
        const { titre, description, genreId, editeurId, featured, dateSortie } = req.body;

        // Validation des longueurs
        if (!titre || titre.trim().length === 0) {
            return res.status(400).send("Le titre est requis");
        }
        if (titre.length > 200) {
            return res.status(400).send("Le titre ne peut pas dépasser 200 caractères");
        }
        if (description && description.length > 400) {
            return res.status(400).send("La description ne peut pas dépasser 2000 caractères");
        }

        await prisma.jeux.update({
            where: { id: parseInt(req.params.id) },
            data: {
                titre: titre.trim(),
                description: description ? description.trim() : "",
                genreId: genreId ? parseInt(genreId) : null,
                editeurId: editeurId ? parseInt(editeurId) : null,
                featured: featured === "on",
                dateSortie: dateSortie ? new Date(dateSortie) : null,
            },
        });
        res.redirect(`/jeux/${req.params.id}`);
    } 
    catch (error) {
        console.error("Erreur mise à jour jeu:", error);
        res.status(500).send("Erreur lors de la mise à jour");
    }
});

// Supprimer un jeu
app.post("/jeux/:id/delete", async (req, res) => {
    try {
        await prisma.jeux.delete({ where: { id: parseInt(req.params.id) } });
        res.redirect("/jeux");
    } 
    catch (error) {
        console.error("Erreur suppression jeu:", error);
        res.status(500).send("Erreur lors de la suppression");
    }
});

//////////////////////////////////////////////////////////////////////////////
//////////////////// ROUTES GENRES ///////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////// 

/* Petit récap rapide, ça fait toujours plaisir :
   - La liste des genres    ( get /genres)
   - La détail d'un genre   ( get /genres/:id")
*/

// Liste des genres
app.get("/genres", async (req, res) => {
    try {
        const genres = await prisma.genres.findMany({
            include: { jeux_publies: true },
            orderBy: { nom: 'asc' },
        });
       
        res.render("genres/index", { genres });
    } catch (error) {
        console.error("Erreur liste genres:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Détail d'un genre
app.get("/genres/:id", async (req, res) => {
    try {
        const genre = await prisma.genres.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { 
                jeux_publies: { 
                    include: { editeur: true },
                    orderBy: { titre: 'asc' } 
                } 
            },
        });
        
        if (!genre) return res.status(404).send("Genre non trouvé");
        res.render("genres/details", { genre });
    } catch (error) {
        console.error("Erreur détail genre:", error);
        res.status(500).send("Erreur serveur");
    }
});

//////////////////////////////////////////////////////////////////////////////
//////////////////// ROUTES ÉDITEURS /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////// 

/* Petit récap rapide, ça fait toujours plaisir :
   - La liste des éditeurs          ( get /editeurs")
   - La détail d'un genre           ( get /editeurs/new)
   - La création d'un éditeur       ( post /editeurs)
   - La détail d'un éditeur         ( get /editeurs/:id")
   - La modification d'un éditeur   ( get /editeurs/:id/edit)
   - La modification d'un éditeur   ( post /editeurs/:id/edit)
   - La suppression d'un éditeur    ( post /editeurs/:id/delete
*/

// Liste des éditeurs
app.get("/editeurs", async (req, res) => {
    try {
        const editeurs = await prisma.editeurs.findMany({
            include: { jeux_publies: true },
            orderBy: { nom: 'asc' },
        });
        
        res.render("editeurs/index", { editeurs });
    } catch (error) {
        console.error("Erreur liste éditeurs:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Formulaire création éditeur
app.get("/editeurs/new", (req, res) => {
    res.render("editeurs/new");
});

// Créer un éditeur
app.post("/editeurs", async (req, res) => {
    try {
        const { nom } = req.body;
        
        // Validation des longueurs
        if (!nom || nom.trim().length === 0) {
            return res.status(400).send("Le nom est requis");
        }
        if (nom.length > 150) {
            return res.status(400).send("Le nom ne peut pas dépasser 150 caractères");
        }
        
        await prisma.editeurs.create({ data: { nom: nom.trim() } });
        res.redirect("/editeurs");
    } catch (error) {
        console.error("Erreur création éditeur:", error);
        res.status(500).send("Erreur lors de la création");
    }
});

// Détail d'un éditeur
app.get("/editeurs/:id", async (req, res) => {
    try {
        const editeur = await prisma.editeurs.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { 
                jeux_publies: { 
                    include: { genres: true },
                    orderBy: { titre: 'asc' }
                } 
            },
        });
        
        if (!editeur) return res.status(404).send("Éditeur non trouvé");
        res.render("editeurs/details", { editeur });
    } catch (error) {
        console.error("Erreur détail éditeur:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Formulaire modification éditeur
app.get("/editeurs/:id/edit", async (req, res) => {
    try {
        const editeur = await prisma.editeurs.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        
        if (!editeur) return res.status(404).send("Éditeur non trouvé");
        res.render("editeurs/edit", { editeur });
    } catch (error) {
        console.error("Erreur formulaire edit éditeur:", error);
        res.status(500).send("Erreur serveur");
    }
});

// Mettre à jour un éditeur
app.post("/editeurs/:id/edit", async (req, res) => {
    try {
        const { nom } = req.body;
        
        // Validation des longueurs
        if (!nom || nom.trim().length === 0) {
            return res.status(400).send("Le nom est requis");
        }
        if (nom.length > 150) {
            return res.status(400).send("Le nom ne peut pas dépasser 150 caractères");
        }
        
        await prisma.editeurs.update({
            where: { id: parseInt(req.params.id) },
            data: { nom: nom.trim() },
        });
        
        res.redirect(`/editeurs/${req.params.id}`);
    } catch (error) {
        console.error("Erreur mise à jour éditeur:", error);
        res.status(500).send("Erreur lors de la mise à jour");
    }
});

// Supprimer un éditeur
app.post("/editeurs/:id/delete", async (req, res) => {
    try {
        await prisma.editeurs.delete({ where: { id: parseInt(req.params.id) } });
        res.redirect("/editeurs");
    } catch (error) {
        console.error("Erreur suppression éditeur:", error);
        res.status(500).send("Erreur lors de la suppression");
    }
});

//////////////////////////////////////////////////////////////////////////////
//////////////////// GESTION DES ERREURS /////////////////////////////////////
////////////////////////////////////////////////////////////////////////////// 

// Middleware 404
app.use((req, res) => {
    res.status(404).render("errors/404", {
        url: req.originalUrl
    });
});

//////////////////////////////////////////////////////////////////////////////
//////////////////// INITIALISATION ET DÉMARRAGE DU SERVEUR //////////////////
////////////////////////////////////////////////////////////////////////////// 

const { initializeGameGenres } = require('./js/seed');

initializeGameGenres(prisma)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✓ Serveur lancé sur http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Erreur initialisation:", error);
        process.exit(1);
    });