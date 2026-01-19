import React, { useState, useEffect } from 'react';
import { ALPHABET, getLetter } from '../data/alphabet';
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

    // User Selection
    const [selectedLetterId, setSelectedLetterId] = useState(null);
    const [selectedForm, setSelectedForm] = useState(null);

    const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect'
    const [score, setScore] = useState(0);

    const generateQuestion = () => {
        // Pool: Uses ONLY selected letters (or full alphabet if none selected, but user requested selected only)
        const available = (selectedLetters && selectedLetters.length > 0)
            ? selectedLetters
            : ALPHABET.map(l => l.id);

        if (available.length === 0) return;

        const randomId = available[Math.floor(Math.random() * available.length)];
        const letter = getLetter(randomId);

        let randomForm = 'isolated';
        if (practiceMode === 'all') {
            const forms = ['initial', 'medial', 'final', 'isolated'];
            randomForm = forms[Math.floor(Math.random() * forms.length)];
        }

        // Mode logic handled in render/state init, but here we set target
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
        if (practiceMode) {
            generateQuestion();
        }
    }, [practiceMode]);

    const handleValidate = () => {
        if (feedback) return;
        if (!selectedLetterId || !selectedForm) return;

        const isLetterCorrect = selectedLetterId === target.id;
        const isFormCorrect = selectedForm === targetForm;
        const isCorrect = isLetterCorrect && isFormCorrect;

        // Record Progress
        recordAttempt(target.id, targetForm, isCorrect);

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
            generateQuestion();
        }, 1000);
    };

    // SETUP SCREEN
    if (!practiceMode) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingTop: '2rem' }}>
                <h2 style={{ color: 'var(--color-sand-900)', marginBottom: '2rem' }}>Configurer l'entraînement</h2>

                {(selectedLetters.length === 0) && (
                    <div style={{
                        backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '12px', marginBottom: '2rem'
                    }}>
                        Attention : Aucune lettre sélectionnée. Utilisation de l'alphabet complet.
                    </div>
                )}

                <div style={{ display: 'grid', gap: '1rem' }}>
                    <button
                        onClick={() => setPracticeMode('isolated')}
                        style={{
                            padding: '1.5rem',
                            fontSize: '1.2rem',
                            backgroundColor: 'white',
                            border: '1px solid var(--color-sand-200)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                        }}
                    >
                        <span style={{ fontSize: '2rem' }}>ا</span>
                        <strong>Formes Isolées Uniquement</strong>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Identifiez uniquement les lettres de base.</span>
                    </button>

                    <button
                        onClick={() => setPracticeMode('all')}
                        style={{
                            padding: '1.5rem',
                            fontSize: '1.2rem',
                            backgroundColor: 'white',
                            border: '1px solid var(--color-sand-200)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                        }}
                    >
                        <span style={{ fontSize: '2rem' }}>بـ ـبـ ـب</span>
                        <strong>Toutes les Formes</strong>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Identifiez les formes Initiales, Médianes et Finales.</span>
                    </button>

                    <button onClick={onExit} style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        Annuler
                    </button>
                </div>
            </div>
        );
    }

    if (!target) return <div>Chargement...</div>;

    const availableLetters = (selectedLetters && selectedLetters.length > 0)
        ? ALPHABET.filter(l => selectedLetters.includes(l.id))
        : ALPHABET;

    return (
        <div style={{ paddingBottom: '4rem', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button
                    onClick={() => setPracticeMode(null)} // Go back to config
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1rem',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    ← Configurer
                </button>
                <div style={{ fontSize: '1.2rem', color: 'var(--color-gold-600)' }}>
                    Score: {score}
                </div>
            </div>

            {/* Stimulus Area */}
            <div style={{
                textAlign: 'center',
                marginBottom: '2rem',
                padding: '2rem',
                backgroundColor: 'white',
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

            <div style={{
                display: 'grid',
                gridTemplateColumns: practiceMode === 'all' ? '1fr 200px' : '1fr',
                gap: '2rem',
                alignItems: 'start'
            }}>
                {/* 1. Letter Selection */}
                <div>
                    {practiceMode === 'all' && <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>1. Choisissez la lettre</h3>}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                        gap: '0.8rem'
                    }}>
                        {availableLetters.map(letter => (
                            <button
                                key={letter.id}
                                onClick={() => !feedback && setSelectedLetterId(letter.id)}
                                style={{
                                    aspectRatio: '1.5',
                                    backgroundColor: selectedLetterId === letter.id ? 'var(--color-gold-main)' : 'white',
                                    color: selectedLetterId === letter.id ? 'white' : 'var(--color-sand-900)',
                                    border: '1px solid var(--color-sand-200)',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.1s',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                            >
                                {letter.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Form Selection (Only in All Forms mode) */}
                {practiceMode === 'all' && (
                    <div style={{ position: 'sticky', top: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>2. Choisissez la forme</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {['isolated', 'initial', 'medial', 'final'].map(form => (
                                <button
                                    key={form}
                                    onClick={() => !feedback && setSelectedForm(form)}
                                    style={{
                                        padding: '1rem',
                                        backgroundColor: selectedForm === form ? 'var(--color-gold-500)' : 'white',
                                        color: selectedForm === form ? 'white' : 'var(--color-sand-900)',
                                        border: '1px solid var(--color-sand-200)',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        textTransform: 'capitalize',
                                        transition: 'all 0.1s',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        textAlign: 'left'
                                    }}
                                >
                                    {form}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Validate Button */}
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <button
                    onClick={handleValidate}
                    disabled={!selectedLetterId || !selectedForm || feedback}
                    className="btn-primary"
                    style={{
                        width: '100%',
                        maxWidth: '300px',
                        opacity: (!selectedLetterId || !selectedForm) ? 0.5 : 1,
                        cursor: (!selectedLetterId || !selectedForm) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {feedback ? (feedback === 'correct' ? 'Correct !' : 'Incorrect') : 'Valider'}
                </button>
            </div>
        </div>
    );
}
