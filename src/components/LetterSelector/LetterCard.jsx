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
                border: isSelected ? 'var(--selected-border-w) solid var(--selected-border)' : '2px solid transparent',
                backgroundColor: isSelected ? 'var(--selected-bg)' : 'var(--bg-card)',
                transform: isSelected ? 'translateY(-3px) scale(1.03)' : 'translateY(0) scale(1)',
                transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease, background-color 0.18s ease, border-color 0.18s ease',
                position: 'relative',
                borderRadius: '24px',
                height: '160px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isSelected ? 'var(--selected-glow)' : '0 2px 5px rgba(0,0,0,0.05)',
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
                color: isSelected ? 'var(--selected-arabic)' : 'var(--color-brown-text)',
                fontSize: isSelected ? '4rem' : '3.5rem',
                marginTop: '-1.5rem',
                lineHeight: 2
            }}>
                {letter.char}
            </div>
            <div style={{
                fontSize: '1rem',
                color: isSelected ? 'var(--selected-name)' : 'var(--ink-secondary)',
                fontWeight: isSelected ? '700' : '500'
            }}>
                {letter.name}
            </div>
            {isSelected && (
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '12px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--selected-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    color: 'white',
                    fontWeight: '700',
                    lineHeight: 1,
                    flexShrink: 0,
                }}>
                    ✓
                </div>
            )}
        </div>
    );
}
