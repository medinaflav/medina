import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children, currentView, onNavigate, isSessionActive }) {
    return (
        <div className="layout" style={{
            width: '100%',
            maxWidth: '100%',
            margin: '0',
            padding: '2rem',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            position: 'relative'
        }}>
            {!isSessionActive && (
                <>
                    <Navbar currentView={currentView} onNavigate={onNavigate} />

                    <header style={{
                        textAlign: 'center',
                        paddingBottom: '2rem',
                    }}>
                        <h1 className="title-gold" style={{
                            fontSize: '4.5rem',
                            margin: 0,
                            lineHeight: 1.1
                        }}>
                            مدينة
                        </h1>
                    </header>
                </>
            )}

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {children}
            </main>
        </div>
    );
}
