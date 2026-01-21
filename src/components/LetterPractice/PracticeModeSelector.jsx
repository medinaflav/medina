import React from 'react';

export default function PracticeModeSelector({ onSelectMode, onExit, selectedLettersCount }) {
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

            {(selectedLettersCount === 0) && (
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
                    onClick={() => onSelectMode('isolated')}
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
                    onClick={() => onSelectMode('all')}
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
