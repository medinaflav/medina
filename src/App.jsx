import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import AuthForms from './components/AuthForms';
import LetterSelector from './components/LetterSelector';
import GameArea from './components/GameArea';
import Layout from './components/Layout';
import StatsDashboard from './components/StatsDashboard';
import LetterPractice from './components/LetterPractice';
import PracticeMenu from './components/PracticeMenu';
import MyAccount from './components/MyAccount';
import { generateSessionWords } from './utils/wordGenerator';

export default function App() {
    const { user, logout, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('library');
    const [selectedLetters, setSelectedLetters] = useState([]);
    const [practiceWords, setPracticeWords] = useState([]);
    const [userStats, setUserStats] = useState([]); // Global stats

    // New state for Practice Sub-view ('menu', 'letters', 'words')
    const [practiceView, setPracticeView] = useState('menu');

    // Fetch user settings AND stats when user logs in
    useEffect(() => {
        if (user) {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch Settings
            fetch('/api/settings', { headers })
                .then(res => res.json())
                .then(data => {
                    if (data.selectedLetters) {
                        setSelectedLetters(data.selectedLetters);
                    }
                })
                .catch(console.error);

            // Fetch Stats (Lifted from StatsDashboard)
            fetch('/api/stats', { headers })
                .then(res => res.json())
                .then(data => {
                    setUserStats(data.stats || []);
                })
                .catch(console.error);
        }
    }, [user]);

    // Generate words whenever selected letters change or tab switches to practice
    useEffect(() => {
        // Pass userStats to generator for adaptive learning
        if (selectedLetters.length > 0) {
            const words = generateSessionWords(10, selectedLetters, userStats); // Reduced to 10 per user request
            setPracticeWords(words);
        } else {
            // Free Play: Generate random words if no letters selected
            const words = generateSessionWords(10, [], userStats);
            setPracticeWords(words);
        }
    }, [selectedLetters, activeTab, userStats]); // Depend on userStats now

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
                    return <PracticeMenu onSelectActivity={setPracticeView} />;
                }

                if (practiceView === 'letters') {
                    return <LetterPractice
                        selectedLetters={selectedLetters}
                        stats={userStats}
                        onExit={() => {
                            setPracticeView('menu');
                            // Refresh stats on exit to ensure next session is up to date?
                            // For simplicity, relying on next mount or manual refresh.
                        }}
                    />;
                }
                if (practiceView === 'words') {
                    return <GameArea words={practiceWords} onExit={() => setPracticeView('menu')} />;
                }
                return null;

            case 'progress':
                return <StatsDashboard selectedLetters={selectedLetters} statsData={userStats} />;
            case 'my-account':
                return <MyAccount userStats={userStats} />;
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

