import React from 'react';
import './LetterTypeExplanations.css';

export default function LetterTypeExplanations() {
    return (
        <div className="letter-type-card fade-in">
            <h3>Comprendre les types de lettres</h3>

            <div className="letter-type-grid">
                <div className="letter-type-item">
                    <div className="letter-type-header">
                        <span className="letter-type-icon">☀️</span>
                        <span>Lettres Solaires (Shamsiyya)</span>
                    </div>
                    <p className="letter-type-content">
                        Le 'L' de l'article <em>(Al-)</em> ne se prononce pas, il fusionne avec la lettre qui suit en la doublant.
                        <span className="letter-type-example">Ex: Al-Shams → <strong>Ash-Shams</strong></span>
                    </p>
                </div>

                <div className="letter-type-item">
                    <div className="letter-type-header">
                        <span className="letter-type-icon">🌙</span>
                        <span>Lettres Lunaires (Qamariyya)</span>
                    </div>
                    <p className="letter-type-content">
                        Le 'L' de l'article <em>(Al-)</em> se prononce distinctement.
                        <span className="letter-type-example">Ex: <strong>Al-Qamar</strong></span>
                    </p>
                </div>
            </div>
        </div>
    );
}
