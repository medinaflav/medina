
const WORDS = [
    { text: 'كتب', translation: 'He wrote', vocalizedText: 'كَتَبَ', letters: ['kaf', 'ta', 'ba'] },
    { text: 'درس', translation: 'He studied', vocalizedText: 'دَرَسَ', letters: ['dal', 'ra', 'sin'] },
    { text: 'أكل', translation: 'He ate', vocalizedText: 'أَكَلَ', letters: ['alif', 'kaf', 'lam'] },
    { text: 'شرب', translation: 'He drank', vocalizedText: 'شَرِبَ', letters: ['shin', 'ra', 'ba'] },
    { text: 'ذهب', translation: 'He went', vocalizedText: 'ذَهَبَ', letters: ['dhal', 'ha', 'ba'] },
    { text: 'خرج', translation: 'He exited', vocalizedText: 'خَرَجَ', letters: ['kha', 'ra', 'jim'] },
    { text: 'دخل', translation: 'He entered', vocalizedText: 'دَخَلَ', letters: ['dal', 'kha', 'lam'] },
    { text: 'جلس', translation: 'He sat', vocalizedText: 'جَلَسَ', letters: ['jim', 'lam', 'sin'] },
    { text: 'سمع', translation: 'He heard', vocalizedText: 'سَمِعَ', letters: ['sin', 'mim', 'ayn'] },
    { text: 'نظر', translation: 'He looked', vocalizedText: 'نَظَرَ', letters: ['nun', 'za_emph', 'ra'] },
    { text: 'أخذ', translation: 'He took', vocalizedText: 'أَخَذَ', letters: ['alif', 'kha', 'dhal'] },
    { text: 'سأل', translation: 'He asked', vocalizedText: 'سَأَلَ', letters: ['sin', 'alif', 'lam'] },
    { text: 'عبد', translation: 'He worshipped', vocalizedText: 'عَبَدَ', letters: ['ayn', 'ba', 'dal'] },
    { text: 'خلق', translation: 'He created', vocalizedText: 'خَلَقَ', letters: ['kha', 'lam', 'qaf'] },
    { text: 'رزق', translation: 'He provided', vocalizedText: 'رَزَقَ', letters: ['ra', 'zay', 'qaf'] },
    { text: 'شكر', translation: 'He thanked', vocalizedText: 'شَكَرَ', letters: ['shin', 'kaf', 'ra'] },
    { text: 'صبر', translation: 'He was patient', vocalizedText: 'صَبَرَ', letters: ['sad', 'ba', 'ra'] },
    { text: 'غفر', translation: 'He forgave', vocalizedText: 'غَفَرَ', letters: ['ghayn', 'fa', 'ra'] },
    { text: 'ذكر', translation: 'He remembered', vocalizedText: 'ذَكَرَ', letters: ['dhal', 'kaf', 'ra'] },
    { text: 'سجد', translation: 'He prostrated', vocalizedText: 'سَجَدَ', letters: ['sin', 'jim', 'dal'] },
    { text: 'ركع', translation: 'He bowed', vocalizedText: 'رَكَعَ', letters: ['ra', 'kaf', 'ayn'] },
    { text: 'قرأ', translation: 'He read', vocalizedText: 'قَرَأَ', letters: ['qaf', 'ra', 'alif'] }
];

export const generateSessionWords = (count = 10, selectedLetters = []) => {
    // If no restricted letters, return random mix
    if (!selectedLetters || selectedLetters.length === 0) {
        return WORDS.sort(() => 0.5 - Math.random()).slice(0, count);
    }

    // Filter words that contain ONLY the selected letters
    // Actually, user usually wants words that contain AT LEAST ONE selected letter?
    // Or ONLY? Usually "Unlock words" means words utilizing known letters.
    // Let's go with: Words where ALL letters are in selectedLetters.

    // Strict mode: All letters in word must be known
    const availableWords = WORDS.filter(word =>
        word.letters.every(l => selectedLetters.includes(l))
    );

    // If pool is too small, maybe allow words with mainly known letters?
    // For now strict.

    if (availableWords.length === 0) {
        // Fallback: words containing at least one known letter
        const fallbackWords = WORDS.filter(word =>
            word.letters.some(l => selectedLetters.includes(l))
        );
        return fallbackWords.sort(() => 0.5 - Math.random()).slice(0, count);
    }

    return availableWords.sort(() => 0.5 - Math.random()).slice(0, count);
};
