import React, { useState, useEffect, useCallback } from 'react';
import WordPuzzle from './WordPuzzle';
import useAudioPlayer from '../hooks/useAudioPlayer';
import QuitConfirmationModal from './common/QuitConfirmationModal';
import './GameArea.css';

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
    const currentWord = sessionWords[currentIndex];

    // Audio Player
    const { play: playWord, isPlaying: isWordPlaying } = useAudioPlayer(currentWord ? (currentWord.vocalizedText || currentWord.text) : '');

    // Start a new session
    const startSession = useCallback(() => {
        if (!words || words.length === 0) return;

        const shuffled = [...words].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, SESSION_LENGTH);
        setSessionWords(selected);
        setCurrentIndex(0);
        setSessionActive(true);
        setPuzzleState({ isFilled: false, isCorrect: false });
        setHasValidated(false);
        setSessionStats({ correct: 0, total: selected.length });
    }, [words]);

    // Auto-start
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
        if (puzzleState.isCorrect) {
            setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
        }
    };

    const handleNextWord = () => {
        if (currentIndex < sessionWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setPuzzleState({ isFilled: false, isCorrect: false });
            setHasValidated(false);
        } else {
            setSessionActive(false);
        }
    };

    const handleQuit = () => setShowQuitConfirm(true);

    const confirmQuit = () => {
        setSessionActive(false);
        setShowQuitConfirm(false);
        if (onExit) onExit();
    };

    if (words.length === 0) {
        return (
            <div className="flex-center" style={{ height: '50vh', opacity: 0.6 }}>
                <p>Sélectionnez des lettres dans la Bibliothèque pour débloquer des mots.</p>
            </div>
        );
    }

    // Session Summary View
    if (!sessionActive) {
        return (
            <div className="session-summary fade-in">
                <h2 className="summary-title">
                    {sessionWords.length > 0 ? "Session Terminée !" : "Prêt à s'entraîner ?"}
                </h2>

                {sessionWords.length > 0 && (
                    <div className="summary-stats">
                        <div className="stat-row">
                            <span className="stat-label">Score</span>
                            <span className="stat-value">{sessionStats.correct} / {sessionStats.total}</span>
                        </div>
                        <p style={{ marginTop: '1rem', color: 'var(--color-sand-500)', fontSize: '0.9rem' }}>
                            Vérifiez l'onglet Progression pour les détails.
                        </p>
                    </div>
                )}

                <button onClick={startSession} className="btn-primary">
                    {sessionWords.length > 0 ? "Nouvelle Session" : "Commencer"}
                </button>
            </div>
        );
    }

    return (
        <div className="game-area">
            {/* Header */}
            <div className="game-header">
                <div className="game-progress">
                    mot {currentIndex + 1} sur {sessionWords.length}
                </div>

                <div className="vowel-toggle-container">
                    <span className="vowel-label">Voyelles</span>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={showVowels}
                            onChange={() => setShowVowels(!showVowels)}
                            className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>

            {/* Puzzle Area */}
            {currentWord && (
                <WordPuzzle
                    key={currentWord.text}
                    word={currentWord}
                    onStateChange={handlePuzzleStateChange}
                    showFeedback={hasValidated}
                    showVowels={showVowels}
                    isLocked={hasValidated}
                />
            )}

            {/* Actions */}
            <div className="practice-actions fade-in">
                {!hasValidated ? (
                    <button
                        onClick={handleValidate}
                        disabled={!puzzleState.isFilled}
                        className={puzzleState.isFilled ? "btn-primary w-full" : "btn-secondary w-full"}
                        style={!puzzleState.isFilled ? { borderColor: 'var(--color-sand-300)', color: 'var(--color-sand-400)', cursor: 'not-allowed' } : {}}
                    >
                        Valider
                    </button>
                ) : (
                    <div className="post-validation-controls">
                        <button
                            onClick={playWord}
                            className="btn-secondary btn-listen"
                            style={{
                                color: isWordPlaying ? 'var(--color-gold-main)' : 'inherit',
                                borderColor: isWordPlaying ? 'var(--color-gold-main)' : undefined
                            }}
                        >
                            <span>{isWordPlaying ? '🔊' : '🔈'}</span> Écouter le mot
                        </button>

                        <button
                            onClick={handleNextWord}
                            className="btn-primary btn-next"
                            style={{ backgroundColor: 'var(--color-brown-dark)' }}
                        >
                            {currentIndex < sessionWords.length - 1 ? "Mot suivant →" : "Terminer"}
                        </button>
                    </div>
                )}

                <button onClick={handleQuit} className="btn-danger btn-quit">
                    Quitter
                </button>
            </div>

            {showQuitConfirm && (
                <QuitConfirmationModal
                    onConfirm={confirmQuit}
                    onCancel={() => setShowQuitConfirm(false)}
                />
            )}
        </div>
    );
}

