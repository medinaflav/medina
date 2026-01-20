import React, { useState, useEffect } from 'react';
import { ALPHABET, getLetter } from '../data/alphabet';
import AudioButton from './common/AudioButton';
import { getLetterForm } from '../utils/arabicForms';
import { getVisualForm } from '../utils/arabicForms';
import { recordAttempt } from '../utils/statsManager';
import { playSuccessSound, playErrorSound } from '../utils/audio';

export default function LetterPractice({ selectedLetters, onExit }) {
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
    };

    const generateQuestion = () => {
        // Pool: Uses ONLY selected letters (or full alphabet if none selected, but user requested selected only)
        // NOTE: availableLetters logic moved to render for UI, but logic here needs it too.
        // Replicating logic or using prop directly if consistent.
        // Actually earlier code used `selectedLetters` prop.

        // Consistent with earlier change: UI shows ALL, but questions can come from ALL too? 
        // User said "Dans Formes Isolées et toutes les formes affiche toute les lettres" (In Isolated and All forms show all letters).
        // This likely referred to the CHOICE grid.
        // Does the QUESTION generation pool also change? 
        // Typically practice is on selected letters. 
        // Assuming Questions = Selected Letters (or All if empty), Choices = All Letters.

        const poolIds = (selectedLetters && selectedLetters.length > 0)
            ? selectedLetters
            : ALPHABET.map(l => l.id);

        if (poolIds.length === 0) return;

        const randomId = poolIds[Math.floor(Math.random() * poolIds.length)];
        const letter = getLetter(randomId);

        let randomForm = 'isolated';
        if (practiceMode === 'all') {
            const forms = ['initial', 'medial', 'final', 'isolated'];
            randomForm = forms[Math.floor(Math.random() * forms.length)];
        }

        setTarget(letter);
        setTargetForm(randomForm);
        setFeedback(null);
        setSelectedLetterId(null);
        // Reset form selection based on mode
        if (practiceMode === 'all') {
            setSelectedForm(null);
        } else {
            setSelectedForm('isolated');
        }
    };

    useEffect(() => {
        if (practiceMode && !isSessionComplete) {
            generateQuestion();
        }
    }, [practiceMode]);

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
                generateQuestion();
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
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingTop: '2rem' }}>
                <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
                    <button
                        onClick={onExit}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1rem',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        ← Retour
                    </button>
                </div>
                <h2 style={{ color: 'var(--color-sand-900)', marginBottom: '2rem' }}>Choisissez votre entraînement</h2>

                {(selectedLetters.length === 0) && (
                    <div style={{
                        backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '12px', marginBottom: '2rem'
                    }}>
                        Attention : Aucune lettre sélectionnée. Utilisation de l'alphabet complet.
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '2rem',
                    marginBottom: '2rem'
                }}>
                    <button
                        onClick={() => startSession('isolated')}
                        style={{
                            flex: '1 1 300px',
                            maxWidth: '400px',
                            padding: '2rem',
                            fontSize: '1.2rem',
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--color-brown-text)',
                            border: '1px solid var(--color-sand-200)',
                            borderRadius: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                            transition: 'transform 0.2s'
                        }}
                    >
                        <span style={{ fontSize: '3rem', color: 'var(--color-brown-text)' }}>ب</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <strong>Formes isolées</strong>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>Identifiez uniquement les lettres de base.</span>
                        </div>
                    </button>

                    <button
                        onClick={() => startSession('all')}
                        style={{
                            flex: '1 1 300px',
                            maxWidth: '400px',
                            padding: '2rem',
                            fontSize: '1.2rem',
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--color-brown-text)',
                            border: '1px solid var(--color-sand-200)',
                            borderRadius: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                            transition: 'transform 0.2s'
                        }}
                    >
                        <span style={{ fontSize: '3rem', color: 'var(--color-brown-text)' }}>بـ ـبـ ـب</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <strong>Toutes les formes</strong>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>Identifiez les formes Initiales, Médianes et Finales.</span>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    if (isSessionComplete) {
        return (
            <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', backgroundColor: 'var(--bg-card)', padding: '3rem', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--color-gold-600)' }}>Session Terminée !</h2>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>
                    {score >= 8 ? '🎉' : score >= 5 ? '👍' : '💪'}
                </div>
                <p style={{ fontSize: '1.5rem', color: 'var(--color-brown-text)', marginBottom: '2rem' }}>
                    Score : <strong>{score} / 10</strong>
                </p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
                    Vos progrès ont été enregistrés.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={() => setPracticeMode(null)}
                        className="btn-secondary"
                    >
                        Menu Principal
                    </button>
                    <button
                        onClick={() => startSession(practiceMode)}
                        className="btn-primary"
                    >
                        Recommencer
                    </button>
                </div>
            </div>
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
            <div style={{
                textAlign: 'center',
                marginBottom: '2rem',
                padding: '2rem',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '24px',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                border: feedback === 'correct' ? '2px solid var(--color-emerald-500)'
                    : feedback === 'incorrect' ? '2px solid var(--color-red-500)'
                        : '1px solid var(--color-sand-200)',
                transition: 'all 0.3s ease'
            }}>
                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Identifiez cette lettre {practiceMode === 'all' ? '& forme' : ''}
                </div>
                <div style={{
                    fontFamily: 'var(--font-arabic)',
                    fontSize: '5rem',
                    height: '100px',
                    lineHeight: '100px',
                    color: 'var(--color-brown-text)'
                }}>
                    {getVisualForm(target.char, targetForm)}
                </div>
            </div>

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
                                onClick={confirmQuit} // Use confirmQuit here
                                className="btn-danger"
                                style={{ flex: 1 }}
                            >
                                Quitter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
