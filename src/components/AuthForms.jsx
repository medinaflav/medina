import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthForms() {
    const [view, setView] = useState('login'); // login | register | verify
    const { login, register, verifyEmail, loginWithGoogle } = useAuth();

    // Form States
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [verificationCode, setVerificationCode] = useState('');
    const [pendingEmail, setPendingEmail] = useState(''); // Store email for verification step

    // UI States
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Validation Feedback
    const [passwordFeedback, setPasswordFeedback] = useState([]);

    // Validation Rules
    const validatePassword = (pwd) => {
        const feedback = [];
        if (pwd.length < 8) feedback.push("8 caractères minimum");
        if (!/\d/.test(pwd)) feedback.push("Au moins un chiffre");
        if (!/[@$!%*#?&]/.test(pwd)) feedback.push("Au moins un caractère spécial");
        setPasswordFeedback(feedback);
        // Return true if strict rules met
        return pwd.length >= 8 && /\d/.test(pwd) && /[@$!%*#?&]/.test(pwd);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);

        // Frontend Check before sending
        if (formData.email !== formData.confirmEmail) {
            setError("Les emails ne correspondent pas.");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        if (!validatePassword(formData.password)) {
            setError("Le mot de passe ne respecte pas les critères de sécurité.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await register(formData.username, formData.email, formData.password);
            if (result.success) {
                setPendingEmail(result.email);
                setView('verify');
            } else {
                setError(result.error);
            }
        } catch (e) {
            setError('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            // formData.username handles both username and email input for login
            const result = await login(formData.username, formData.password);
            if (!result.success) {
                if (result.email) { // Special case: unverified
                    setPendingEmail(result.email);
                    setError(result.error);
                    // Could auto-redirect to verify, but error message with button is cleaner
                } else {
                    setError(result.error);
                }
            }
        } catch (e) {
            setError('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const result = await verifyEmail(pendingEmail, verificationCode);
            if (!result.success) {
                setError(result.error);
            }
        } catch (e) {
            setError('Code invalide');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError(null);
        setIsLoading(true);
        const result = await loginWithGoogle(credentialResponse.credential);
        if (!result.success) {
            setError(result.error || 'Échec de la connexion Google');
        }
        setIsLoading(false);
    };

    const switchView = (newView) => {
        setError(null);
        setView(newView);
        // Reset sensitive fields, keep username if switching? nah clear all is safer/cleaner
        setFormData({ username: '', email: '', password: '' });
        setPasswordFeedback([]);
    };

    return (
        <div className="auth-container">
            <div className="auth-card fade-in">
                <div className="auth-header">
                    <h1 className="auth-title">مدينة</h1>
                    <p className="auth-subtitle">
                        {view === 'login' && 'Heureux de vous revoir'}
                        {view === 'register' && 'Créez votre compte'}
                        {view === 'verify' && 'Vérifiez votre email'}
                    </p>
                </div>

                {/* Google Auth only for Login/Register */}
                {view !== 'verify' && (
                    <div className="google-btn-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('La connexion Google a échoué')}
                            theme="filled_black"
                            shape="pill"
                            text={view === 'login' ? "signin_with" : "signup_with"}
                            width="300"
                            locale="fr"
                        />
                    </div>
                )}

                {view !== 'verify' && (
                    <div className="auth-divider">
                        <span>ou avec utilisateur</span>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                        {error === 'Compte non vérifié' && (
                            <button
                                onClick={() => setView('verify')}
                                style={{ marginLeft: '10px', textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Valider
                            </button>
                        )}
                    </div>
                )}

                {/* LOGIN FORM */}
                {view === 'login' && (
                    <form onSubmit={handleLogin}>
                        <div className="auth-form-group">
                            <label className="auth-label">Adresse email</label>
                            <input
                                className="auth-input"
                                type="text"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                placeholder="البريد الإلكتروني"
                                required
                            />
                        </div>
                        <div className="auth-form-group">
                            <label className="auth-label">Mot de passe</label>
                            <input
                                className="auth-input"
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="كلمة المرور"
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                            {isLoading ? 'Chargement...' : 'Se connecter'}
                        </button>
                    </form>
                )}

                {/* REGISTER FORM */}
                {view === 'register' && (
                    <form onSubmit={handleRegister}>
                        <div className="auth-form-group">
                            <label className="auth-label">Nom d'utilisateur</label>
                            <input
                                className="auth-input"
                                type="text"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                placeholder="اسم المستخدم"
                                required
                            />
                        </div>

                        <div className="auth-form-group">
                            <label className="auth-label">Adresse email</label>
                            <input
                                className="auth-input"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="البريد الإلكتروني"
                                required
                            />
                        </div>
                        <div className="auth-form-group">
                            <label className="auth-label">Confirmez votre adresse email</label>
                            <input
                                className="auth-input"
                                type="email"
                                value={formData.confirmEmail || ''}
                                onChange={e => setFormData({ ...formData, confirmEmail: e.target.value })}
                                placeholder="تأكيد البريد الإلكتروني"
                                required
                            />
                        </div>

                        <div className="auth-form-group">
                            <label className="auth-label">Mot de passe</label>
                            <input
                                className="auth-input"
                                type="password"
                                value={formData.password}
                                onChange={e => {
                                    setFormData({ ...formData, password: e.target.value });
                                    validatePassword(e.target.value);
                                }}
                                placeholder="كلمة المرور"
                                required
                            />
                        </div>
                        <div className="auth-form-group">
                            <label className="auth-label">Confirmez votre mot de passe</label>
                            <input
                                className="auth-input"
                                type="password"
                                value={formData.confirmPassword || ''}
                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="تأكيد كلمة المرور"
                                required
                            />
                        </div>

                        {/* Password Feedback */}
                        {formData.password && (
                            <ul style={{ fontSize: '0.8rem', marginBottom: '1rem', listStyle: 'none', padding: 0, color: 'var(--color-sand-500)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <li style={{ color: formData.password.length >= 8 ? 'var(--color-green-success)' : 'inherit' }}>
                                    {formData.password.length >= 8 ? '✓' : '•'} 8 chars
                                </li>
                                <li style={{ color: /\d/.test(formData.password) ? 'var(--color-green-success)' : 'inherit' }}>
                                    {/\d/.test(formData.password) ? '✓' : '•'} Chiffre
                                </li>
                                <li style={{ color: /[@$!%*#?&]/.test(formData.password) ? 'var(--color-green-success)' : 'inherit' }}>
                                    {/[@$!%*#?&]/.test(formData.password) ? '✓' : '•'} Spécial
                                </li>
                            </ul>
                        )}

                        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                            {isLoading ? 'Inscription...' : 'Créer un compte'}
                        </button>
                    </form>
                )}

                {/* VERIFY FORM */}
                {view === 'verify' && (
                    <form onSubmit={handleVerify}>
                        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--color-brown-text)' }}>
                            Un code a été envoyé à <strong>{pendingEmail}</strong>.<br />
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-sand-500)' }}>(Regardez la console du serveur pour le code en dev)</span>
                        </p>
                        <div className="auth-form-group">
                            <label className="auth-label">Code de vérification</label>
                            <input
                                className="auth-input"
                                type="text"
                                value={verificationCode}
                                onChange={e => setVerificationCode(e.target.value)}
                                placeholder="١٢٣٤٥٦"
                                maxLength={6}
                                style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.5rem' }}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                            {isLoading ? 'Vérification...' : 'Valider'}
                        </button>
                        <button
                            type="button"
                            className="auth-switch-btn"
                            style={{ width: '100%', marginTop: '1rem' }}
                            onClick={() => switchView('login')}
                        >
                            Retour à la connexion
                        </button>
                    </form>
                )}

                {/* FOOTER SWITCH */}
                {view !== 'verify' && (
                    <div className="auth-footer">
                        {view === 'login' ? "Pas encore membre ? " : "Déjà membre ? "}
                        <button
                            className="auth-switch-btn"
                            onClick={() => switchView(view === 'login' ? 'register' : 'login')}
                        >
                            {view === 'login' ? "S'inscrire" : 'Se connecter'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
