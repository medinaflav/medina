import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

/**
 * Bottom tab navigation bar — fixed to the bottom of the viewport.
 * Replaces the previous hamburger/overlay menu pattern.
 *
 * @param {string}   currentView  - Active tab id ('library' | 'practice' | 'progress' | 'my-account')
 * @param {Function} onNavigate   - Callback when a tab is tapped
 */
export default function Navbar({ currentView, onNavigate }) {
    const { logout } = useAuth();

    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    /* Nav items — SVG icons kept inline for zero extra dependency */
    const navItems = [
        {
            id: 'library',
            label: 'Bibliothèque',
            icon: (
                /* Book icon */
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ),
        },
        {
            id: 'practice',
            label: 'Entraînement',
            icon: (
                /* Star icon */
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ),
        },
        {
            id: 'progress',
            label: 'Progression',
            icon: (
                /* Bar chart icon */
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="12" y1="20" x2="12" y2="4"  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="6"  y1="20" x2="6"  y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            ),
        },
        {
            id: 'my-account',
            label: 'Compte',
            icon: (
                /* Person icon */
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ),
        },
    ];

    return (
        <nav
            aria-label="Navigation principale"
            className="bottom-nav"
        >
            {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        aria-label={item.label}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {/* Icon pill — highlighted when active */}
                        <span className={`nav-pill ${isActive ? 'nav-pill--active' : ''}`}>
                            {item.icon}
                        </span>

                        {/* Label */}
                        <span className={`nav-label ${isActive ? 'nav-label--active' : ''}`}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}
