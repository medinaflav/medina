import React, { useState, useEffect, useMemo, useCallback } from 'react';
import WordPuzzle from './WordPuzzle';

export default function GameArea({ words }) {
    // Session State
    const [sessionWords, setSessionWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sessionActive, setSessionActive] = useState(false);
    const [puzzleState, setPuzzleState] = useState({ isFilled: false, isCorrect: false });
    const [hasValidated, setHasValidated] = useState(false);
    const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
    const [showVowels, setShowVowels] = useState(true);

    const SESSION_LENGTH = 10;

    // Simplified currentWord logic
    const currentWord = sessionWords[currentIndex];

    // Start a new session
    const startSession = () => {
        if (!words || words.length === 0) return;

        // Shuffle all available words and pick 10
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, SESSION_LENGTH);
        setSessionWords(selected);
        setCurrentIndex(0);
        setSessionActive(true);
        setPuzzleState({ isFilled: false, isCorrect: false });
        setHasValidated(false); // Reset validation state
        setSessionStats({ correct: 0, total: selected.length });
    };

    const handlePuzzleStateChange = useCallback((newState) => {
        setPuzzleState(prev => {
            if (prev.isFilled === newState.isFilled && prev.isCorrect === newState.isCorrect) {
                return prev;
            }
            return newState;
        });
    }, []);

    const handleValidate = () => {
        setHasValidated(true);

        // Update Stats based on submission correctness immediately upon validation
        if (puzzleState.isCorrect) {
            setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
        }
    };

    const handleNextWord = () => {
        if (currentIndex < sessionWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setPuzzleState({ isFilled: false, isCorrect: false });
            setHasValidated(false); // Reset for next word
        } else {
            // End of session
            setSessionActive(false);
        }
    };

    if (words.length === 0) {
        return (
            <div style={{ textAlign: 'center', opacity: 0.6, marginTop: '2rem' }}>
                <p>Sélectionnez des lettres dans la Bibliothèque pour débloquer des mots.</p>
            </div>
        );
    }

    // Summary / Start Screen
    if (!sessionActive) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-arabic)', fontSize: '3rem', color: 'var(--color-gold-600)' }}>
                    {sessionWords.length > 0 ? "Session Terminée !" : "Prêt à s'entraîner ?"}
                </h2>

                {sessionWords.length > 0 && (
                    <div style={{ margin: '2rem 0', fontSize: '1.2rem' }}>
                        <p>Score : <strong>{sessionStats.correct} / {sessionStats.total}</strong></p>
                        <p style={{ color: 'var(--text-secondary)' }}>Vérifiez l'onglet Progrès pour les détails.</p>
                    </div>
                )}

                <button
                    onClick={startSession}
                    className="btn-primary"
                    style={{ marginTop: '1rem' }}
                >
                    {sessionWords.length > 0 ? "Nouvelle Session" : "Commencer"}
                </button>
            </div>
        );
    }

    return (
        <div className="game-area" style={{ position: 'relative', paddingBottom: '6rem' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                padding: '0 1rem'
            }}>
                <div style={{
                    color: 'var(--color-gold-main)',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    fontSize: '0.8rem'
                }}>
                    mot {currentIndex + 1} sur {sessionWords.length}
                </div>

                {/* Vowel Toggle */}
                <button
                    onClick={() => setShowVowels(!showVowels)}
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.9rem',
                        backgroundColor: showVowels ? 'var(--color-sand-200)' : 'white',
                        border: '1px solid var(--color-sand-300)',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        color: 'var(--color-brown-text)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    Voyelles: {showVowels ? 'Afficher' : 'Masquer'}
                </button>
            </div>

            {currentWord && (
                <WordPuzzle
                    key={currentWord.text}
                    word={currentWord}
                    onStateChange={handlePuzzleStateChange}
                    showFeedback={hasValidated}
                    showVowels={showVowels}
                />
            )}

            {/* Control Button (Validate or Next) */}
            <div className="fade-in" style={{
                textAlign: 'center',
                marginTop: '2rem',
                paddingBottom: '2rem'
            }}>
                {!hasValidated ? (
                    <button
                        onClick={handleValidate}
                        disabled={!puzzleState.isFilled}
                        className={puzzleState.isFilled ? "btn-primary" : ""}
                        style={{
                            padding: '1rem 3rem',
                            fontSize: '1.2rem',
                            backgroundColor: puzzleState.isFilled ? 'var(--color-brown-dark)' : 'var(--color-sand-200)',
                            color: puzzleState.isFilled ? 'white' : '#9ca3af',
                            border: 'none',
                            borderRadius: '50px',
                            cursor: puzzleState.isFilled ? 'pointer' : 'not-allowed',
                            boxShadow: puzzleState.isFilled ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.3s ease',
                            fontWeight: 'bold'
                        }}
                    >
                        Valider
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => {
                                if ('speechSynthesis' in window) {
                                    const utterance = new SpeechSynthesisUtterance(currentWord.vocalizedText || currentWord.text);
                                    utterance.lang = 'ar-SA';
                                    window.speechSynthesis.speak(utterance);
                                }
                            }}
                            className="btn-secondary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <span>🔊</span> Écouter
                        </button>
                        <button
                            onClick={handleNextWord}
                            className="btn-primary"
                            style={{
                                backgroundColor: 'var(--color-brown-dark)', /* Force Brown even if correct */
                            }}
                        >
                            {currentIndex < sessionWords.length - 1 ? "Mot Suivant →" : "Terminer"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
