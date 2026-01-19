import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import AuthForms from './components/AuthForms';
import LetterSelector from './components/LetterSelector';
import GameArea from './components/GameArea';
import Layout from './components/Layout';
import StatsDashboard from './components/StatsDashboard';
import LetterPractice from './components/LetterPractice';
import { generateSessionWords } from './utils/wordGenerator';

export default function App() {
    const { user, logout, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('library');
    const [selectedLetters, setSelectedLetters] = useState([]);
    const [practiceWords, setPracticeWords] = useState([]);

    // New state for Practice Sub-view ('menu', 'letters', 'words')
    const [practiceView, setPracticeView] = useState('menu');

    // Fetch user settings when user logs in
    useEffect(() => {
        if (user) {
            const token = localStorage.getItem('token');
            fetch('/api/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.selectedLetters) {
                        setSelectedLetters(data.selectedLetters);
                    }
                })
                .catch(console.error);
        }
    }, [user]);

    // Generate words whenever selected letters change or tab switches to practice
    useEffect(() => {
        if (selectedLetters.length > 0) {
            const words = generateSessionWords(50, selectedLetters); // Pool of 50 words
            setPracticeWords(words);
        } else {
            // Free Play: Generate random words if no letters selected
            const words = generateSessionWords(50, []);
            setPracticeWords(words);
        }
    }, [selectedLetters, activeTab]);

    // Reset practice view when tab changes
    useEffect(() => {
        setPracticeView('menu');
    }, [activeTab]);

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--color-sand-100)',
                color: 'var(--color-brown-text)'
            }}>
                Chargement...
            </div>
        );
    }

    if (!user) {
        return <AuthForms />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'library':
                return (
                    <LetterSelector
                        selectedLetters={selectedLetters}
                        onSelectionChange={setSelectedLetters}
                    />
                );
            case 'practice':
                if (practiceView === 'menu') {
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
                                    onClick={() => setPracticeView('letters')}
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
                                    onClick={() => setPracticeView('words')}
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
                            </div>
                        </div>
                    );
                }
                if (practiceView === 'letters') {
                    return <LetterPractice selectedLetters={selectedLetters} onExit={() => setPracticeView('menu')} />;
                }
                if (practiceView === 'words') {
                    return <GameArea words={practiceWords} onExit={() => setPracticeView('menu')} />;
                }
                return null;

            case 'progress':
                return <StatsDashboard />;
            default:
                return (
                    <LetterSelector
                        selectedLetters={selectedLetters}
                        onSelectionChange={setSelectedLetters}
                    />
                );
        }
    };

    return (
        <Layout
            currentView={activeTab}
            onNavigate={setActiveTab}
            isSessionActive={false} // You might want to track if a game session is active to hide nav
        >
            {renderContent()}
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#333',
                        color: '#fff',
                    },
                }}
            />
        </Layout>
    );
}
