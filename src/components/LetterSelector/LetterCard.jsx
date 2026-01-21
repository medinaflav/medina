import React from 'react';
import AudioButton from '../common/AudioButton';

export default function LetterCard({ letter, isSelected, isSolar, showSunMoonType, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`card ${isSelected ? 'selected' : ''} `}
            style={{
                cursor: 'pointer',
                textAlign: 'center',
                border: isSelected ? '2px solid var(--color-gold-main)' : '2px solid transparent',
                backgroundColor: 'var(--bg-card)',
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
            {showSunMoonType && (
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

            {/* Audio Icon (Standardized) */}
            <AudioButton
                textToSpeak={letter.arabicName || letter.char}
                size="40px"
                style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    zIndex: 5
                }}
            />

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
                color: isSelected ? 'var(--color-gold-main)' : 'var(--text-secondary)', /* Conditional color */
                fontWeight: '500'
            }}>
                {letter.name}
            </div>
        </div>
    );
}
