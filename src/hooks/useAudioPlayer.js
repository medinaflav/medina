import { useState, useEffect, useCallback } from 'react';

export default function useAudioPlayer(textToSpeak) {
    const [isPlaying, setIsPlaying] = useState(false);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const play = useCallback(() => {
        if (!textToSpeak || !('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        setIsPlaying(true);

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'ar-SA';

        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        window.speechSynthesis.speak(utterance);
    }, [textToSpeak]);

    return { isPlaying, play };
}
