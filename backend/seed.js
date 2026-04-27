import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool from './db.js';

const PROBLEMS = [
  { id: 'p1',  name: 'Weird Algorithm',               difficulty: 'easy',   topic_id: 'intro',   topic: 'Introductory Problems',  points: 100 },
  { id: 'p2',  name: 'Missing Number',                difficulty: 'easy',   topic_id: 'intro',   topic: 'Introductory Problems',  points: 100 },
  { id: 'p3',  name: 'Repetitions',                   difficulty: 'easy',   topic_id: 'intro',   topic: 'Introductory Problems',  points: 100 },
  { id: 'p4',  name: 'Increasing Array',              difficulty: 'easy',   topic_id: 'intro',   topic: 'Introductory Problems',  points: 100 },
  { id: 'p5',  name: 'Permutations',                  difficulty: 'easy',   topic_id: 'intro',   topic: 'Introductory Problems',  points: 100 },
  { id: 'p6',  name: 'Number Spiral',                 difficulty: 'medium', topic_id: 'intro',   topic: 'Introductory Problems',  points: 200 },
  { id: 'p7',  name: 'Two Knights',                   difficulty: 'medium', topic_id: 'intro',   topic: 'Introductory Problems',  points: 200 },
  { id: 'p8',  name: 'Two Sets',                      difficulty: 'medium', topic_id: 'intro',   topic: 'Introductory Problems',  points: 200 },
  { id: 'p9',  name: 'Bit Strings',                   difficulty: 'medium', topic_id: 'intro',   topic: 'Introductory Problems',  points: 200 },
  { id: 'p10', name: 'Trailing Zeros',                difficulty: 'hard',   topic_id: 'intro',   topic: 'Introductory Problems',  points: 300 },
  { id: 'p11', name: 'Distinct Numbers',              difficulty: 'easy',   topic_id: 'sorting', topic: 'Sorting & Searching',    points: 100 },
  { id: 'p12', name: 'Apartments',                    difficulty: 'easy',   topic_id: 'sorting', topic: 'Sorting & Searching',    points: 100 },
  { id: 'p13', name: 'Ferris Wheel',                  difficulty: 'easy',   topic_id: 'sorting', topic: 'Sorting & Searching',    points: 100 },
  { id: 'p14', name: 'Concert Tickets',               difficulty: 'medium', topic_id: 'sorting', topic: 'Sorting & Searching',    points: 200 },
  { id: 'p15', name: 'Restaurant Customers',          difficulty: 'medium', topic_id: 'sorting', topic: 'Sorting & Searching',    points: 200 },
  { id: 'p16', name: 'Movie Festival',                difficulty: 'medium', topic_id: 'sorting', topic: 'Sorting & Searching',    points: 200 },
  { id: 'p17', name: 'Sum of Two Values',             difficulty: 'medium', topic_id: 'sorting', topic: 'Sorting & Searching',    points: 200 },
  { id: 'p18', name: 'Maximum Subarray Sum',          difficulty: 'hard',   topic_id: 'sorting', topic: 'Sorting & Searching',    points: 300 },
  { id: 'p19', name: 'Stick Lengths',                 difficulty: 'hard',   topic_id: 'sorting', topic: 'Sorting & Searching',    points: 300 },
  { id: 'p20', name: 'Subarray Sums II',              difficulty: 'hard',   topic_id: 'sorting', topic: 'Sorting & Searching',    points: 300 },
  { id: 'p21', name: 'Dice Combinations',             difficulty: 'easy',   topic_id: 'dp',      topic: 'Dynamic Programming',   points: 100 },
  { id: 'p22', name: 'Minimizing Coins',              difficulty: 'easy',   topic_id: 'dp',      topic: 'Dynamic Programming',   points: 100 },
  { id: 'p23', name: 'Coin Combinations I',           difficulty: 'medium', topic_id: 'dp',      topic: 'Dynamic Programming',   points: 200 },
  { id: 'p24', name: 'Coin Combinations II',          difficulty: 'medium', topic_id: 'dp',      topic: 'Dynamic Programming',   points: 200 },
  { id: 'p25', name: 'Removing Digits',               difficulty: 'medium', topic_id: 'dp',      topic: 'Dynamic Programming',   points: 200 },
  { id: 'p26', name: 'Grid Paths',                    difficulty: 'medium', topic_id: 'dp',      topic: 'Dynamic Programming',   points: 200 },
  { id: 'p27', name: 'Book Shop',                     difficulty: 'hard',   topic_id: 'dp',      topic: 'Dynamic Programming',   points: 300 },
  { id: 'p28', name: 'Array Description',             difficulty: 'hard',   topic_id: 'dp',      topic: 'Dynamic Programming',   points: 300 },
  { id: 'p29', name: 'Edit Distance',                 difficulty: 'hard',   topic_id: 'dp',      topic: 'Dynamic Programming',   points: 300 },
  { id: 'p30', name: 'Rectangle Cutting',             difficulty: 'hard',   topic_id: 'dp',      topic: 'Dynamic Programming',   points: 300 },
  { id: 'p31', name: 'Counting Rooms',                difficulty: 'easy',   topic_id: 'graphs',  topic: 'Graph Algorithms',      points: 100 },
  { id: 'p32', name: 'Labyrinth',                     difficulty: 'easy',   topic_id: 'graphs',  topic: 'Graph Algorithms',      points: 100 },
  { id: 'p33', name: 'Building Roads',                difficulty: 'medium', topic_id: 'graphs',  topic: 'Graph Algorithms',      points: 200 },
  { id: 'p34', name: 'Message Route',                 difficulty: 'medium', topic_id: 'graphs',  topic: 'Graph Algorithms',      points: 200 },
  { id: 'p35', name: 'Building Teams',                difficulty: 'medium', topic_id: 'graphs',  topic: 'Graph Algorithms',      points: 200 },
  { id: 'p36', name: 'Round Trip',                    difficulty: 'medium', topic_id: 'graphs',  topic: 'Graph Algorithms',      points: 200 },
  { id: 'p37', name: 'Monsters',                      difficulty: 'hard',   topic_id: 'graphs',  topic: 'Graph Algorithms',      points: 300 },
  { id: 'p38', name: 'Shortest Routes I',             difficulty: 'hard',   topic_id: 'graphs',  topic: 'Graph Algorithms',      points: 300 },
  { id: 'p39', name: 'Shortest Routes II',            difficulty: 'hard',   topic_id: 'graphs',  topic: 'Graph Algorithms',      points: 300 },
  { id: 'p40', name: 'High Score',                    difficulty: 'hard',   topic_id: 'graphs',  topic: 'Graph Algorithms',      points: 300 },
  { id: 'p41', name: 'Static Range Sum Queries',      difficulty: 'easy',   topic_id: 'range',   topic: 'Range Queries',         points: 100 },
  { id: 'p42', name: 'Static Range Minimum Queries',  difficulty: 'easy',   topic_id: 'range',   topic: 'Range Queries',         points: 100 },
  { id: 'p43', name: 'Dynamic Range Sum Queries',     difficulty: 'medium', topic_id: 'range',   topic: 'Range Queries',         points: 200 },
  { id: 'p44', name: 'Dynamic Range Minimum Queries', difficulty: 'medium', topic_id: 'range',   topic: 'Range Queries',         points: 200 },
  { id: 'p45', name: 'Range Xor Queries',             difficulty: 'medium', topic_id: 'range',   topic: 'Range Queries',         points: 200 },
  { id: 'p46', name: 'Range Update Queries',          difficulty: 'hard',   topic_id: 'range',   topic: 'Range Queries',         points: 300 },
  { id: 'p47', name: 'Polynomial Queries',            difficulty: 'hard',   topic_id: 'range',   topic: 'Range Queries',         points: 300 },
  { id: 'p48', name: 'Forest Queries',                difficulty: 'hard',   topic_id: 'range',   topic: 'Range Queries',         points: 300 },
  { id: 'p49', name: 'Subordinates',                  difficulty: 'easy',   topic_id: 'trees',   topic: 'Tree Algorithms',       points: 100 },
  { id: 'p50', name: 'Tree Matching',                 difficulty: 'medium', topic_id: 'trees',   topic: 'Tree Algorithms',       points: 200 },
  { id: 'p51', name: 'Tree Diameter',                 difficulty: 'medium', topic_id: 'trees',   topic: 'Tree Algorithms',       points: 200 },
  { id: 'p52', name: 'Tree Distances I',              difficulty: 'medium', topic_id: 'trees',   topic: 'Tree Algorithms',       points: 200 },
  { id: 'p53', name: 'Tree Distances II',             difficulty: 'hard',   topic_id: 'trees',   topic: 'Tree Algorithms',       points: 300 },
  { id: 'p54', name: 'Company Queries I',             difficulty: 'hard',   topic_id: 'trees',   topic: 'Tree Algorithms',       points: 300 },
  { id: 'p55', name: 'Company Queries II',            difficulty: 'hard',   topic_id: 'trees',   topic: 'Tree Algorithms',       points: 300 },
  { id: 'p56', name: 'Distance Queries',              difficulty: 'hard',   topic_id: 'trees',   topic: 'Tree Algorithms',       points: 300 },
  { id: 'p57', name: 'Josephus Problem I',            difficulty: 'easy',   topic_id: 'math',    topic: 'Mathematics',           points: 100 },
  { id: 'p58', name: 'Josephus Problem II',           difficulty: 'medium', topic_id: 'math',    topic: 'Mathematics',           points: 200 },
  { id: 'p59', name: 'Exponentiation',                difficulty: 'easy',   topic_id: 'math',    topic: 'Mathematics',           points: 100 },
  { id: 'p60', name: 'Exponentiation II',             difficulty: 'medium', topic_id: 'math',    topic: 'Mathematics',           points: 200 },
  { id: 'p61', name: 'Counting Divisors',             difficulty: 'medium', topic_id: 'math',    topic: 'Mathematics',           points: 200 },
  { id: 'p62', name: 'Common Divisors',               difficulty: 'medium', topic_id: 'math',    topic: 'Mathematics',           points: 200 },
  { id: 'p63', name: 'Sum of Divisors',               difficulty: 'hard',   topic_id: 'math',    topic: 'Mathematics',           points: 300 },
  { id: 'p64', name: 'Divisor Analysis',              difficulty: 'hard',   topic_id: 'math',    topic: 'Mathematics',           points: 300 },
  { id: 'p65', name: 'Prime Multiples',               difficulty: 'hard',   topic_id: 'math',    topic: 'Mathematics',           points: 300 },
];

