export const getWeightedItem = (pool, stats = [], itemType = 'letter') => {
    // Helper to check mastery
    // For letters: Check if ALL forms are mastered (score 4/4) or calculate generally
    // For now, simpler logic:
    // New: 0 attempts
    // Weak: Attempts > 0 but < threshold (e.g. 80% success)
    // Mastered: > threshold

    if (!pool || pool.length === 0) return null;

    // 1. Categorize items
    const newItems = [];
    const weakItems = [];
    const masteredItems = [];

    pool.forEach(item => {
        let isMastered = false;
        let isNew = true;

        if (itemType === 'letter') {
            // Check stats for this letter
            const letterStats = stats.filter(s => s.letter_id === item.id);
            if (letterStats.length > 0) {
                isNew = false;
                // Calculate aggregated score
                const totalAttempts = letterStats.reduce((sum, s) => sum + s.total_attempts, 0);
                const totalSuccess = letterStats.reduce((sum, s) => sum + s.success_count, 0);
                const rate = totalAttempts > 0 ? (totalSuccess / totalAttempts) : 0;

                // Simple Mastery Definition for selection: > 80% global accuracy on letter
                // (Could be more granular per form, but this is a good start)
                if (totalAttempts >= 5 && rate >= 0.8) {
                    isMastered = true;
                }
            }
        } else if (itemType === 'word') {
            // Word mastery is based on the letters it contains
            // If it contains ANY new letter -> New
            // If it contains ANY weak letter -> Weak
            // If ALL letters are mastered -> Mastered

            // For word stats, we need to know the letters in the word
            // item.letters is array of letter IDs (names)

            // Map word letters to stats
            // For simplicity, let's assume if we haven't practiced a word's letters enough, it's new.

            // TODO: More complex logic for words. 
            // Current simple logic: Random for now unless we have word-specific stats?
            // User request implies using LETTER stats to drive WORD selection.

            const wordLetters = item.letters; // Array of IDs e.g. ['alif', 'ba']

            let hasNew = false;
            let hasWeak = false;

            wordLetters.forEach(lId => {
                const lStats = stats.filter(s => s.letter_id === lId);
                if (lStats.length === 0) {
                    hasNew = true;
                } else {
                    const totalAttempts = lStats.reduce((sum, s) => sum + s.total_attempts, 0);
                    const totalSuccess = lStats.reduce((sum, s) => sum + s.success_count, 0);
                    const rate = totalAttempts > 0 ? (totalSuccess / totalAttempts) : 0;

                    if (totalAttempts < 5 || rate < 0.8) {
                        hasWeak = true;
                    }
                }
            });

            if (hasNew) isNew = true;
            else if (hasWeak) isMastered = false; // Weak
            else isMastered = true; // All mastered
        }

        if (isNew) newItems.push(item);
        else if (isMastered) masteredItems.push(item);
        else weakItems.push(item);
    });

    // 2. Select category based on weights (60% New, 30% Weak, 10% Mastered)
    const rand = Math.random();
    let selectedPool = [];

    // Prioritize pools that actually have items
    const hasNew = newItems.length > 0;
    const hasWeak = weakItems.length > 0;
    const hasMastered = masteredItems.length > 0;

    // Logic: Try to respect weights, but fallback if pool empty
    if (rand < 0.6) {
        if (hasNew) selectedPool = newItems;
        else if (hasWeak) selectedPool = weakItems;
        else selectedPool = masteredItems;
    } else if (rand < 0.9) {
        if (hasWeak) selectedPool = weakItems;
        else if (hasNew) selectedPool = newItems;
        else selectedPool = masteredItems;
    } else {
        if (hasMastered) selectedPool = masteredItems;
        else if (hasWeak) selectedPool = weakItems;
        else selectedPool = newItems;
    }

    // Safety fallback
    if (selectedPool.length === 0) selectedPool = pool;

    // 3. Pick random item from selected pool
    return selectedPool[Math.floor(Math.random() * selectedPool.length)];
};
