const types = [
    "FPS",
    "RPG",
    "Roguelike",
    "Tactique",
    "Survie",
    "MMO",
    "Action-Aventure",
    "Aventure",
    "Simulation",
    "Sport",
    "MMORPG",
    "Action",
    "Horreur",
    "Sandbox",
    "Stratégie",
    "Puzzle",
    "Course",
    "Musical",
    "Indépendant",
    "VR",
    "Éducatif"
];

// Fonction pour initialiser les genres au démarrage
async function initializeGameTypes(prisma) {
    for (const genreName of types) {
        // Vérifier si le genre existe déjà
        const existingGenre = await prisma.genres.findFirst({
            where: { nom: genreName }
        });
        
        // Si n'existe pas, le créer
        if (!existingGenre) {
            await prisma.genres.create({
                data: { nom: genreName }
            });
        }
    }
    console.log("Genres de jeux initialisés");
}

// Exporter les genres et la fonction d'initialisation
module.exports = {
    types,
    initializeGameTypes
};