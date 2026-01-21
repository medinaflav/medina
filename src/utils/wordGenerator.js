import { getWeightedItem } from './adaptiveLearning';
import { ALPHABET, getLetter } from '../data/alphabet';
import { WORDS_DATA } from '../data/wordsData';

// Short vowels: Fatha, Kasra, Damma
const VOWELS = ['\u064E', '\u0650', '\u064F'];

const generatePseudoWord = (selectedLetters, stats) => {
    // 1. Determine pool of letters to pick from
    let poolIds = selectedLetters;
    if (!poolIds || poolIds.length === 0) {
        poolIds = ALPHABET.map(l => l.id);
    }

    // Convert to letter objects
    const pool = poolIds.map(id => getLetter(id)).filter(Boolean);

    // 2. Select 3 letters (Root structure) using adaptive weights
    const root = [];
    for (let i = 0; i < 3; i++) {
        // Use getWeightedItem to pick a letter based on stats (New/Weak/Mastered)
        const letter = getWeightedItem(pool, stats, 'letter');
        // Fallback to random if adaptive fails
        root.push(letter || pool[Math.floor(Math.random() * pool.length)]);
    }

    // 3. Construct Word
    // Arabic connects automatically, we just need to place vowels.
    // Structure: L1 + V + L2 + V + L3 + V (or sukoon)
    // Simple: Random vowel after first two chars, maybe Fatha on last.

    let vocalizedText = '';
    let text = '';

    root.forEach((letter, index) => {
        text += letter.char;
        vocalizedText += letter.char;

        // Add random vowel for first two letters
        if (index < 2) {
            vocalizedText += VOWELS[Math.floor(Math.random() * VOWELS.length)];
        } else {
            // Last letter: usually Fatha (past tense default) or nothing
            vocalizedText += '\u064E';
        }
    });

    return {
        text: text, // Raw text (unvocalized)
        translation: 'Mot généré',
        vocalizedText: vocalizedText,
        letters: root.map(l => l.id),
        isPseudo: true
    };
};

export const generateSessionWords = (count = 10, selectedLetters = [], stats = []) => {
    // 1. Filter Real Words from WORDS_DATA
    let realWordsPool = [];
    if (!selectedLetters || selectedLetters.length === 0) {
        realWordsPool = [...WORDS_DATA];
    } else {
        // Strict match: Words containing *only* selected letters (or subset of them)
        realWordsPool = WORDS_DATA.filter(word =>
            word.letters.every(l => selectedLetters.includes(l))
        );
    }

    const sessionWords = [];
    const uniqueSet = new Set();

    // 2. Try to fill with Real Words (Adaptive)
    if (realWordsPool.length > 0) {
        let attempts = 0;
        // Try to get as many real words as possible up to 'count'
        // If the pool is small (e.g. 5 words), we take them all.
        // If large, we pick adaptively.

        while (sessionWords.length < count && attempts < count * 2) {
            const word = getWeightedItem(realWordsPool, stats, 'word');
            if (word && !uniqueSet.has(word.text)) {
                uniqueSet.add(word.text);
                sessionWords.push(word);
            }
            attempts++;
        }

        // If adaptive skipping left some out but we have room and pool has more, fill them validly
        if (sessionWords.length < count && sessionWords.length < realWordsPool.length) {
            const remaining = realWordsPool.filter(w => !uniqueSet.has(w.text));
            const needed = count - sessionWords.length;
            const extra = remaining.sort(() => 0.5 - Math.random()).slice(0, needed);
            extra.forEach(w => {
                uniqueSet.add(w.text);
                sessionWords.push(w);
            });
        }
    }

    // 3. Fill the rest with Pseudo Words (if real words didn't fill the session)
    let safetyCounter = 0;
    while (sessionWords.length < count && safetyCounter < 100) {
        const pWord = generatePseudoWord(selectedLetters, stats);

        if (!uniqueSet.has(pWord.text)) {
            uniqueSet.add(pWord.text);
            sessionWords.push(pWord);
        }
        safetyCounter++;
    }

    // Fallback: If strict uniqueness fails (very rare now with pseudo gen), allow duplicates
    if (sessionWords.length < count && sessionWords.length > 0) {
        let i = 0;
        while (sessionWords.length < count) {
            sessionWords.push(sessionWords[i % sessionWords.length]);
            i++;
        }
    }

    return sessionWords.sort(() => 0.5 - Math.random());
};
