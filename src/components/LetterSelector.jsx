import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ALPHABET } from '../data/alphabet';
import LetterCard from './LetterSelector/LetterCard';
import LetterPreviewModal from './LetterSelector/LetterPreviewModal';
import LetterTypeExplanations from './LetterSelector/LetterTypeExplanations';
import './LetterSelector.css';

// Define SOLAR_LETTERS (Shamsi)
const SOLAR_LETTERS = new Set([
    'ta', 'tha', 'dal', 'dhal', 'ra', 'zay', 'sin', 'shin',
    'sad', 'dad', 'ta_emph', 'za_emph', 'lam', 'nun'
]);

export default function LetterSelector({ selectedLetters, onSelectionChange }) {
    const [showSunMoon, setShowSunMoon] = useState(false);
    const [previewLetter, setPreviewLetter] = useState(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

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

    const handleSave = () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token} `
            },
            body: JSON.stringify({ selectedLetters })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success('Lettres sauvegardées !');
                    setIsSelectionMode(false);
                } else {
                    toast.error('Erreur lors de la sauvegarde');
                }
            })
            .catch(err => {
                console.error(err);
                toast.error('Erreur réseau lors de la sauvegarde');
            });
    };

    return (
        <div className="letter-selector">
            <div className="selector-header">
                <div className="selector-title-block">
                    <h2 className="selector-title">Les lettres à apprendre</h2>
                    <p className="selector-subtitle">
                        Sélectionnez les lettres que vous souhaitez apprendre
                    </p>
                    <div className="selector-count">
                        <strong>{selectedLetters.length}</strong> lettres selectionnées
                    </div>
                </div>

                <div className="selector-controls">
                    {!isSelectionMode ? (
                        <button
                            onClick={() => setIsSelectionMode(true)}
                            className="btn-select-mode"
                        >
                            Selectionner
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsSelectionMode(false)}
                            className="btn-cancel-mode"
                        >
                            Annuler
                        </button>
                    )}

                    {/* Toggle Switch */}
                    <div className="toggle-group">
                        <span className="toggle-label">
                            {showSunMoon ? 'Lunaires/Solaires' : 'Lunaires/Solaires'}
                        </span>
                        <label className="toggle-switch"> {/* Using shared toggle style from GameArea if available, or redefining in CSS */}
                            <input
                                type="checkbox"
                                checked={showSunMoon}
                                onChange={() => setShowSunMoon(!showSunMoon)}
                                className="toggle-input"
                            />
                            <span className="toggle-slider"></span>
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
                        <LetterCard
                            key={letter.id}
                            letter={letter}
                            isSelected={isSelected}
                            isSolar={isSolar}
                            showSunMoonType={showSunMoon}
                            onClick={() => handleCardClick(letter)}
                        />
                    );
                })}
            </div >

            {/* Letter Preview Modal */}
            <LetterPreviewModal
                letter={previewLetter}
                onClose={() => setPreviewLetter(null)}
            />

            {/* Sticky Action Footer */}
            {isSelectionMode && (
                <div className="sticky-footer fade-in">
                    <div className="sticky-footer-content">
                        <button
                            onClick={handleSave}
                            className="btn-primary btn-save"
                            style={{ display: localStorage.getItem('token') ? 'flex' : 'none' }}
                        >
                            Enregistrer
                        </button>
                    </div>
                </div>
            )}

            {/* Letter Type Explanations */}
            <LetterTypeExplanations />
        </div >
    );
}

