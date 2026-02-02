import React from 'react';

export default function PracticeMenu({ onSelectActivity }) {
    return (
        <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', color: 'var(--color-brown-text)', marginBottom: '2rem' }}>
                Choisir une activité
            </h2>

            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '2rem'
            }}>
                {/* Letter Recognition Card */}
                <button
                    onClick={() => onSelectActivity('letters')}
                    className="card"
                    style={{
                        padding: '2rem',
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                        textAlign: 'center',
                        flex: '1 1 300px',
                        maxWidth: '450px'
                    }}
                >
                    <div style={{ fontSize: '4rem' }}>
                        🅰️
                    </div>
                    <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-brown-text)', marginBottom: '0.5rem' }}>
                            Reconnaissance des lettres
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                            Maîtrisez les formes isolées, initiales, médianes et finales.
                        </div>
                    </div>
                </button>

                {/* Word Puzzle Card */}
                <button
                    onClick={() => onSelectActivity('words')}
                    className="card"
                    style={{
                        padding: '2rem',
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                        textAlign: 'center',
                        flex: '1 1 300px',
                        maxWidth: '450px'
                    }}
                >
                    <div style={{ fontSize: '4rem' }}>
                        📖
                    </div>
                    <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-brown-text)', marginBottom: '0.5rem' }}>
                            Lecture
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                            Lire et construire des mots.
                        </div>
                    </div>
                </button>

                {/* Sun/Moon Game Card */}
                <button
                    onClick={() => onSelectActivity('sun-moon')}
                    className="card"
                    style={{
                        padding: '2rem',
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                        textAlign: 'center',
                        flex: '1 1 300px',
                        maxWidth: '450px'
                    }}
                >
                    <div style={{ fontSize: '4rem' }}>
                        ☀️
                    </div>
                    <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-brown-text)', marginBottom: '0.5rem' }}>
                            Solaire ou Lunaire
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                            Distinguez les lettres solaires et lunaires.
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}
