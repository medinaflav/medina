import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentView, onNavigate }) {
    const [isOpen, setIsOpen] = useState(false);
    const { logout, user } = useAuth();

    const navItems = [
        { id: 'library', label: 'Bibliothèque', icon: '📚' },
        { id: 'practice', label: 'Entraînement', icon: '🎮' },
        { id: 'progress', label: 'Progression', icon: '📊' }
    ];

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleNavigate = (viewId) => {
        onNavigate(viewId);
        setIsOpen(false);
    };

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    return (
        <>
            {/* Burger Button */}
            <button
                onClick={toggleMenu}
                style={{
                    position: 'absolute',
                    top: '2rem',
                    right: '1.5rem',
                    zIndex: 200,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                }}
            >
                <div style={{ width: '32px', height: '3px', background: 'var(--color-gold-main)', borderRadius: '2px' }} />
                <div style={{ width: '32px', height: '3px', background: 'var(--color-gold-main)', borderRadius: '2px' }} />
                <div style={{ width: '32px', height: '3px', background: 'var(--color-gold-main)', borderRadius: '2px' }} />
            </button>

            {/* Overlay Menu */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    zIndex: 150,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2rem'
                }}>
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleNavigate(item.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '2rem',
                                color: currentView === item.id ? 'var(--color-gold-main)' : 'var(--color-brown-text)',
                                fontFamily: 'var(--font-ui)',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}

                    <div style={{ width: '50px', height: '1px', background: 'var(--color-sand-200)', margin: '1rem 0' }} />

                    <div style={{
                        color: 'var(--text-secondary)',
                        marginBottom: '1rem'
                    }}>
                        Connecté en tant que <strong>{user?.username}</strong>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="btn-danger-outline"
                        style={{ fontSize: '1.1rem', cursor: 'pointer' }}
                    >
                        Déconnexion
                    </button>
                </div>
            )}
        </>
    );
}