const NEWS = [
  { id: 'n1', title: 'ICPC World Finals 2025 — Results',     description: 'MIT takes gold at the ICPC World Finals 2025 in Kazakhstan. Team "Cache Money" solved all 13 problems in record time.', tag: 'Competition',  type: 'contest-result',   date: '2025-04-18' },
  { id: 'n2', title: 'Ranked Mode Coming Next Month',         description: 'Ranked arena matches will launch May 15th. Your ELO rating will affect leaderboard position. Beta testers wanted.',     tag: 'Update',       type: 'upcoming-feature', date: '2025-04-20' },
  { id: 'n3', title: 'Spring Open Contest — April 30th',     description: 'A 3-hour individual contest featuring 8 problems spanning all difficulty tiers. Prize pool: 10,000 coins.',              tag: 'Contest',      type: 'contest',          date: '2025-04-22' },
  { id: 'n4', title: 'New Topic Added: Advanced DP',         description: '15 new problems on bitmask DP, interval DP, and digit DP have been added to the problems section.',                     tag: 'Announcement', type: 'announcement',     date: '2025-04-15' },
  { id: 'n5', title: 'Protocol Academy Internal Cup — Top 3',description: '1st: tourist (3241 pts), 2nd: jiangly (3102 pts), 3rd: Um_nik (2987 pts). Congratulations!',                           tag: 'Competition',  type: 'contest-result',   date: '2025-04-10' },
  { id: 'n6', title: 'Mobile App Beta — Sign Up Now',        description: 'Protocol Academy mobile (iOS/Android) enters closed beta. Practice on the go, track streaks, get push notifications.', tag: 'Update',       type: 'upcoming-feature', date: '2025-04-05' },
  { id: 'n7', title: 'Diagnostic Tool v2 Released',           description: 'Completely rewritten adaptive difficulty engine. Now covers 7 topics with 150 calibration problems.',                  tag: 'Announcement', type: 'announcement',     date: '2025-03-28' },
  { id: 'n8', title: 'May Monthly — Team Format',             description: '5-hour team contest (2-3 members). 10 problems, ICPC scoring. Register your team by April 28th.',                     tag: 'Contest',      type: 'contest',          date: '2025-05-01' },
];

