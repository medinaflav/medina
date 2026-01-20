import React, { useState, useEffect, useMemo, useCallback } from 'react';
import WordPuzzle from './WordPuzzle';
import useAudioPlayer from '../hooks/useAudioPlayer';
import AudioIcon from './common/AudioIcon';

export default function GameArea({ words, onExit }) {
    // Session State
    const [sessionWords, setSessionWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sessionActive, setSessionActive] = useState(false);
    const [puzzleState, setPuzzleState] = useState({ isFilled: false, isCorrect: false });
    const [hasValidated, setHasValidated] = useState(false);
    const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
    const [showVowels, setShowVowels] = useState(true);
    const [showQuitConfirm, setShowQuitConfirm] = useState(false);

    const SESSION_LENGTH = 10;

    // Simplified currentWord logic
    const currentWord = sessionWords[currentIndex];

    // Audio Player for the text button
    const { play: playWord, isPlaying: isWordPlaying } = useAudioPlayer(currentWord ? (currentWord.vocalizedText || currentWord.text) : '');

    // Start a new session
    const startSession = useCallback(() => {
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
    }, [words]);

    // Auto-start session on mount if valid words exist
    useEffect(() => {
        if (words.length > 0 && sessionWords.length === 0 && !sessionActive) {
            startSession();
        }
    }, [words, sessionWords.length, sessionActive, startSession]);

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

    const handleQuit = () => {
        setShowQuitConfirm(true);
    };

    const confirmQuit = () => {
        setSessionActive(false);
        setShowQuitConfirm(false);
        // If onExit is provided, call it. Otherwise just return to summary via sessionActive=false
        if (onExit) onExit();
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
                        <p style={{ color: 'var(--text-secondary)' }}>Vérifiez l'onglet Progression pour les détails.</p>
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
                flexWrap: 'wrap', // Allow header to wrap
                gap: '1rem',
                marginBottom: '1rem',
                padding: '0 1rem'
            }}>
                <div style={{
                    color: 'var(--color-gold-main)',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap'
                }}>
                    mot {currentIndex + 1} sur {sessionWords.length}
                </div>

                {/* Vowel Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Voyelles</span>
                    <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={showVowels}
                            onChange={() => setShowVowels(!showVowels)}
                            style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                            position: 'absolute',
                            cursor: 'pointer',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: showVowels ? 'var(--color-gold-main)' : '#ccc',
                            transition: '.4s',
                            borderRadius: '34px'
                        }}></span>
                        <span style={{
                            position: 'absolute',
                            content: '""',
                            height: '20px',
                            width: '20px',
                            left: showVowels ? '22px' : '2px',
                            bottom: '2px',
                            backgroundColor: 'white',
                            transition: '.4s',
                            borderRadius: '50%',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}></span>
                    </label>
                </div>
            </div >

            {currentWord && (
                <WordPuzzle
                    key={currentWord.text}
                    word={currentWord}
                    onStateChange={handlePuzzleStateChange}
                    showFeedback={hasValidated}
                    showVowels={showVowels}
                    isLocked={hasValidated}
                />
            )
            }

            {/* Control Button (Validate or Next) */}
            <div className="fade-in practice-actions" style={{
                display: 'flex',
                flexDirection: 'column', // Force vertical stack
                alignItems: 'center',
                gap: '1rem',
                paddingBottom: '2rem',
                width: '100%',
                maxWidth: '400px', // Constrain width on larger screens
                margin: '1.5rem auto 0'
            }}>
                {!hasValidated ? (
                    /* PRE-VALIDATION: Validate Button */
                    <button
                        onClick={handleValidate}
                        disabled={!puzzleState.isFilled}
                        className={puzzleState.isFilled ? "btn-primary" : "btn-secondary"} // Use secondary style when disabled for shape/padding consistency
                        style={{
                            width: '100%',
                            backgroundColor: puzzleState.isFilled ? 'var(--color-brown-dark)' : 'var(--color-sand-200)',
                            color: puzzleState.isFilled ? 'white' : '#9ca3af',
                            cursor: puzzleState.isFilled ? 'pointer' : 'not-allowed',
                            border: 'none', // Ensure no border override if secondary has one
                            opacity: 1 // Override any default disabled opacity if we are handling colors manually
                        }}
                    >
                        Valider
                    </button>
                ) : (
                    /* POST-VALIDATION: Listen + Next Row */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', alignItems: 'center' }}>

                        <button
                            onClick={playWord}
                            className="btn-secondary"
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                color: isWordPlaying ? 'var(--color-gold-600)' : 'inherit',
                                borderColor: isWordPlaying ? 'var(--color-gold-main)' : undefined
                            }}
                        >
                            <span>{isWordPlaying ? '🔊' : '🔈'}</span> Écouter le mot
                        </button>

                        <button
                            onClick={handleNextWord}
                            className="btn-primary"
                            style={{
                                backgroundColor: 'var(--color-brown-dark)',
                                width: '100%'
                            }}
                        >
                            {currentIndex < sessionWords.length - 1 ? "Mot suivant →" : "Terminer"}
                        </button>
                    </div>
                )}

                {/* QUIT BUTTON ALWAY AT BOTTOM */}
                <button
                    onClick={handleQuit}
                    className="btn-danger"
                    style={{
                        width: '100%',
                        marginTop: '0.5rem'
                    }}
                >
                    Quitter
                </button>
            </div>

            {/* Quit Confirmation Modal */}
            {
                showQuitConfirm && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'var(--bg-card)',
                            padding: '2rem',
                            borderRadius: '16px',
                            maxWidth: '400px',
                            textAlign: 'center',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                        }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--color-brown-text)' }}>Voulez-vous vraiment quitter ?</h3>
                            <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                                Votre progression pour cette session ne sera pas enregistrée.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setShowQuitConfirm(false)}
                                    className="btn-secondary"
                                    style={{ flex: 1 }}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmQuit}
                                    className="btn-danger"
                                    style={{ flex: 1 }}
                                >
                                    Quitter
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
