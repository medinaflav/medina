import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

(async () => {
    console.log('Opening database...');
    try {
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        console.log('Attempting migrations...');

        // 1. Add Columns (ignore if exists)
        const columns = [
            { name: 'email', def: 'TEXT' }, // No UNIQUE here
            { name: 'google_id', def: 'TEXT' }, // No UNIQUE here
            { name: 'is_verified', def: 'BOOLEAN DEFAULT 1' },
            { name: 'verification_token', def: 'TEXT' },
            { name: 'token_expires', def: 'DATETIME' }
        ];

        for (const col of columns) {
            try {
                await db.exec(`ALTER TABLE users ADD COLUMN ${col.name} ${col.def}`);
                console.log(`✓ Added column: ${col.name}`);
            } catch (e) {
                if (e.message.includes('duplicate column name')) {
                    console.log(`• Column ${col.name} already exists.`);
                } else {
                    console.error(`✗ Failed to add ${col.name}:`, e.message);
                }
            }
        }

        // 2. Add Indexes for Uniqueness
        try {
            await db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)');
            console.log("✓ Created Index: idx_users_email");
        } catch (e) { console.error("Index email error:", e.message); }

        try {
            await db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)');
            console.log("✓ Created Index: idx_users_google_id");
        } catch (e) { console.error("Index google_id error:", e.message); }

        console.log('Migration complete.');
    } catch (err) {
        console.error('Fatal error:', err);
    }
})();
