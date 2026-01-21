import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentView, onNavigate }) {
    const [isOpen, setIsOpen] = useState(false);
    const { logout, user } = useAuth();

    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
        // Do not close menu to allow quick toggle check
    };

    const navItems = [
        { id: 'library', label: 'Bibliothèque', icon: '📚' },
        { id: 'practice', label: 'Entraînement', icon: '🎮' },
        { id: 'progress', label: 'Progression', icon: '📊' },
        { id: 'my-account', label: 'Mon compte', icon: '👤' }
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
                    backgroundColor: 'var(--bg-app)', /* Use variable for theme support */
                    zIndex: 150,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2rem',
                    transition: 'background-color 0.3s'
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

                    {/* Dark Mode Toggle Switch */}
                    {/* <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* <span style={{ fontSize: '1.2rem', color: 'var(--color-brown-text)', fontWeight: '500' }}>
                            {theme === 'light' ? 'Mode Jour' : 'Mode Nuit'}
                        </span> 
                        <span style={{ fontSize: '1.2rem', color: 'var(--color-brown-text)', fontWeight: '500' }}>
                            ☀️
                        </span>
                        <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={theme === 'dark'}
                                onChange={toggleTheme}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                                position: 'absolute',
                                cursor: 'pointer',
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: theme === 'dark' ? 'var(--color-gold-main)' : '#ccc',
                                transition: '.4s',
                                borderRadius: '34px'
                            }}></span>
                            <span style={{
                                position: 'absolute',
                                content: '""',
                                height: '22px',
                                width: '22px',
                                left: theme === 'dark' ? '26px' : '3px',
                                bottom: '3px',
                                backgroundColor: 'white',
                                transition: '.4s',
                                borderRadius: '50%',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}></span>
                        </label>
                        <span style={{ fontSize: '1.2rem', color: 'var(--color-brown-text)', fontWeight: '500' }}>
                            🌙
                        </span>
                    </div>

                    <div style={{ width: '50px', height: '1px', background: 'var(--color-sand-200)', margin: '1rem 0' }} />

                    <div style={{
                        color: 'var(--text-secondary)',
                    }}>
                        Connecté en tant que <strong>{user?.username}</strong>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="btn-danger"
                        style={{
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            width: 'auto', // Override mobile 100% width
                            padding: '1rem 3rem',
                            minWidth: '200px'
                        }}
                    >
                        Déconnexion
                    </button> */}
                </div>
            )}
        </>
    );
}