const SHOP_ITEMS = [
  { id: 's1',  name: 'Gold Frame',      description: 'Shimmering gold border around your avatar', category: 'avatar',     section: 'trending', price: 500,  sale_price: null, preview: '🟡' },
  { id: 's2',  name: 'Neon Ring',       description: 'Pulsing neon green ring',                   category: 'avatar',     section: 'trending', price: 350,  sale_price: null, preview: '💚' },
  { id: 's3',  name: 'Diamond Crown',   description: 'Rare diamond crown for top players',         category: 'avatar',     section: 'trending', price: 1200, sale_price: null, preview: '💎' },
  { id: 's4',  name: 'Fire Aura',       description: 'Blazing fire effect around avatar',          category: 'avatar',     section: 'sale',     price: 800,  sale_price: 400,  preview: '🔥' },
  { id: 's5',  name: 'Ice Frame',       description: 'Frozen crystal border',                      category: 'avatar',     section: 'sale',     price: 600,  sale_price: 300,  preview: '❄️' },
  { id: 's6',  name: 'Shadow Veil',     description: 'Dark shadowy frame, newly added',            category: 'avatar',     section: 'new',      price: 450,  sale_price: null, preview: '🌑' },
  { id: 's7',  name: 'GG Wave',         description: 'Wave after a great game',                    category: 'emote',      section: 'trending', price: 150,  sale_price: null, preview: '👋' },
  { id: 's8',  name: 'Big Brain',       description: 'Flex your problem-solving skills',           category: 'emote',      section: 'trending', price: 200,  sale_price: null, preview: '🧠' },
  { id: 's9',  name: 'Stonks',          description: 'Celebrate your rank climb',                  category: 'emote',      section: 'sale',     price: 180,  sale_price: 90,   preview: '📈' },
  { id: 's10', name: 'Cope',            description: 'For when you miss the time limit by 1ms',    category: 'emote',      section: 'new',      price: 120,  sale_price: null, preview: '😤' },
  { id: 's11', name: "Let's Go",        description: 'Hype your teammates up',                     category: 'emote',      section: 'new',      price: 130,  sale_price: null, preview: '🚀' },
  { id: 's12', name: 'Midnight Blue',   description: 'Deep ocean midnight blue profile bg',        category: 'background', section: 'trending', price: 300,  sale_price: null, preview: '🌊' },
  { id: 's13', name: 'Matrix Green',    description: 'Classic green-on-black matrix rain bg',      category: 'background', section: 'trending', price: 400,  sale_price: null, preview: '💻' },
  { id: 's14', name: 'Sunset Gradient', description: 'Warm orange to purple gradient',             category: 'background', section: 'sale',     price: 350,  sale_price: 175,  preview: '🌅' },
  { id: 's15', name: 'Space Nebula',    description: 'Deep space nebula, newly added',             category: 'background', section: 'new',      price: 500,  sale_price: null, preview: '🌌' },
  { id: 's16', name: 'Circuit Board',   description: 'Glowing PCB trace pattern',                  category: 'background', section: 'new',      price: 420,  sale_price: null, preview: '⚡' },
];

