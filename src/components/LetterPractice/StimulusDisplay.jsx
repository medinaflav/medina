import React from 'react';
import { getVisualForm } from '../../utils/arabicForms';

export default function StimulusDisplay({ target, targetForm, feedback, practiceMode }) {
    if (!target) return null;

    return (
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
    );
}
