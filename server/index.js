import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from './db.js';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const app = express();
const PORT = 3000;
const SECRET_KEY = 'medina-secret-key-change-this-later'; // Simplify for now
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

// Email Transporter (Dev: Ethereal)
let transporter;
const initEmail = async () => {
    if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        console.log("Email Service Ready (Real SMTP)");
    } else {
        // Fallback to Ethereal for dev if no env vars
        try {
            let testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log("Email Service Ready (Ethereal - Dev Mode)");
        } catch (e) {
            console.error("Failed to init Ethereal:", e);
        }
    }
};
initEmail();

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.post('/api/auth/register', async (req, res) => {
    const { username, password, email } = req.body;

    // Strict Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    if (!username || !password || !email) return res.status(400).json({ error: 'Tous les champs sont requis' });
    if (!emailRegex.test(email)) return res.status(400).json({ error: 'Format email invalide' });
    if (!passwordRegex.test(password)) return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères, un chiffre et un caractère spécial.' });

    try {
        const db = await getDb();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate Token
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const tokenExpires = new Date(Date.now() + 3600000); // 1hr

        const result = await db.run(
            'INSERT INTO users (username, password_hash, email, verification_token, token_expires, is_verified) VALUES (?, ?, ?, ?, ?, 0)',
            [username, hashedPassword, email, verificationToken, tokenExpires.toISOString()]
        );

        // Send Email
        const info = await transporter.sendMail({
            from: '"Medina App" <no-reply@medina.app>',
            to: email,
            subject: "Vérifiez votre compte Medina",
            text: `Votre code de vérification est : ${verificationToken}`,
            html: `<b>Votre code de vérification est : ${verificationToken}</b>`,
        });

        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        res.json({ success: true, email, message: 'Code envoyé' });
    } catch (e) {
        if (e.message.includes('UNIQUE constraint failed')) {
            if (e.message.includes('email')) res.status(409).json({ error: 'Cet email existe déjà' });
            else res.status(409).json({ error: 'Ce nom d\'utilisateur existe déjà' });
        } else {
            res.status(500).json({ error: e.message });
        }
    }
});

app.post('/api/auth/verify', async (req, res) => {
    const { email, code } = req.body;
    try {
        const db = await getDb();
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) return res.status(400).json({ error: 'Utilisateur introuvable' });
        if (user.is_verified) return res.status(200).json({ success: true }); // Already verified

        if (user.verification_token !== code) return res.status(400).json({ error: 'Code invalide' });
        if (new Date(user.token_expires) < new Date()) return res.status(400).json({ error: 'Code expiré' });

        await db.run('UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?', [user.id]);

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body; // username can be email

    try {
        const db = await getDb();
        // Allow login by email or username
        const user = await db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        if (!user.is_verified && !user.google_id) {
            return res.status(403).json({ error: 'Compte non vérifié', email: user.email });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        const db = await getDb();
        let user = await db.get('SELECT * FROM users WHERE google_id = ? OR email = ?', [googleId, email]);

        if (!user) {
            // Create new user
            let username = name;
            // Ensure unique username (simple logic)
            const existingName = await db.get('SELECT id FROM users WHERE username = ?', [username]);
            if (existingName) {
                username = `${name}_${Date.now().toString().slice(-4)}`;
            }

            const result = await db.run(
                'INSERT INTO users (username, email, google_id, is_verified) VALUES (?, ?, ?, 1)',
                [username, email, googleId]
            );
            user = { id: result.lastID, username };
        } else {
            // Link google_id if matched by email but no google_id yet
            if (!user.google_id) {
                await db.run('UPDATE users SET google_id = ? WHERE id = ?', [googleId, user.id]);
            }
        }

        const jwtToken = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
        res.json({ token: jwtToken, user: { id: user.id, username: user.username, email: user.email } });

    } catch (e) {
        console.error('Google Auth Error:', e);
        res.status(401).json({ error: 'Google authentication failed' });
    }
});

app.get('/api/settings', authenticateToken, async (req, res) => {
    try {
        const db = await getDb();
        const settings = await db.get('SELECT selected_letters FROM user_settings WHERE user_id = ?', [req.user.id]);
        res.json({ selectedLetters: settings ? JSON.parse(settings.selected_letters) : [] });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/settings', authenticateToken, async (req, res) => {
    const { selectedLetters } = req.body;
    try {
        const db = await getDb();
        await db.run(
            `INSERT INTO user_settings (user_id, selected_letters) 
       VALUES (?, ?) 
       ON CONFLICT(user_id) DO UPDATE SET selected_letters = excluded.selected_letters`,
            [req.user.id, JSON.stringify(selectedLetters)]
        );
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const db = await getDb();
        const user = await db.get('SELECT id, username, email, is_verified, google_id FROM users WHERE id = ?', [req.user.id]);
        if (!user) return res.sendStatus(404);
        res.json({ user });
    } catch (e) {
        res.sendStatus(500);
    }
});

app.post('/api/progress/sync', authenticateToken, async (req, res) => {
    // Expects body: { updates: [{ letterId, form, successDelta, attemptsDelta }, ...] }
    // Note: Frontend sends 'updates', backend previously expected 'deltas'. aligning to 'updates'
    const { updates } = req.body;
    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({ error: 'Invalid updates format' });
    }

    try {
        const db = await getDb();
        await db.run('BEGIN TRANSACTION');

        const stmt = await db.prepare(`
            INSERT INTO letter_progress (user_id, letter_id, form, success_count, total_attempts)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id, letter_id, form) DO UPDATE SET
                success_count = success_count + excluded.success_count,
                total_attempts = total_attempts + excluded.total_attempts,
                last_updated = CURRENT_TIMESTAMP
        `);

        for (const item of updates) {
            const { letterId, form, successDelta, attemptsDelta } = item;
            // Ensure we don't insert 0 deltas effectively (though client should filter)
            if (attemptsDelta > 0) {
                await stmt.run(req.user.id, letterId, form, successDelta, attemptsDelta);
            }
        }

        await stmt.finalize();
        await db.run('COMMIT');
        res.json({ success: true });
    } catch (e) {
        const db = await getDb();
        await db.run('ROLLBACK');
        console.error('Increment progress error:', e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const db = await getDb();
        const stats = await db.all('SELECT letter_id, form, success_count, total_attempts FROM letter_progress WHERE user_id = ?', [req.user.id]);
        res.json({ stats });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
    }
});

// Serve Static Files (Frontend) in Production
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Go up one level from 'server' to root to find 'dist'
const distPath = path.join(__dirname, '../dist');

app.use(express.static(distPath));

// Catch-all handler for any request that doesn't match an API route
// Sends index.html so React Router handles the routing
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
