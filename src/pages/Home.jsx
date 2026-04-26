import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ONLINE_FRIENDS } from '../data/users';
import { NEWS } from '../data/news';
import styles from './Home.module.css';

const ACCOUNT_LOG = [
  { text: 'Solved "Weird Algorithm"', time: '2h ago', type: 'solve' },
  { text: 'Submitted "Missing Number"', time: '3h ago', type: 'submit' },
  { text: 'Joined Arena room #4821', time: '5h ago', type: 'arena' },
  { text: 'Earned 25 coins from solve', time: '5h ago', type: 'coins' },
  { text: 'Completed Diagnostic (score: 1240)', time: '1d ago', type: 'diag' },
];

const YT_VIDEOS = [
  { title: 'Segment Trees Explained', views: '12K views' },
  { title: 'DP on Trees — Full Guide', views: '8.4K views' },
  { title: 'BFS/DFS Deep Dive', views: '21K views' },
];

const YT_UPCOMING = [
  { title: "Mo's Algorithm", date: 'May 2' },
  { title: 'Convex Hull Trick', date: 'May 9' },
];

const TYPE_COLOR = {
  solve: '#16a34a',
  submit: '#d97706',
  arena: '#7c3aed',
  coins: '#d97706',
  diag: '#1a7fd4',
};

const RANK_COLOR = {
  Newbie: '#6b7a8d',
  Pupil: '#16a34a',
  Specialist: '#1a7fd4',
  Expert: '#7c3aed',
  Master: '#d97706',
};

export default function Home() {
  const {
    user, totalSolved, countSolvedByDifficulty,
    dailyState, dailyTasksDef, completeDailyTask, getAvatarStyle,
  } = useApp();

  const recentNews = NEWS.slice(0, 3);
  const solved = countSolvedByDifficulty();
  const rankColor = RANK_COLOR[user.rank] || '#6b7a8d';

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>PROTOCOL ACADEMY</h1>
          <p className={styles.heroTagline}>Grind problems. Climb ranks. Build something real.</p>
          <div className={styles.heroActions}>
            <Link to="/problems" className="btn btn-accent">Start Solving</Link>
            <Link to="/community/diagnostic" className="btn">Take Diagnostic</Link>
          </div>
        </div>
        <div className={styles.heroBg}>
          <span className={styles.heroBgText}>{'{ }'}</span>
        </div>
      </div>

      {/* Daily Tasks */}
      <div className={styles.dailySection}>
        <div className="section-title" style={{ marginBottom: 8 }}>Daily Tasks — resets midnight</div>
        <div className={styles.taskRow}>
          {dailyTasksDef.map(task => {
            const done = dailyState.completed?.[task.id];
            return (
              <div key={task.id} className={`${styles.taskCard} ${done ? styles.taskDone : ''}`}>
                <span className={styles.taskIcon}>{task.icon}</span>
                <div className={styles.taskBody}>
                  <div className={styles.taskLabel}>{task.label}</div>
                  <div className={styles.taskReward}>+{task.reward} coins</div>
                </div>
                {done ? (
                  <span className={styles.taskCheck}>✓</span>
                ) : (
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: 11, padding: '3px 8px' }}
                    onClick={() => completeDailyTask(task.id)}
                  >
                    Done
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Three columns */}
      <div className={styles.columns}>

        {/* Col 1: Friends */}
        <div className={styles.col}>
          <div className="card" style={{ height: '100%' }}>
            <div className="section-title">Online Friends</div>
            <div className={styles.friendsList}>
              {ONLINE_FRIENDS.map(f => (
                <Link key={f.id} to={`/profile/${f.name}`} className={styles.friendRow}>
                  <div className="avatar">{f.avatar}</div>
                  <span className={styles.friendName}>{f.name}</span>
                  <span className={f.online ? 'online-dot' : 'offline-dot'} style={{ marginLeft: 'auto' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2: Profile stats */}
        <div className={styles.col}>
          <div className="card" style={{ height: '100%' }}>
            <div className={styles.profileHeader}>
              <div
                className="avatar avatar-lg"
                style={{ ...getAvatarStyle(), width: 56, height: 56, fontSize: 20, borderRadius: 6 }}
              >
                {user.avatar}
              </div>
              <div>
                <div className={styles.profileName}>{user.name}</div>
                <div className={styles.profileRank} style={{ color: rankColor }}>{user.rank}</div>
              </div>
            </div>

            <div className="divider" />

            <div className={styles.statsGrid}>
              {[
                { val: totalSolved(), label: 'Solved' },
                { val: user.coins, label: 'Coins' },
                { val: user.timeSpent + 'm', label: 'Time' },
                { val: user.diagnostic || '—', label: 'Diagnostic' },
              ].map(s => (
                <div key={s.label} className={styles.statItem}>
                  <span className={styles.statVal}>{s.val}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>

            <div className="divider" />
            <div className="section-title">Solved by Difficulty</div>
            <div className={styles.diffRow}>
              <span className="tag tag-easy">Easy {solved.easy}</span>
              <span className="tag tag-medium">Med {solved.medium}</span>
              <span className="tag tag-hard">Hard {solved.hard}</span>
            </div>

            <div className="divider" />
            <div className="section-title">Recent Activity</div>
            <div className={styles.logList}>
              {ACCOUNT_LOG.map((log, i) => (
                <div key={i} className={styles.logRow}>
                  <span className={styles.logDot} style={{ background: TYPE_COLOR[log.type] }} />
                  <span className={styles.logText}>{log.text}</span>
                  <span className={styles.logTime}>{log.time}</span>
                </div>
              ))}
            </div>

            <div className="divider" />
            <div className="section-title">Recent News</div>
            {recentNews.map(n => (
              <Link key={n.id} to="/news" className={styles.newsRow}>
                <span className={styles.newsTitle}>{n.title}</span>
                <span className={styles.newsDate}>{n.date}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Col 3: YouTube */}
        <div className={styles.col}>
          <div className="card" style={{ height: '100%' }}>
            <div className="section-title">New Videos</div>
            <div className={styles.videoList}>
              {YT_VIDEOS.map((v, i) => (
                <div key={i} className={styles.videoCard}>
                  <div className={styles.videoThumb}>▶</div>
                  <div className={styles.videoInfo}>
                    <div className={styles.videoTitle}>{v.title}</div>
                    <div className={styles.videoMeta}>{v.views}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="divider" />
            <div className="section-title">Upcoming Videos</div>
            {YT_UPCOMING.map((v, i) => (
              <div key={i} className={styles.upcomingRow}>
                <span className={styles.upcomingTitle}>{v.title}</span>
                <span className={styles.upcomingDate}>{v.date}</span>
              </div>
            ))}

            <div className="divider" />
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              Visit Channel →
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
