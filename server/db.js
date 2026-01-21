import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Initialize DB
let db;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        google_id TEXT UNIQUE,
        password_hash TEXT,
        is_verified BOOLEAN DEFAULT 0,
        verification_token TEXT,
        token_expires DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Simple migration
    // Robust migration - Try each column individually
    try { await db.exec('ALTER TABLE users ADD COLUMN email TEXT UNIQUE'); } catch (e) { }
    try { await db.exec('ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE'); } catch (e) { }
    try { await db.exec('ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 1'); } catch (e) { }
    try { await db.exec('ALTER TABLE users ADD COLUMN verification_token TEXT'); } catch (e) { }
    try { await db.exec('ALTER TABLE users ADD COLUMN token_expires DATETIME'); } catch (e) { }

    await db.exec(`

      CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        word_id TEXT,
        is_correct BOOLEAN,
        attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        user_id INTEGER PRIMARY KEY,
        selected_letters TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS letter_progress (
        user_id INTEGER,
        letter_id TEXT,
        form TEXT, -- 'initial', 'medial', 'final', 'isolated'
        success_count INTEGER DEFAULT 0,
        total_attempts INTEGER DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, letter_id, form),
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `);
  }
  return db;
}
