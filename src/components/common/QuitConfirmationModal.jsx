import React from 'react';

export default function QuitConfirmationModal({ onConfirm, onCancel }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'var(--bg-card)',
                padding: '2rem',
                borderRadius: '16px',
                maxWidth: '400px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--color-brown-text)' }}>Voulez-vous vraiment quitter ?</h3>
                <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                    Votre progression pour cette session ne sera pas enregistrée.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={onCancel}
                        className="btn-secondary"
                        style={{ flex: 1 }}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn-danger"
                        style={{ flex: 1 }}
                    >
                        Quitter
                    </button>
                </div>
            </div>
        </div>
    );
}
