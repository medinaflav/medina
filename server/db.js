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
        password_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

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