const DEMO_USERS = [
  { username: 'tourist',   email: 'tourist@demo.com',   avatar: 'T', country: 'BY', rank: 'Master',     diagnostic: 2850, coins: 82400, stars: 48 },
  { username: 'jiangly',   email: 'jiangly@demo.com',   avatar: 'J', country: 'CN', rank: 'Master',     diagnostic: 2780, coins: 76200, stars: 42 },
  { username: 'Um_nik',    email: 'umnik@demo.com',     avatar: 'U', country: 'UA', rank: 'Master',     diagnostic: 2710, coins: 71400, stars: 39 },
  { username: 'ecnerwala', email: 'ecnerwala@demo.com', avatar: 'E', country: 'US', rank: 'Expert',     diagnostic: 2650, coins: 66800, stars: 35 },
  { username: 'neal_wu',   email: 'nealwu@demo.com',    avatar: 'N', country: 'US', rank: 'Expert',     diagnostic: 2590, coins: 63100, stars: 31 },
  { username: 'maroonrk',  email: 'maroonrk@demo.com', avatar: 'M', country: 'LK', rank: 'Expert',     diagnostic: 2520, coins: 59700, stars: 28 },
  { username: 'Radewoosh', email: 'radewoosh@demo.com', avatar: 'R', country: 'PL', rank: 'Expert',     diagnostic: 2460, coins: 55400, stars: 25 },
  { username: 'Benq',      email: 'benq@demo.com',      avatar: 'B', country: 'US', rank: 'Specialist', diagnostic: 2400, coins: 53200, stars: 23 },
  { username: 'gamegame',  email: 'gamegame@demo.com',  avatar: 'G', country: 'CN', rank: 'Specialist', diagnostic: 2340, coins: 48900, stars: 20 },
  { username: 'ksun48',    email: 'ksun48@demo.com',    avatar: 'K', country: 'US', rank: 'Specialist', diagnostic: 2280, coins: 46200, stars: 18 },
  { username: 'Petr',      email: 'petr@demo.com',      avatar: 'P', country: 'CZ', rank: 'Specialist', diagnostic: 2200, coins: 41000, stars: 15 },
  { username: 'vepifanov', email: 'vepifanov@demo.com', avatar: 'V', country: 'RU', rank: 'Pupil',      diagnostic: 2100, coins: 38500, stars: 12 },
];

