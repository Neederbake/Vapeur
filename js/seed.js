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
    for (const Genres of types) {
        await prisma.genres.upsert({
            where: { nom: Genres },
            update: {},
            create: { nom: Genres },
        });
    }
    console.log("Genres de jeux initialisés");
}

// Exporter les genres et la fonction d'initialisation
module.exports = {
    types,
    initializeGameTypes
};