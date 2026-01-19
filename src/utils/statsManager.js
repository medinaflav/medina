// Queue for progress updates to prevent network spam
let moveQueue = [];
let flushTimer = null;

export const recordAttempt = (letterId, form, isCorrect) => {
    const token = localStorage.getItem('token');
    if (!token) return; // Cannot sync if not logged in

    // console.log('Recording attempt:', letterId, form, isCorrect ? 'SUCCESS' : 'FAIL');

    moveQueue.push({
        letterId,
        form: form || 'isolated', // default to isolated if undefined
        successDelta: isCorrect ? 1 : 0,
        attemptsDelta: 1
    });

    // Debounce the flush
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(() => {
        const toSync = [...moveQueue];
        moveQueue = [];
        syncProgress(toSync, token);
    }, 2000); // 2 second delay to batch rapid changes
};

const syncProgress = async (updates, token) => {
    if (updates.length === 0) return;

    try {
        await fetch('/api/progress/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ updates })
        });
        // console.log('Synced', updates.length, 'updates');
    } catch (err) {
        console.error('Failed to sync progress:', err);
        // Retry logic could go here (push back to queue?)
        // For now, simplicity.
    }
};

export const getWeakestLetters = async (limit = 5) => {
    // This function would ideally fetch aggregated stats from backend 
    // or calculate from a local cache of stats.
    // For now, returning empty or fetching from an endpoint if needed.
    return [];
};