const client = await pool.connect();
try {
  await client.query('BEGIN');

  for (const p of PROBLEMS) {
    await client.query(
      `INSERT INTO problems (id, name, difficulty, topic_id, topic, points)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
      [p.id, p.name, p.difficulty, p.topic_id, p.topic, p.points]
    );
  }

  for (const n of NEWS) {
    await client.query(
      `INSERT INTO news (id, title, description, tag, type, date)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
      [n.id, n.title, n.description, n.tag, n.type, n.date]
    );
  }

  for (const i of SHOP_ITEMS) {
    await client.query(
      `INSERT INTO shop_items (id, name, description, category, section, price, sale_price, preview)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
      [i.id, i.name, i.description, i.category, i.section, i.price, i.sale_price, i.preview]
    );
  }

  const hash       = await bcrypt.hash('demo123', 10);
  const allProblems = (await client.query('SELECT id FROM problems')).rows;

  for (let idx = 0; idx < DEMO_USERS.length; idx++) {
    const u        = DEMO_USERS[idx];
    const joinDate = `202${Math.floor(idx / 4)}-0${(idx % 9) + 1}-01`;
    const { rows } = await client.query(
      `INSERT INTO users (username, email, password_hash, avatar, country, rank, diagnostic, coins, stars, join_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT DO NOTHING RETURNING id`,
      [u.username, u.email, hash, u.avatar, u.country, u.rank, u.diagnostic, u.coins, u.stars, joinDate]
    );
    if (!rows[0]) continue;
    const userId = rows[0].id;
    const count  = Math.floor(allProblems.length * (1 - idx * 0.06));
    for (const p of allProblems.slice(0, count)) {
      await client.query(
        `INSERT INTO user_problem_status (user_id, problem_id, status)
         VALUES ($1, $2, 'solved') ON CONFLICT DO NOTHING`,
        [userId, p.id]
      );
    }
  }

  await client.query('COMMIT');
  console.log(`Seed complete — ${PROBLEMS.length} problems, ${NEWS.length} news, ${SHOP_ITEMS.length} shop items, ${DEMO_USERS.length} demo users`);
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Seed failed:', err);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
