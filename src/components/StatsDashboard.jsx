import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getVisualForm } from '../utils/arabicForms';
import { getLetter } from '../data/alphabet';
import './StatsDashboard.css';

export default function StatsDashboard({ selectedLetters = [], statsData }) {
    useAuth();

    // Use passed props, fallback to empty array
    const stats = statsData || [];
    const loading = !statsData;
    const [selectedLetterId, setSelectedLetterId] = useState(null);

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Chargement des stats...</div>;

    // Group stats by letter_id
    const groupedStats = stats.reduce((acc, curr) => {
        if (!acc[curr.letter_id]) acc[curr.letter_id] = [];
        acc[curr.letter_id].push(curr);
        return acc;
    }, {});

    const FORMS = ['initial', 'medial', 'final', 'isolated'];
    const MASTERY_THRESHOLD = 0.8;
    const ATTEMPTS_THRESHOLD = 1;

    // Calculate Overall Stats
    const totalAttempts = stats.reduce((sum, s) => sum + s.total_attempts, 0);
    const totalSuccess = stats.reduce((sum, s) => sum + s.success_count, 0);
    const overallRate = totalAttempts > 0 ? Math.round((totalSuccess / totalAttempts) * 100) : 0;

    const weakLetters = Object.entries(groupedStats).filter(([, forms]) => {
        const letterAttempts = forms.reduce((sum, f) => sum + f.total_attempts, 0);
        const letterSuccess = forms.reduce((sum, f) => sum + f.success_count, 0);
        const rate = letterAttempts > 0 ? (letterSuccess / letterAttempts) : 0;
        return letterAttempts >= ATTEMPTS_THRESHOLD && rate < MASTERY_THRESHOLD;
    }).map(([id]) => getLetter(id)?.name).join(', ');

    return (
        <div className="stats-dashboard">
            <h2 className="stats-title">Votre progression</h2>

            {/* Summary Cards Grid */}
            <div className="summary-grid">
                {/* Overall Accuracy Card */}
                <div className="card accuracy-card">
                    <div className="accuracy-label">Précision Globale</div>
                    <div className="accuracy-value">{overallRate}%</div>
                </div>

                {/* Needs Review Card */}
                <div className="review-card">
                    <div className="review-header">
                        <span className="review-icon">⚠️</span> À REVOIR
                    </div>
                    <div className="review-content">
                        {weakLetters ? (
                            <span>Focus sur : <strong>{weakLetters}</strong></span>
                        ) : (
                            "Aucune lettre faible identifiée. Continuez !"
                        )}
                    </div>
                </div>
            </div>

            {/* Detailed Grid Header */}
            <h3 className="stats-subtitle">Statistiques détaillées</h3>

            {/* Detailed Grid */}
            <div className="letters-grid">
                {selectedLetters.map((letterId) => {
                    const forms = groupedStats[letterId] || [];
                    const letter = getLetter(letterId) || { name: letterId, char: '?' };

                    // Calculate Mastery Score (0-4)
                    let masteryScore = 0;
                    FORMS.forEach(formName => {
                        const formStats = forms.find(f => f.form === formName);
                        const fAttempts = formStats ? formStats.total_attempts : 0;
                        const fSuccess = formStats ? formStats.success_count : 0;
                        const fRate = fAttempts > 0 ? (fSuccess / fAttempts) : 0;

                        if (fAttempts >= ATTEMPTS_THRESHOLD && fRate >= MASTERY_THRESHOLD) {
                            masteryScore++;
                        }
                    });

                    // Determine progress bar color based on score
                    let progressColor = '#e5e7eb'; // Default gray
                    if (masteryScore === 4) progressColor = 'var(--color-green-success)';
                    else if (masteryScore >= 2) progressColor = '#f59e0b'; // Amber
                    else if (masteryScore > 0) progressColor = '#ef4444'; // Red

                    const totalAttempts = forms.reduce((sum, f) => sum + f.total_attempts, 0);

                    return (
                        <div
                            key={letterId}
                            className="card letter-stats-card"
                            onClick={() => setSelectedLetterId(letterId)}
                            style={{ opacity: totalAttempts === 0 ? 0.8 : 1 }}
                        >
                            <div className="letter-char">{letter.char}</div>
                            <div className="letter-name">{letter.name}</div>

                            {/* Progress Bar */}
                            <div className="progress-track">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${(masteryScore / 4) * 100}%`, backgroundColor: progressColor }}
                                />
                            </div>

                            <div className="score-text">
                                {totalAttempts === 0 ? '-' : `${masteryScore} / 4`}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detailed Modal */}
            {/* Detailed Modal */}
            {selectedLetterId && (() => {
                const forms = groupedStats[selectedLetterId] || []; // Fallback to empty
                const letter = getLetter(selectedLetterId);

                // French Labels Mapping
                const FORM_LABELS = {
                    initial: 'Début',
                    medial: 'Milieu',
                    final: 'Fin',
                    isolated: 'Isolée'
                };

                // Logic to aggregate stats for identical forms
                const NON_CONNECTORS = ['alif', 'dal', 'dhal', 'ra', 'zay', 'waw'];
                const isNonConnector = NON_CONNECTORS.includes(selectedLetterId);

                return (
                    <div className="modal-overlay" onClick={() => setSelectedLetterId(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <h3 className="modal-title">{letter.name} Formes</h3>
                            <div className="forms-grid">
                                {FORMS.map(formName => {
                                    // Calculate Stats (Aggregated if necessary)
                                    let attempts = 0;
                                    let success = 0;

                                    let formsToAggregate = [formName];
                                    if (isNonConnector) {
                                        if (formName === 'initial' || formName === 'isolated') {
                                            formsToAggregate = ['initial', 'isolated'];
                                        } else if (formName === 'medial' || formName === 'final') {
                                            formsToAggregate = ['medial', 'final'];
                                        }
                                    }

                                    formsToAggregate.forEach(fName => {
                                        const fStats = forms.find(f => f.form === fName);
                                        if (fStats) {
                                            attempts += fStats.total_attempts;
                                            success += fStats.success_count;
                                        }
                                    });

                                    const rate = attempts > 0 ? Math.round((success / attempts) * 100) : 0;
                                    const isMastered = attempts >= ATTEMPTS_THRESHOLD && rate >= (MASTERY_THRESHOLD * 100);

                                    return (
                                        <div key={formName} className="form-stat-item">
                                            <div className="form-char">
                                                {getVisualForm(letter.char, formName)}
                                            </div>
                                            <div className="form-name">
                                                {FORM_LABELS[formName]}
                                            </div>
                                            <div style={{ color: isMastered ? 'var(--color-green-success)' : 'var(--color-brown-text)', fontWeight: 'bold' }}>
                                                {rate}%
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={() => setSelectedLetterId(null)} className="btn-secondary modal-close-btn">
                                Fermer
                            </button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
