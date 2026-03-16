import React, { useState, useEffect } from 'react';
import { ALPHABET, getLetter } from '../data/alphabet';
import { playSuccessSound, playErrorSound } from '../utils/audio';
import { recordAttempt } from '../utils/statsManager';
import QuitConfirmationModal from './common/QuitConfirmationModal';
import SessionComplete from './common/SessionComplete';
import './SunMoonGame.css';

export default function SunMoonGame({ selectedLetters, onExit, onViewProgress }) {
    // Game State
    const [target, setTarget] = useState(null);
    const [score, setScore] = useState(0);
    const [questionCount, setQuestionCount] = useState(0);
    const [isSessionComplete, setIsSessionComplete] = useState(false);
    const [showQuitConfirm, setShowQuitConfirm] = useState(false);

    // Feedback State
    const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'
    const [showOverlay, setShowOverlay] = useState(false);

    const SESSION_LENGTH = 10;

    // Initialize/Reset
    useEffect(() => {
        startSession();
    }, []);

    const startSession = () => {
        setQuestionCount(0);
        setScore(0);
        setIsSessionComplete(false);
        setFeedback(null);
        setShowOverlay(false);
        generateQuestion();
    };

    const generateQuestion = () => {
        // Use selected letters if available, otherwise all alphabet
        const poolIds = (selectedLetters && selectedLetters.length > 0)
            ? selectedLetters
            : ALPHABET.map(l => l.id);

        // Pick random letter
        const randomId = poolIds[Math.floor(Math.random() * poolIds.length)];
        const letter = getLetter(randomId);

        setTarget(letter);
        setFeedback(null);
        setShowOverlay(false);
    };

    const handleChoice = (choice) => {
        if (feedback) return; // Prevent double clicks

        const isCorrect = target.type === choice;

        // Persist stats — letters in this game are shown in isolated form
        recordAttempt(target.id, 'isolated', isCorrect);

        if (isCorrect) {
            setFeedback('correct');
            setScore(s => s + 1);
            playSuccessSound();
            setShowOverlay(true);
        } else {
            setFeedback('incorrect');
            playErrorSound();
            // Optional: Show error feedback before moving on?
            // valid behavior: Shake animation or red highlight.
            // For now, let's just show feedback state.
        }

        // Delay next question
        setTimeout(() => {
            if (questionCount < SESSION_LENGTH - 1) {
                setQuestionCount(c => c + 1);
                generateQuestion();
            } else {
                finishSession();
            }
        }, 1000);
    };

    const finishSession = () => {
        setIsSessionComplete(true);
    };

    const handleQuit = () => {
        setShowQuitConfirm(true);
    };

    const confirmQuit = () => {
        setShowQuitConfirm(false);
        onExit();
    };

    if (isSessionComplete) {
        return (
            <SessionComplete
                score={score}
                total={SESSION_LENGTH}
                onRetry={startSession}
                onExit={onExit}
                onViewProgress={onViewProgress}
            />
        );
    }

    if (!target) return <div className="sun-moon-game">Chargement...</div>;

    return (
        <div className="sun-moon-game fade-in">
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', maxWidth: '800px' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                        Question {questionCount + 1} / {SESSION_LENGTH}
                    </div>
                    <div style={{ fontSize: '1.2rem', color: 'var(--color-gold-600)', fontWeight: 'bold' }}>
                        Score: {score}
                    </div>
                </div>
            </div>

            <div className="letter-display">
                {target.char}
            </div>

            <div className="choices-container">
                <button
                    className={`choice-btn sun ${feedback === 'correct' && target.type === 'sun' ? 'correct' : ''} ${feedback === 'incorrect' && target.type !== 'sun' ? 'incorrect' : ''}`}
                    onClick={() => handleChoice('sun')}
                    disabled={!!feedback}
                    style={{
                        borderColor: feedback && target.type === 'sun' ? 'var(--color-green-500)' : undefined,
                        opacity: feedback && target.type !== 'sun' ? 0.5 : 1
                    }}
                >
                    <div className="icon">☀️</div>
                    <div>Lettre Solaire</div>
                </button>

                <button
                    className={`choice-btn moon ${feedback === 'correct' && target.type === 'moon' ? 'correct' : ''} ${feedback === 'incorrect' && target.type !== 'moon' ? 'incorrect' : ''}`}
                    onClick={() => handleChoice('moon')}
                    disabled={!!feedback}
                    style={{
                        borderColor: feedback && target.type === 'moon' ? 'var(--color-green-500)' : undefined,
                        opacity: feedback && target.type !== 'moon' ? 0.5 : 1
                    }}
                >
                    <div className="icon">🌙</div>
                    <div>Lettre Lunaire</div>
                </button>
            </div>

            {showOverlay && (
                <div className="feedback-overlay">
                    {target.type === 'sun' ? '☀️' : '🌙'}
                </div>
            )}
            <div style={{ marginTop: 'auto' }}>
                <button
                    onClick={handleQuit}
                    className="btn-danger"
                    style={{
                        minWidth: '150px',
                        backgroundColor: 'transparent',
                        color: 'var(--color-red-500)',
                        border: '1px solid var(--color-red-500)',
                        boxShadow: 'none'
                    }}
                >
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
