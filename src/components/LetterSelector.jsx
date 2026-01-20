import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ALPHABET } from '../data/alphabet';
import { getVisualForm } from '../utils/arabicForms';

// Define SOLAR_LETTERS (Shamsi)
// T, Th, D, Dh, R, Z, S, Sh, S (emph), D (emph), T (emph), Z (emph), L, N
const SOLAR_LETTERS = new Set([
    'ta', 'tha', 'dal', 'dhal', 'ra', 'zay', 'sin', 'shin',
    'sad', 'dad', 'ta_emph', 'za_emph', 'lam', 'nun'
]);

export default function LetterSelector({ selectedLetters, onSelectionChange }) {
    const [showSunMoon, setShowSunMoon] = useState(false);
    const [previewLetter, setPreviewLetter] = useState(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [playingLetter, setPlayingLetter] = useState(null);

    const toggleLetter = (id) => {
        if (selectedLetters.includes(id)) {
            onSelectionChange(selectedLetters.filter(l => l !== id));
        } else {
            onSelectionChange([...selectedLetters, id]);
        }
    };

    const handleCardClick = (letter) => {
        if (isSelectionMode) {
            toggleLetter(letter.id);
        } else {
            setPreviewLetter(letter);
        }
    };

    return (
        <div className="letter-selector">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'end',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{ textAlign: 'left' }}>
                    <h2 style={{ color: 'var(--color-brown-text)', marginBottom: '0.2rem', margin: 0, fontSize: '1.8rem' }}>Les lettres à apprendre</h2>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
                        Sélectionnez les lettres que vous souhaitez apprendre
                    </p>
                    <div style={{ flex: 1, textAlign: 'left', marginTop: '1rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--color-gold-600)', fontSize: '1.2rem' }}>{selectedLetters.length}</strong> lettres selectionnées
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {!isSelectionMode ? (
                        <button
                            onClick={() => setIsSelectionMode(true)}
                            style={{
                                padding: '0.6rem 1.5rem',
                                backgroundColor: 'var(--color-gold-main)',
                                border: 'none',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                color: 'white',
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'center',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 6px rgba(197, 160, 40, 0.3)'
                            }}
                        >
                            Selectionner
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsSelectionMode(false)}
                            style={{
                                padding: '0.6rem 1.5rem',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fee2e2',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                color: '#dc2626',
                                fontSize: '1rem',
                                fontWeight: 'bold'
                            }}
                        >
                            Annuler
                        </button>
                    )}

                    {/* Toggle Switch */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            {showSunMoon ? 'Lunaires/Solaires' : 'Lunaires/Solaires'}
                        </span>
                        <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={showSunMoon}
                                onChange={() => setShowSunMoon(!showSunMoon)}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                                position: 'absolute',
                                cursor: 'pointer',
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: showSunMoon ? 'var(--color-gold-main)' : '#ccc',
                                transition: '.4s',
                                borderRadius: '34px'
                            }}></span>
                            <span style={{
                                position: 'absolute',
                                content: '""',
                                height: '20px',
                                width: '20px',
                                left: showSunMoon ? '22px' : '2px',
                                bottom: '2px',
                                backgroundColor: 'white',
                                transition: '.4s',
                                borderRadius: '50%',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}></span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Responsive Grid Container */}
            <div className="letter-grid">
                {ALPHABET.map((letter) => {
                    const isSelected = selectedLetters.includes(letter.id);
                    const isSolar = SOLAR_LETTERS.has(letter.id);

                    return (
                        <div
                            key={letter.id}
                            onClick={() => handleCardClick(letter)}
                            className={`card ${isSelected ? 'selected' : ''}`}
                            style={{
                                cursor: 'pointer',
                                textAlign: 'center',
                                border: isSelected ? '2px solid var(--color-gold-main)' : '2px solid transparent',
                                backgroundColor: 'white',
                                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                borderRadius: '24px',
                                height: '160px', /* Increased height slightly for spacing */
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: isSelected ? '0 4px 15px rgba(217, 119, 6, 0.15)' : '0 2px 5px rgba(0,0,0,0.05)',
                            }}
                        >
                            {/* Type Icon (Sun/Moon) */}
                            {showSunMoon && (
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    left: '12px',
                                    fontSize: '14px',
                                    opacity: 0.8
                                }} title={isSolar ? 'Lettre Solaire (Shamsiyya)' : 'Lettre Lunaire (Qamariyya)'}>
                                    {isSolar ? '☀️' : '🌙'}
                                </div>
                            )}

                            {/* Audio Icon */}
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault(); // Prevent ghost clicks

                                    // Visual Feedback Logic
                                    if ('speechSynthesis' in window) {
                                        // Cancel any current speech
                                        window.speechSynthesis.cancel();

                                        const utterance = new SpeechSynthesisUtterance(letter.arabicName || letter.char);
                                        utterance.lang = 'ar-SA';

                                        // Set playing state
                                        setPlayingLetter(letter.id);

                                        utterance.onend = () => {
                                            setPlayingLetter(null);
                                        };

                                        utterance.onerror = () => {
                                            setPlayingLetter(null);
                                        };

                                        window.speechSynthesis.speak(utterance);
                                    }
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: playingLetter === letter.id ? 'var(--color-gold-main)' : 'white',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: playingLetter === letter.id ? 'white' : 'var(--color-brown-text)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    zIndex: 5,
                                    transform: playingLetter === letter.id ? 'scale(1.1)' : 'scale(1)',
                                    border: '1px solid ' + (playingLetter === letter.id ? 'var(--color-gold-main)' : '#f3f4f6')
                                }}
                            >
                                {playingLetter === letter.id ? (
                                    /* Active/Playing Wave Icon */
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="2" y="7" width="4" height="10" rx="1" fill="currentColor">
                                            <animate attributeName="height" values="10;16;10" dur="1s" repeatCount="indefinite" />
                                            <animate attributeName="y" values="7;4;7" dur="1s" repeatCount="indefinite" />
                                        </rect>
                                        <rect x="8" y="5" width="4" height="14" rx="1" fill="currentColor">
                                            <animate attributeName="height" values="14;8;14" dur="1s" repeatCount="indefinite" />
                                            <animate attributeName="y" values="5;8;5" dur="1s" repeatCount="indefinite" />
                                        </rect>
                                        <rect x="14" y="9" width="4" height="6" rx="1" fill="currentColor">
                                            <animate attributeName="height" values="6;12;6" dur="1s" repeatCount="indefinite" />
                                            <animate attributeName="y" values="9;6;9" dur="1s" repeatCount="indefinite" />
                                        </rect>
                                        <rect x="20" y="3" width="2" height="18" rx="1" fill="currentColor" opacity="0.5">
                                            <animate attributeName="height" values="18;10;18" dur="1s" repeatCount="indefinite" />
                                            <animate attributeName="y" values="3;7;3" dur="1s" repeatCount="indefinite" />
                                        </rect>
                                    </svg>
                                ) : (
                                    /* Static Speaker Icon */
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                                    </svg>
                                )}
                            </div>

                            <div style={{
                                fontFamily: 'var(--font-arabic)',
                                fontSize: '3.5rem',
                                color: 'var(--color-brown-text)',
                                marginTop: '-1.5rem',
                                lineHeight: 2
                            }}>
                                {letter.char}
                            </div>
                            <div style={{
                                fontSize: '1rem',
                                color: isSelected ? 'var(--color-gold-main)' : 'var(--color-sand-500)', /* Conditional color */
                                fontWeight: '500'
                            }}>
                                {letter.name}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Letter Preview Modal */}
            {
                previewLetter && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }} onClick={() => setPreviewLetter(null)}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '2rem',
                            borderRadius: '24px',
                            width: '90%',
                            maxWidth: '500px',
                            position: 'relative',
                            textAlign: 'center'
                        }} onClick={e => e.stopPropagation()}>
                            <h2 style={{ fontFamily: 'var(--font-arabic)', fontSize: '4rem', color: 'var(--color-brown-text)', margin: 0, lineHeight: 1 }}>
                                {previewLetter.char}
                            </h2>
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                {previewLetter.name}
                            </h3>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '1rem',
                                marginBottom: '2rem'
                            }}>
                                {['isolated', 'initial', 'medial', 'final'].map(form => (
                                    <div key={form} style={{
                                        padding: '1rem 0.5rem',
                                        backgroundColor: 'var(--color-sand-50)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--color-sand-200)'
                                    }}>
                                        <div style={{
                                            fontFamily: 'var(--font-arabic)',
                                            fontSize: '2.5rem',
                                            color: 'var(--color-gold-600)',
                                            height: '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {getVisualForm(previewLetter.char, form)}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize', marginTop: '0.5rem' }}>
                                            {form}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setPreviewLetter(null)}
                                style={{
                                    padding: '0.8rem 2rem',
                                    backgroundColor: 'var(--color-sand-200)',
                                    color: 'var(--color-sand-900)',
                                    border: 'none',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Sticky Action Footer */}
            {isSelectionMode && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderTop: '1px solid rgba(223, 219, 219, 0.05)',
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 100,
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', width: '100%', maxWidth: '600px' }}>
                        <button
                            onClick={() => {
                                const token = localStorage.getItem('token');
                                if (!token) return;

                                fetch('/api/settings', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({ selectedLetters })
                                })
                                    .then(res => res.json())
                                    .then(data => {
                                        if (data.success) {
                                            if (typeof toast !== 'undefined') {
                                                toast.success('Lettres sauvegardées !');
                                            } else {
                                                toast('Lettres sauvegardées !');
                                            }
                                            setIsSelectionMode(false); // Stop selection mode after save
                                        } else {
                                            if (typeof toast !== 'undefined') {
                                                toast.error('Erreur lors de la sauvegarde');
                                            } else {
                                                toast('Erreur lors de la sauvegarde');
                                            }
                                        }
                                    })
                                    .catch(err => {
                                        console.error(err);
                                        toast('Erreur réseau lors de la sauvegarde');
                                    });
                            }}
                            className="btn-primary"
                            style={{
                                flex: 2,
                                display: localStorage.getItem('token') ? 'flex' : 'none',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '1rem 2rem',
                                fontSize: '1.1rem'
                            }}
                        >
                            Enregistrer
                        </button>
                    </div>
                </div>
            )}

            {/* Letter Type Explanations */}
            <div className="fade-in" style={{
                marginTop: '4rem',
                padding: '2rem',
                backgroundColor: 'var(--color-sand-100)',
                borderRadius: '16px',
                border: '1px solid var(--color-sand-200)',
                color: 'var(--color-sand-900)'
            }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-gold-600)' }}>Comprendre les types de lettres</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            <span style={{ fontSize: '1.5rem' }}>☀️</span>
                            <span>Lettres Solaires (Shamsiyya)</span>
                        </div>
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                            Le 'L' de l'article <em>(Al-)</em> ne se prononce pas, il fusionne avec la lettre qui suit en la doublant.
                            <br />
                            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Ex: Al-Shams → <strong>Ash-Shams</strong></span>
                        </p>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            <span style={{ fontSize: '1.5rem' }}>🌙</span>
                            <span>Lettres Lunaires (Qamariyya)</span>
                        </div>
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                            Le 'L' de l'article <em>(Al-)</em> se prononce distinctement.
                            <br />
                            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Ex: <strong>Al-Qamar</strong></span>
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
}
