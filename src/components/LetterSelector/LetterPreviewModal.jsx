import React from 'react';
import { getVisualForm } from '../../utils/arabicForms';

export default function LetterPreviewModal({ letter, onClose }) {
    if (!letter) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'var(--bg-card)',
                padding: '2rem',
                borderRadius: '24px',
                width: '90%',
                maxWidth: '500px',
                position: 'relative',
                textAlign: 'center'
            }} onClick={e => e.stopPropagation()}>
                <h2 style={{ fontFamily: 'var(--font-arabic)', fontSize: '4rem', color: 'var(--color-brown-text)', margin: 0, lineHeight: 1 }}>
                    {letter.char}
                </h2>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    {letter.name}
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    {[
                        { id: 'isolated', label: 'Isolée' },
                        { id: 'initial', label: 'Début' },
                        { id: 'medial', label: 'Milieu' },
                        { id: 'final', label: 'Fin' }
                    ].map(({ id, label }) => (
                        <div key={id} style={{
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
                                {getVisualForm(letter.char, id)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize', marginTop: '0.5rem' }}>
                                {label}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onClose}
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
    );
}
