import React from 'react';

export default function SessionComplete({ score, total, onRetry, onExit, onViewProgress, children }) {
    return (
        <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', backgroundColor: 'var(--bg-card)', padding: '3rem', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--color-gold-600)' }}>Session Terminée !</h2>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>
                {score >= (total * 0.8) ? '🎉' : score >= (total * 0.5) ? '👍' : '💪'}
            </div>
            <p style={{ fontSize: '1.5rem', color: 'var(--color-brown-text)', marginBottom: '2rem' }}>
                Score : <strong>{score} / {total}</strong>
            </p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
                Vos progrès ont été enregistrés.
            </p>
            {children}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                    onClick={onExit}
                    className="btn-secondary"
                >
                    Menu
                </button>
                {onViewProgress && (
                    <button
                        onClick={onViewProgress}
                        className="btn-secondary"
                        style={{ borderColor: 'var(--color-gold-main)', color: 'var(--color-gold-600)' }}
                    >
                        Progression
                    </button>
                )}
                <button
                    onClick={onRetry}
                    className="btn-primary"
                >
                    Recommencer
                </button>
            </div>
        </div>
    );
}
