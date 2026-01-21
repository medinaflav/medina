import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/MyAccount.css';

export default function MyAccount({ userStats }) {
    const { user, logout } = useAuth();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // Calculate Mastered Letters (mock logic or real if stats allow)
    // Assuming 'mastered' means success_count >= 4 in isolated form for simplicity
    const masteredCount = userStats ? userStats.filter(s => s.form === 'isolated' && s.success_count >= 4).length : 0;
    const totalPractice = userStats ? userStats.reduce((acc, curr) => acc + curr.total_attempts, 0) : 0;

    const handleThemeToggle = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    console.log(user);


    return (
        <div className="my-account-container">
            <div className="my-account-card">
                <div className="my-account-header">
                    <h1 className="my-account-title-gold">Mon Compte</h1>
                    <div className="my-account-avatar">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="my-account-username">{user.username}</h2>
                </div>

                <div className="my-account-section">
                    <h3 className="my-account-section-title">Informations</h3>
                    <div className="my-account-info-row">
                        <span className="info-label">📧 Email</span>
                        <span className="info-value">{user.email}</span>
                    </div>
                </div>

                <div className="my-account-section">
                    <h3 className="my-account-section-title">Statistiques</h3>
                    <div className="stats-grid">
                        <div className="stat-box">
                            <span className="stat-number">{masteredCount}</span>
                            <span className="stat-label">Lettres Maîtrisées</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-number">{totalPractice}</span>
                            <span className="stat-label">Exercices Joués</span>
                        </div>
                    </div>
                </div>

                <div className="my-account-section">
                    <h3 className="my-account-section-title">Paramètres</h3>
                    <div className="my-account-info-row" style={{ cursor: 'pointer' }} onClick={handleThemeToggle}>
                        <span className="info-label">
                            {theme === 'light' ? '☀️ Mode Clair' : '🌙 Mode Sombre'}
                        </span>
                        <span className="info-value" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                            Changer
                        </span>
                    </div>
                </div>

                <button onClick={logout} className="btn-logout">
                    Déconnexion
                </button>
            </div>
        </div>
    );
}
