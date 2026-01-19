import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from './db.js';

const app = express();
const PORT = 3000;
const SECRET_KEY = 'medina-secret-key-change-this-later'; // Simplify for now

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
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

    try {
        const db = await getDb();
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.run(
            'INSERT INTO users (username, password_hash) VALUES (?, ?)',
            [username, hashedPassword]
        );

        const token = jwt.sign({ id: result.lastID, username }, SECRET_KEY);
        res.json({ token, user: { id: result.lastID, username } });
    } catch (e) {
        if (e.message.includes('UNIQUE constraint failed')) {
            res.status(409).json({ error: 'Username already exists' });
        } else {
            res.status(500).json({ error: e.message });
        }
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const db = await getDb();
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
        res.json({ token, user: { id: user.id, username: user.username } });
    } catch (e) {
        res.status(500).json({ error: e.message });
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

app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
