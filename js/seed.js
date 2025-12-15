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
    for (const genre of types) {
        await prisma.type.upsert({
            where: { name: genre },
            update: {},
            create: { name: genre },
        });
    }
    console.log("✓ Genres de jeux initialisés");
}

// Exporter les genres et la fonction d'initialisation
module.exports = {
    types,
    initializeGameTypes
};