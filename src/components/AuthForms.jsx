import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthForms() {
    const [isLogin, setIsLogin] = useState(true);
    const { login, register } = useAuth();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const action = isLogin ? login : register;
        const result = await action(formData.username, formData.password);

        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-sand-100)',
            fontFamily: 'var(--font-ui)'
        }}>
            <div style={{
                background: 'white',
                padding: '3rem',
                borderRadius: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h2 style={{
                    textAlign: 'center',
                    marginBottom: '2rem',
                    color: 'var(--color-brown-text)',
                    fontFamily: 'var(--font-arabic)',
                    fontSize: '2.5rem'
                }}>
                    {isLogin ? 'De retour !' : 'Rejoindre Medina'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nom d'utilisateur</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '2px solid var(--color-gold-200)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            placeholder="Entrez votre nom d'utilisateur"
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Mot de passe</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '2px solid var(--color-gold-200)',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '1rem',
                            background: '#FEE2E2',
                            color: '#DC2626',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" style={{
                        width: '100%',
                        marginBottom: '1rem',
                    }}>
                        {isLogin ? 'Se connecter' : 'Créer un compte'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-gold-main)',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        {isLogin ? "S'inscrire" : 'Se connecter'}
                    </button>
                </div>
            </div>
        </div>
    );
}
