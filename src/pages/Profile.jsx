import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import styles from './Profile.module.css';

const ACTIVITY_LOG = [
  { text: 'Solved "Weird Algorithm"',    time: '2h ago', icon: '✓', color: '#16a34a' },
  { text: 'Submitted "Missing Number"',  time: '3h ago', icon: '○', color: '#d97706' },
  { text: 'Joined Arena room #4821',     time: '5h ago', icon: '⚔', color: '#7c3aed' },
  { text: 'Completed Diagnostic',        time: '1d ago', icon: '◈', color: '#1a7fd4' },
  { text: 'Purchased "Gold Frame"',      time: '2d ago', icon: '⬡', color: '#d97706' },
  { text: 'Solved "Apartments"',         time: '2d ago', icon: '✓', color: '#16a34a' },
];

const ACHIEVEMENTS = [
  { icon: '★', name: 'First Solve' },
  { icon: '★', name: 'Rising Star' },
  { icon: '◆', name: '7-Day Streak' },
  { icon: '▲', name: 'Hard Solver' },
];

const RANK_COLOR = {
  Newbie: '#6b7a8d', Pupil: '#16a34a', Specialist: '#1a7fd4',
  Expert: '#7c3aed', Master: '#d97706',
};

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser, countSolvedByDifficulty, totalSolved, getAvatarStyle } = useApp();

  const isMe = username === 'me' || username === currentUser?.name;

  const [otherUser, setOtherUser]     = useState(null);
  const [otherSolved, setOtherSolved] = useState({ easy: 0, medium: 0, hard: 0, total: 0 });
  const [loadingOther, setLoadingOther] = useState(!isMe);

  useEffect(() => {
    if (isMe) return;
    setLoadingOther(true);
    api.getUser(username)
      .then(res => { setOtherUser(res.user); setOtherSolved(res.solved); })
      .catch(() => {})
      .finally(() => setLoadingOther(false));
  }, [username, isMe]);

  if (!isMe && loadingOther) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: 60, color: 'var(--text-muted)', fontSize: 13 }}>
        Loading profile…
      </div>
    );
  }

  const displayUser = isMe
    ? { name: currentUser?.name, avatar: currentUser?.avatar, rank: currentUser?.rank, joinDate: currentUser?.joinDate, diagnostic: currentUser?.diagnostic, country: currentUser?.country, online: true }
    : (otherUser || { name: username, avatar: username?.[0]?.toUpperCase() || '?', rank: 'Newbie', joinDate: '—', diagnostic: 0, country: '—', online: false });

  const solved    = isMe ? countSolvedByDifficulty() : { easy: otherSolved.easy, medium: otherSolved.medium, hard: otherSolved.hard };
  const total     = isMe ? totalSolved() : otherSolved.total;
  const rankColor = RANK_COLOR[displayUser.rank] || '#6b7a8d';
  const avatarStyle = isMe ? getAvatarStyle() : {};

  return (
    <div className="page-container">
      <div className={styles.wrap}>

        <div className={`card ${styles.headerCard}`}>
          <div className={styles.avatarCol}>
            <div
              className={styles.avatar}
              style={{
                background: (isMe && currentUser?.avatarBg) ? currentUser.avatarBg : '#e8f0fb',
                color: (isMe && currentUser?.avatarBg) ? '#fff' : 'var(--accent)',
                ...avatarStyle,
              }}
            >
              {displayUser.avatar}
            </div>
            <span className={displayUser.online ? 'online-dot' : 'offline-dot'} />
          </div>

          <div className={styles.headerInfo}>
            <div className={styles.nameRow}>
              <span className={styles.username}>{displayUser.name}</span>
              <span className={styles.rankBadge} style={{ color: rankColor }}>{displayUser.rank}</span>
              {isMe && <Link to="/settings" className={styles.editLink}>Edit Profile</Link>}
            </div>
            <div className={styles.metaRow}>
              <span>{displayUser.country}</span>
              <span>·</span>
              <span>Joined {displayUser.joinDate}</span>
            </div>
          </div>
        </div>

        <div className={styles.columns}>
          <div className={styles.leftCol}>
            <div className="card">
              <div className={styles.statsGrid}>
                <StatBox label="Solved"       value={total} />
                <StatBox label="Diagnostic"   value={displayUser.diagnostic || '—'} />
                <StatBox label="Achievements" value={ACHIEVEMENTS.length} />
                <StatBox label="Country"      value={displayUser.country} />
              </div>

              <div className="divider" />
              <div className="section-title">By Difficulty</div>
              <DiffBar label="Easy"   count={solved.easy}   total={total} color="#16a34a" />
              <DiffBar label="Medium" count={solved.medium} total={total} color="var(--orange)" />
              <DiffBar label="Hard"   count={solved.hard}   total={total} color="var(--red)" />

              <div className="divider" />
              <div className="section-title">Achievements</div>
              <div className={styles.achieveRow}>
                {ACHIEVEMENTS.map((a, i) => (
                  <div key={i} className={styles.achieveChip} title={a.name}>
                    <span className={styles.achieveIcon}>{a.icon}</span>
                    <span className={styles.achieveLabel}>{a.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.rightCol}>
            <div className="card">
              <div className="section-title">Recent Activity</div>
              <div className={styles.activityList}>
                {ACTIVITY_LOG.map((item, i) => (
                  <div key={i} className={styles.actRow}>
                    <span className={styles.actIcon} style={{ color: item.color }}>{item.icon}</span>
                    <span className={styles.actText}>{item.text}</span>
                    <span className={styles.actTime}>{item.time}</span>
                  </div>
                ))}
              </div>

              {isMe && (
                <>
                  <div className="divider" />
                  <div className="section-title">Friends</div>
                  <div className={styles.friendRow}>
                    {['tourist', 'jiangly', 'Benq'].map(name => (
                      <Link key={name} to={`/profile/${name}`} className={styles.friendChip}>
                        <div className="avatar" style={{ width: 24, height: 24, fontSize: 11, borderRadius: 3 }}>
                          {name[0].toUpperCase()}
                        </div>
                        <span>{name}</span>
                        <span className="online-dot" style={{ width: 6, height: 6 }} />
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className={styles.statBox}>
      <div className={styles.statVal}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function DiffBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className={styles.diffBar}>
      <span className={styles.diffLabel}>{label}</span>
      <div className={styles.diffTrack}>
        <div className={styles.diffFill} style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className={styles.diffCount} style={{ color }}>{count}</span>
    </div>
  );
}
