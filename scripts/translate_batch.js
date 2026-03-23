import fs from 'fs';

// Simple dictionary of common English words found to French
const TRANSLATIONS = {
    "Excitement; enthusiasm; zeal": "Excitation; enthousiasme; zèle",
    "Fatwa": "Fatwa",
    "Fez": "Fès",
    "Muezzin": "Muezzin",
    "Mullah, mollah, mulla, moolah": "Mollah",
    "Old man": "Vieil homme",
    "Mixture, medley, blend": "Mélange",
    "Peace": "Paix",
    "Dollar": "Dollar",
    "Border, boundary, limit, march, neighboring territory": "Frontière, limite",
    "Octopus": "Pieuvre",
    "Spider": "Araignée",
    "Ass, donkey": "Âne",
    "Cent": "Centime",
    "Arab": "Arabe",
    "Harem": "Harem",
    "Music": "Musique",
    "Eye (organ)": "Oeil",
    "Translator; interpreter": "Traducteur; interprète",
    "Carpenter": "Charpentier",
    "Computer": "Ordinateur",
    "Philosopher": "Philosophe",
    "Film, movie": "Film",
    "Elephant": "Éléphant",
    "Lord": "Seigneur",
    "Mucus": "Mucus",
    "Hedgehog": "Hérisson",
    "Drinking": "Boire",
    "Beard": "Barbe",
    "Writing system, script, alphabet": "Système d'écriture, alphabet",
    "Dictionary, lexicon": "Dictionnaire, lexique",
    "Truth, reality": "Vérité, réalité",
    "Automobile, car, motorcar": "Automobile, voiture",
    "Dictionary": "Dictionnaire",
    "Fox (Vulpes vulpes)": "Renard",
    "Storeroom, storehouse": "Entrepôt, réserve",
    "Ardent love, loveaholism": "Amour ardent",
    "Narcissism": "Narcissisme",
    "Wiki": "Wiki",
    "Door, gate": "Porte"
};

const filePath = 'src/data/dictionaryData.js';

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    let updatedData = data;
    let count = 0;

    for (const [english, french] of Object.entries(TRANSLATIONS)) {
        // Use a safe regex replacement
        // Escape special regex chars in english string
        const safeKey = english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`"translation": "${safeKey}"`, 'g');

        if (updatedData.match(regex)) {
            updatedData = updatedData.replace(regex, `"translation": "${french}"`);
            count++;
        }
    }

    fs.writeFile(filePath, updatedData, 'utf8', (err) => {
        if (err) console.error(err);
        else console.log(`Successfully translated ${count} definitions.`);
    });
});
