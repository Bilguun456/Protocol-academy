import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    username      TEXT    UNIQUE NOT NULL,
    email         TEXT    UNIQUE NOT NULL,
    password_hash TEXT    NOT NULL,
    avatar        TEXT    NOT NULL DEFAULT 'U',
    avatar_bg     TEXT    NOT NULL DEFAULT '',
    coins         INTEGER NOT NULL DEFAULT 500,
    rank          TEXT    NOT NULL DEFAULT 'Newbie',
    diagnostic    INTEGER NOT NULL DEFAULT 1000,
    join_date     TEXT    NOT NULL DEFAULT '',
    country       TEXT    NOT NULL DEFAULT 'US',
    stars         INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS problems (
    id         TEXT    PRIMARY KEY,
    name       TEXT    NOT NULL,
    difficulty TEXT    NOT NULL,
    topic_id   TEXT    NOT NULL,
    topic      TEXT    NOT NULL,
    statement  TEXT    NOT NULL DEFAULT '',
    points     INTEGER NOT NULL DEFAULT 100
  )`,
  `CREATE TABLE IF NOT EXISTS user_problem_status (
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id TEXT    NOT NULL,
    status     TEXT    NOT NULL DEFAULT 'untouched',
    solved_at  TEXT,
    PRIMARY KEY (user_id, problem_id)
  )`,
  `CREATE TABLE IF NOT EXISTS bookmarks (
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id TEXT    NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, problem_id)
  )`,
  `CREATE TABLE IF NOT EXISTS problem_upvotes (
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id TEXT    NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, problem_id)
  )`,
  `CREATE TABLE IF NOT EXISTS community_problems (
    id         SERIAL PRIMARY KEY,
    author_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       TEXT    NOT NULL,
    statement  TEXT    NOT NULL DEFAULT '',
    topic_id   TEXT    NOT NULL DEFAULT '',
    difficulty TEXT    NOT NULL DEFAULT 'medium',
    status     TEXT    NOT NULL DEFAULT 'draft',
    saved_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS comments (
    id         SERIAL PRIMARY KEY,
    problem_id TEXT    NOT NULL,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text       TEXT    NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS daily_completions (
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id      TEXT    NOT NULL,
    date         TEXT    NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, task_id, date)
  )`,
  `CREATE TABLE IF NOT EXISTS news (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    tag         TEXT NOT NULL DEFAULT 'Announcement',
    type        TEXT NOT NULL DEFAULT 'announcement',
    date        TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS user_read_news (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    news_id TEXT    NOT NULL,
    PRIMARY KEY (user_id, news_id)
  )`,
  `CREATE TABLE IF NOT EXISTS shop_items (
    id          TEXT    PRIMARY KEY,
    name        TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    category    TEXT    NOT NULL DEFAULT 'avatar',
    section     TEXT    NOT NULL,
    price       INTEGER NOT NULL,
    sale_price  INTEGER,
    preview     TEXT    NOT NULL DEFAULT '⬡'
  )`,
  `CREATE TABLE IF NOT EXISTS user_purchases (
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id      TEXT    NOT NULL,
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, item_id)
  )`,
];

for (const sql of SCHEMA) {
  await pool.query(sql);
}

export default pool;
