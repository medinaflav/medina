import React, { useState } from 'react';
import { ALPHABET, getLetter } from '../data/alphabet';
import AudioButton from './common/AudioButton';
import { recordAttempt } from '../utils/statsManager';
import { playSuccessSound, playErrorSound } from '../utils/audio';
import QuitConfirmationModal from './common/QuitConfirmationModal';
import SessionComplete from './common/SessionComplete';
import PracticeModeSelector from './LetterPractice/PracticeModeSelector';
import StimulusDisplay from './LetterPractice/StimulusDisplay';

import { getWeightedItem } from '../utils/adaptiveLearning';

export default function LetterPractice({ selectedLetters, onExit, stats }) {
    // Mode Selection: null (setup), 'isolated', 'all'
    const [practiceMode, setPracticeMode] = useState(null);

    // Question State
    const [target, setTarget] = useState(null); // The letter object
    const [targetForm, setTargetForm] = useState('isolated'); // The form displayed

    // Session State
    const [questionCount, setQuestionCount] = useState(0);
    const [sessionResults, setSessionResults] = useState([]);
    const [isSessionComplete, setIsSessionComplete] = useState(false);
    const [showQuitConfirm, setShowQuitConfirm] = useState(false);

    // User Selection
    const [selectedLetterId, setSelectedLetterId] = useState(null);
    const [selectedForm, setSelectedForm] = useState(null);

    const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect'
    const [score, setScore] = useState(0);

    const SESSION_LENGTH = 10;

    const startSession = (mode) => {
        setPracticeMode(mode);
        setQuestionCount(0);
        setSessionResults([]);
        setIsSessionComplete(false);
        setScore(0);
        setShowQuitConfirm(false);
        generateQuestion(mode, []);
    };

    const generateQuestion = (currentMode = practiceMode, excludeIds = []) => {
        const poolIds = (selectedLetters && selectedLetters.length > 0)
            ? selectedLetters
            : ALPHABET.map(l => l.id);

        if (poolIds.length === 0) return;

        // Filter out letters already used in this session to prevent duplicates
        // Only trigger this if there are enough remaining letters to pick from
        const availablePoolIds = poolIds.filter(id => !excludeIds.includes(id));
        const effectivePoolIds = availablePoolIds.length > 0 ? availablePoolIds : poolIds;

        // Create pool of letter objects
        const pool = effectivePoolIds.map(id => getLetter(id)).filter(Boolean);

        // Adaptive Selection
        const targetLetter = getWeightedItem(pool, stats, 'letter');

        // Fallback random if something failed
        const letter = targetLetter || getLetter(effectivePoolIds[Math.floor(Math.random() * effectivePoolIds.length)]);

        // Select Form to Test
        // If mode is 'all', random form. If 'isolated', isolated.
        let randomForm = 'isolated';
        if (currentMode === 'all') {
            const forms = ['initial', 'medial', 'final', 'isolated'];
            randomForm = forms[Math.floor(Math.random() * forms.length)];
        }

        setTarget(letter);
        setTargetForm(randomForm);
        setFeedback(null);
        setSelectedLetterId(null);
        // Reset form selection based on mode
        if (currentMode === 'all') {
            setSelectedForm(null);
        } else {
            setSelectedForm('isolated');
        }
    };

    // Removed useEffect to avoid setState update loop on mount. Call generateQuestion in startSession instead.


    const handleValidate = () => {
        if (feedback) return;
        if (!selectedLetterId || !selectedForm) return;

        const isLetterCorrect = selectedLetterId === target.id;
        const isFormCorrect = selectedForm === targetForm;
        const isCorrect = isLetterCorrect && isFormCorrect;

        // Buffer Result
        const newResult = { letterId: target.id, form: targetForm, isCorrect };
        setSessionResults(prev => [...prev, newResult]);

        if (isCorrect) {
            setFeedback('correct');
            setScore(s => s + 1);
            playSuccessSound();
        } else {
            setFeedback('incorrect');
            playErrorSound();
        }

        // Always move to next question after short delay
        setTimeout(() => {
            if (questionCount < SESSION_LENGTH - 1) {
                setQuestionCount(c => c + 1);
                // Calculate used IDs including the one just finished
                const currentSessionUsedIds = [...sessionResults.map(r => r.letterId), newResult.letterId];
                generateQuestion(undefined, currentSessionUsedIds);
            } else {
                finishSession([...sessionResults, newResult]);
            }
        }, 1000);
    };

    const finishSession = (finalResults) => {
        // Save all results
        finalResults.forEach(r => recordAttempt(r.letterId, r.form, r.isCorrect));
        setIsSessionComplete(true);
    };

    const handleQuit = () => {
        setShowQuitConfirm(true);
    };

    const confirmQuit = () => {
        setPracticeMode(null);
        setSessionResults([]); // Discard progress
        setShowQuitConfirm(false);
        onExit(); // This actually goes back to the main menu (App.jsx)
    };

    // SETUP SCREEN
    if (!practiceMode) {
        return (
            <PracticeModeSelector
                onSelectMode={startSession}
                onExit={onExit}
                selectedLettersCount={selectedLetters.length}
            />
        );
    }

    if (isSessionComplete) {
        return (
            <SessionComplete
                score={score}
                total={SESSION_LENGTH}
                onRetry={() => startSession(practiceMode)}
                onExit={() => setPracticeMode(null)}
            />
        );
    }

    if (!target) return <div>Chargement...</div>;

    const availableLetters = ALPHABET;

    return (
        <div className="practice-layout" style={{ paddingBottom: '6rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                        Question {questionCount + 1} / 10
                    </div>
                    <div style={{ fontSize: '1.2rem', color: 'var(--color-gold-600)', fontWeight: 'bold' }}>
                        Score: {score}
                    </div>
                </div>
            </div>

            {/* Stimulus Area */}
            <StimulusDisplay
                target={target}
                targetForm={targetForm}
                feedback={feedback}
                practiceMode={practiceMode}
            />

            <div className={`practice-layout ${practiceMode === 'all' ? 'practice-layout-sidebar' : ''}`}>
                {/* 1. Letter Selection */}
                <div>
                    {practiceMode === 'all' && <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>1. Choisissez la lettre</h3>}
                    <div className="practice-letters-grid">
                        {availableLetters.map(letter => (
                            <button
                                key={letter.id}
                                onClick={() => !feedback && setSelectedLetterId(letter.id)}
                                style={{
                                    aspectRatio: '1.5',
                                    backgroundColor: selectedLetterId === letter.id ? 'var(--color-gold-main)' : 'var(--bg-card)',
                                    color: selectedLetterId === letter.id ? 'white' : 'var(--color-sand-900)',
                                    border: '1px solid var(--color-sand-200)',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.1s',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    position: 'relative', // For absolute positioning of AudioButton
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {letter.name}
                                {/* Audio Button */}
                                <AudioButton
                                    textToSpeak={letter.arabicName || letter.char}
                                    size="24px"
                                    style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        zIndex: 10
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Validate Button Sticky Footer */}
            {selectedLetterId && (
                <div className="fade-in" style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--bg-card)',
                    backdropFilter: 'blur(12px)',
                    borderTop: '1px solid rgba(223, 219, 219, 0.1)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    zIndex: 100,
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
                }}>
                    <div style={{
                        display: 'flex',
                        width: '100%',
                        maxWidth: '500px',
                        gap: '0.8rem',
                        alignItems: 'center'
                    }}>
                        {/* Dropdown for Form Selection (Only in 'all' mode) */}
                        {practiceMode === 'all' && (
                            <div style={{ flex: 1 }}>
                                <select
                                    value={selectedForm || ''}
                                    onChange={(e) => !feedback && setSelectedForm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        fontSize: '1rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--color-sand-200)',
                                        backgroundColor: 'var(--bg-card)',
                                        color: selectedForm ? 'var(--color-brown-text)' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        appearance: 'none', // Remove default arrow for cleaner look
                                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23c5a028%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 1rem center',
                                        backgroundSize: '12px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <option value="" disabled>Quelle forme ?</option>
                                    <option value="isolated">Isolée (ـبـ)</option>
                                    <option value="initial">Initiale (بـ)</option>
                                    <option value="medial">Médiane (ـبـ)</option>
                                    <option value="final">Finale (ـب)</option>
                                </select>
                            </div>
                        )}

                        <button
                            onClick={handleValidate}
                            disabled={!selectedLetterId || !selectedForm || feedback}
                            className="btn-primary"
                            style={{
                                flex: 2,
                                padding: '1rem',
                                opacity: (!selectedLetterId || !selectedForm) ? 0.5 : 1,
                                cursor: (!selectedLetterId || !selectedForm) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {feedback ? (feedback === 'correct' ? 'Correct !' : 'Incorrect') : 'Valider'}
                        </button>
                    </div>
                </div>
            )}

            {/* Quit Button (In Flow) */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '4rem',
                marginBottom: '4rem', /* Add extra margin for the sticky footer space */
                paddingBottom: '4rem' /* Safe area */
            }}>
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

            {/* Quit Confirmation Modal */}
            {showQuitConfirm && (
                <QuitConfirmationModal
                    onConfirm={confirmQuit}
                    onCancel={() => setShowQuitConfirm(false)}
                />
            )}
        </div>
    );
}

