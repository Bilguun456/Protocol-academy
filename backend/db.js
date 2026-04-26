import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(join(__dirname, 'data.db'));

// WAL mode + foreign keys
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    username     TEXT    UNIQUE NOT NULL,
    email        TEXT    UNIQUE NOT NULL,
    password_hash TEXT   NOT NULL,
    avatar       TEXT    NOT NULL DEFAULT 'U',
    avatar_bg    TEXT    NOT NULL DEFAULT '',
    coins        INTEGER NOT NULL DEFAULT 500,
    rank         TEXT    NOT NULL DEFAULT 'Newbie',
    diagnostic   INTEGER NOT NULL DEFAULT 1000,
    join_date    TEXT    NOT NULL DEFAULT (date('now')),
    country      TEXT    NOT NULL DEFAULT 'US',
    stars        INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS problems (
    id         TEXT    PRIMARY KEY,
    name       TEXT    NOT NULL,
    difficulty TEXT    NOT NULL,
    topic_id   TEXT    NOT NULL,
    topic      TEXT    NOT NULL,
    statement  TEXT    NOT NULL DEFAULT '',
    points     INTEGER NOT NULL DEFAULT 100
  );

  CREATE TABLE IF NOT EXISTS user_problem_status (
    user_id    INTEGER NOT NULL,
    problem_id TEXT    NOT NULL,
    status     TEXT    NOT NULL DEFAULT 'untouched',
    solved_at  TEXT,
    PRIMARY KEY (user_id, problem_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bookmarks (
    user_id    INTEGER NOT NULL,
    problem_id TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, problem_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS problem_upvotes (
    user_id    INTEGER NOT NULL,
    problem_id TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, problem_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS community_problems (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id  INTEGER NOT NULL,
    name       TEXT    NOT NULL,
    statement  TEXT    NOT NULL DEFAULT '',
    topic_id   TEXT    NOT NULL DEFAULT '',
    difficulty TEXT    NOT NULL DEFAULT 'medium',
    status     TEXT    NOT NULL DEFAULT 'draft',
    saved_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS comments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id TEXT    NOT NULL,
    user_id    INTEGER NOT NULL,
    text       TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS daily_completions (
    user_id      INTEGER NOT NULL,
    task_id      TEXT    NOT NULL,
    date         TEXT    NOT NULL,
    completed_at TEXT    NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, task_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS news (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    tag         TEXT NOT NULL DEFAULT 'Announcement',
    type        TEXT NOT NULL DEFAULT 'announcement',
    date        TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_read_news (
    user_id INTEGER NOT NULL,
    news_id TEXT    NOT NULL,
    PRIMARY KEY (user_id, news_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS shop_items (
    id          TEXT    PRIMARY KEY,
    name        TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    category    TEXT    NOT NULL DEFAULT 'avatar',
    section     TEXT    NOT NULL,
    price       INTEGER NOT NULL,
    sale_price  INTEGER,
    preview     TEXT    NOT NULL DEFAULT '⬡'
  );

  CREATE TABLE IF NOT EXISTS user_purchases (
    user_id      INTEGER NOT NULL,
    item_id      TEXT    NOT NULL,
    purchased_at TEXT    NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

export default db;
