import fs from 'fs';
import readline from 'readline';

async function processLineByLine() {
    const fileStream = fs.createReadStream('/Users/flavienmedina/Downloads/kaikki.org-dictionary-Arabic-words.jsonl');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let count = 0;
    const results = [];

    for await (const line of rl) {
        if (count >= 20) break;
        try {
            const entry = JSON.parse(line);

            // Filter for Nouns/Verbs only to get relevant content
            if (!['noun', 'verb', 'adjective'].includes(entry.pos)) continue;

            const word = entry.word;
            // Vocalized form is often in forms[0].form, but let's check carefully
            let vocalized = word;
            if (entry.forms && entry.forms.length > 0) {
                // Look for canonical form or vocalized looking one
                const canonical = entry.forms.find(f => f.tags && f.tags.includes('canonical'));
                if (canonical) {
                    vocalized = canonical.form;
                } else {
                    vocalized = entry.forms[0].form;
                }
            }


            // Get first definition
            let definition = "N/A";
            if (entry.senses && entry.senses.length > 0) {
                if (entry.senses[0].glosses) {
                    definition = entry.senses[0].glosses[0];
                } else if (entry.senses[0].english) {
                    definition = entry.senses[0].english;
                }
            }

            results.push({
                type: entry.pos,
                text: word,
                vocalized: vocalized,
                english_def: definition
            });

            count++;
        } catch (e) {
            console.error("Error parsing line", e);
        }
    }

    console.log(JSON.stringify(results, null, 2));
}

processLineByLine();
