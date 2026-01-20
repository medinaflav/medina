import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getVisualForm } from '../utils/arabicForms';
import { getLetter } from '../data/alphabet';


export default function StatsDashboard({ selectedLetters = [] }) {
    const { user } = useAuth();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLetterId, setSelectedLetterId] = useState(null);

    useEffect(() => {
        if (user) {
            const token = localStorage.getItem('token');
            fetch('/api/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    setStats(data.stats || []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch stats:', err);
                    setLoading(false);
                });
        }
    }, [user]);

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Chargement des stats...</div>;

    // Group stats by letter_id
    const groupedStats = stats.reduce((acc, curr) => {
        if (!acc[curr.letter_id]) acc[curr.letter_id] = [];
        acc[curr.letter_id].push(curr);
        return acc;
    }, {});

    const FORMS = ['initial', 'medial', 'final', 'isolated'];
    const MASTERY_THRESHOLD = 0.8;
    const ATTEMPTS_THRESHOLD = 1; // Changed to 1 so 100% instantly counts

    // Calculate Overall Stats
    const totalAttempts = stats.reduce((sum, s) => sum + s.total_attempts, 0);
    const totalSuccess = stats.reduce((sum, s) => sum + s.success_count, 0);
    const overallRate = totalAttempts > 0 ? Math.round((totalSuccess / totalAttempts) * 100) : 0;

    const weakLetters = Object.entries(groupedStats).filter(([_, forms]) => {
        const letterAttempts = forms.reduce((sum, f) => sum + f.total_attempts, 0);
        const letterSuccess = forms.reduce((sum, f) => sum + f.success_count, 0);
        const rate = letterAttempts > 0 ? (letterSuccess / letterAttempts) : 0;
        return letterAttempts >= ATTEMPTS_THRESHOLD && rate < MASTERY_THRESHOLD;
    }).map(([id]) => getLetter(id)?.name).join(', ');

    return (
        <div className="stats-dashboard">
            <h2 style={{
                fontFamily: 'var(--font-ui)',
                color: 'var(--color-brown-text)', // Brown Title
                fontSize: '1.8rem',
                marginBottom: '1.5rem',
                fontWeight: '800'
            }}>
                Votre progression
            </h2>

            {/* Summary Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                {/* Overall Accuracy Card */}
                <div className="card" style={{
                    padding: '2rem',
                    textAlign: 'center',
                    border: 'none',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <div style={{ color: '#6b7280', marginBottom: '0.5rem', fontWeight: '500' }}>Précision Globale</div>
                    <div style={{
                        fontSize: '4rem',
                        fontWeight: '800',
                        color: 'var(--color-green-success)',
                        lineHeight: 1
                    }}>
                        {overallRate}%
                    </div>
                </div>

                {/* Needs Review Card */}
                <div style={{
                    backgroundColor: 'var(--bg-danger-light)', // Pinkish background
                    borderRadius: '16px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    justifyContent: 'center',
                    border: '1px solid var(--color-red-500)' // Adding border to make it distinct as a "frame"
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--color-red-500)', // Standard Red
                        fontWeight: '800',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>⚠️</span> À REVOIR
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.5' }}>
                        {weakLetters ? (
                            <span>Focus sur : <strong>{weakLetters}</strong></span>
                        ) : (
                            "Aucune lettre faible identifiée. Continuez !"
                        )}
                    </div>
                </div>
            </div>

            {/* Detailed Grid Header */}
            <h3 style={{
                color: 'var(--color-brown-text)',
                fontSize: '1.1rem',
                marginBottom: '1rem',
                fontWeight: '700'
            }}>
                Statistiques détaillées
            </h3>

            {/* Detailed Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1rem'
            }}>
                {selectedLetters.map((letterId) => {
                    const forms = groupedStats[letterId] || [];
                    const letter = getLetter(letterId) || { name: letterId, char: '?' };

                    const lAttempts = forms.reduce((sum, f) => sum + f.total_attempts, 0);
                    const lSuccess = forms.reduce((sum, f) => sum + f.success_count, 0);
                    const lRate = lAttempts > 0 ? Math.round((lSuccess / lAttempts) * 100) : 0;

                    return (
                        <div
                            key={letterId}
                            className="card"
                            onClick={() => setSelectedLetterId(letterId)}
                            style={{
                                padding: '1.5rem',
                                border: 'none',
                                textAlign: 'center',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                transition: 'all 0.2s',
                                opacity: lAttempts === 0 ? 0.8 : 1
                            }}
                        >
                            <div style={{
                                fontFamily: 'var(--font-arabic)',
                                fontSize: '2rem',
                                color: 'var(--color-brown-text)'
                            }}>
                                {letter.char}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: '500' }}>
                                {letter.name}
                            </div>

                            {/* Green Progress Line */}
                            <div style={{
                                height: '4px',
                                width: '40px',
                                backgroundColor: lAttempts === 0 ? '#e5e7eb' : (lRate >= 80 ? 'var(--color-green-success)' : (lRate >= 50 ? '#f59e0b' : '#ef4444')),
                                margin: '0.5rem auto',
                                borderRadius: '2px'
                            }} />

                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                {lAttempts === 0 ? 'Pas encore commencé' : `${lRate}% (${lSuccess}/${lAttempts})`}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detailed Modal (Preserving Functionality) */}
            {selectedLetterId && (() => {
                const forms = groupedStats[selectedLetterId];
                const letter = getLetter(selectedLetterId);
                return (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000
                    }} onClick={() => setSelectedLetterId(null)}>
                        <div style={{
                            backgroundColor: 'var(--bg-card)',
                            padding: '2rem',
                            borderRadius: '24px',
                            width: '90%',
                            maxWidth: '400px'
                        }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--color-brown-text)' }}>
                                {letter.name} Formes
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {FORMS.map(formName => {
                                    const formStats = forms.find(f => f.form === formName);
                                    const attempts = formStats ? formStats.total_attempts : 0;
                                    const success = formStats ? formStats.success_count : 0;
                                    const rate = attempts > 0 ? Math.round((success / attempts) * 100) : 0;
                                    const isMastered = attempts >= ATTEMPTS_THRESHOLD && rate >= (MASTERY_THRESHOLD * 100);

                                    return (
                                        <div key={formName} style={{
                                            padding: '0.8rem',
                                            backgroundColor: 'var(--color-sand-50)',
                                            borderRadius: '12px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontFamily: 'var(--font-arabic)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                                {getVisualForm(letter.char, formName)}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'capitalize' }}>
                                                {formName}
                                            </div>
                                            <div style={{ color: isMastered ? 'var(--color-green-success)' : 'var(--color-brown-text)', fontWeight: 'bold' }}>
                                                {rate}% <span style={{ fontSize: '0.8em', fontWeight: 'normal', opacity: 0.7 }}>({success}/{attempts})</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={() => setSelectedLetterId(null)} className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem' }}>
                                Fermer
                            </button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
