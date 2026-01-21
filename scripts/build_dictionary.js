import fs from 'fs';
import readline from 'readline';

// Mapping from Arabic Char to ID (based on alphabet.js)
// Note: Some chars like Hamza require special handling or mapping to nearest equivelant for now if not in ALPHABET
// But for purpose of the app (Letter recognition), we need to be strict or use mapping.
const CHAR_MAP = {
    'ا': 'alif',
    'أ': 'alif', // Hamza on Alif -> Alif
    'إ': 'alif', // Hamza below Alif -> Alif
    'آ': 'alif', // Alif Madda -> Alif
    'ب': 'ba',
    'ت': 'ta',
    'ث': 'tha',
    'ج': 'jim',
    'ح': 'ha',
    'خ': 'kha',
    'د': 'dal',
    'ذ': 'dhal',
    'ر': 'ra',
    'ز': 'zay',
    'س': 'sin',
    'ش': 'shin',
    'ص': 'sad',
    'ض': 'dad',
    'ط': 'ta_emph',
    'ظ': 'za_emph',
    'ع': 'ayn',
    'غ': 'ghayn',
    'ف': 'fa',
    'ق': 'qaf',
    'ك': 'kaf',
    'ل': 'lam',
    'م': 'mim',
    'ن': 'nun',
    'ه': 'ha_h',
    'و': 'waw',
    'ي': 'ya',
    'ى': 'ya', // Alif Maqsura -> Ya
    'ة': 'ta', // Ta Marbuta -> Ta (simplification for app logic usually, or maybe ha_h. choosing ta as it is often pronounced t in construct)
    'ئ': 'ya', // Hamza on Ya -> Ya
    'ؤ': 'waw', // Hamza on Waw -> Waw
    'ء': 'alif' //  Isolated Hamza -> Alif (Approximation for game tile)
};

// Vowels / Diacritics to ignore for Letter ID mapping
const DIACRITICS = /[\u064B-\u065F\u0670]/g;

function getLetterIds(text) {
    const cleanBox = text.replace(DIACRITICS, ''); // Remove vowels
    const letters = [];
    for (let char of cleanBox) {
        if (CHAR_MAP[char]) {
            letters.push(CHAR_MAP[char]);
        }
    }
    return letters;
}

async function buildDictionary() {
    const fileStream = fs.createReadStream('/Users/flavienmedina/Downloads/kaikki.org-dictionary-Arabic-words.jsonl');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let count = 0;
    const targetCount = 2000;
    const results = [];
    const seenWords = new Set();

    for await (const line of rl) {
        if (count >= targetCount) break;

        try {
            const entry = JSON.parse(line);

            // Strict Filters to ensure high quality for a learner app
            if (!['noun', 'verb'].includes(entry.pos)) continue; // Only nouns and verbs

            // Skip multi-word expressions (spaces)
            if (entry.word.includes(' ')) continue;

            const word = entry.word;

            // Skip if already added
            if (seenWords.has(word)) continue;

            // Extract vocalization
            let vocalized = word;
            if (entry.forms && entry.forms.length > 0) {
                const canonical = entry.forms.find(f => f.tags && f.tags.includes('canonical'));
                if (canonical) {
                    vocalized = canonical.form;
                } else if (entry.forms[0].form) {
                    vocalized = entry.forms[0].form;
                }
            }

            // Skip if vocalized text is same as raw text (means no vocalization data usually)
            // Actually some words have no vowels, but usually they should have.
            // Let's rely on English definition existence too.

            let englishDef = null;
            if (entry.senses && entry.senses.length > 0) {
                // Get first valid gloss
                for (const sense of entry.senses) {
                    if (sense.glosses) {
                        englishDef = sense.glosses[0];
                        break;
                    } else if (sense.english) {
                        englishDef = sense.english;
                        break;
                    }
                }
            }

            if (!englishDef) continue; // Skip if no definition

            // Generate Letter IDs
            const letters = getLetterIds(word);
            if (letters.length < 2) continue; // Skip single letter words or failed mapping
            if (letters.length > 6) continue; // Skip very long words (UI constrain)

            results.push({
                text: word,
                translation: englishDef, // Placeholder
                vocalizedText: vocalized,
                letters: letters,
                source: 'kaikki_import'
            });

            seenWords.add(word);
            count++;

            if (count % 100 === 0) console.log(`Processed ${count} words...`);

        } catch (e) {
            console.error("Error parsing line", e);
        }
    }

    const outputContent = `export const DICTIONARY_DATA = ${JSON.stringify(results, null, 4)};`;
    fs.writeFileSync('/Users/flavienmedina/dev/fun.projects/medina/src/data/dictionaryData.js', outputContent);
    console.log(`Successfully created dictionaryData.js with ${results.length} words.`);
}

buildDictionary();
