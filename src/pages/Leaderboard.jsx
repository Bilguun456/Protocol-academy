import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import styles from './Leaderboard.module.css';

const TABS = ['Global', 'Local (Country)', 'Friends'];

const SORT_TYPES = [
  { id: 'solved',     label: 'Problems Solved', col: 'Solved'  },
  { id: 'stars',      label: 'Stars Collected',  col: 'Stars'   },
  { id: 'coins',      label: 'Coins Earned',     col: 'Coins'   },
  { id: 'diagnostic', label: 'Diagnostic Score', col: 'Rating'  },
];

const ACHIEVEMENTS = [
  { icon: '★', label: 'Top Solver',     filterKey: 'solved' },
  { icon: '◆', label: 'Star Collector', filterKey: 'stars' },
  { icon: '⚡', label: 'Speed Demon',   filterKey: 'speed' },
  { icon: '●', label: 'Streak Master',  filterKey: 'streak' },
  { icon: '▲', label: 'Diamond Rank',   filterKey: 'diamond' },
];

export default function Leaderboard() {
  const [tab, setTab]                       = useState('Global');
  const [sortType, setSortType]             = useState('solved');
  const [achievementFilter, setAchievementFilter] = useState(null);
  const [users, setUsers]                   = useState([]);
  const [loading, setLoading]               = useState(true);

  const sortDef = SORT_TYPES.find(s => s.id === sortType);

  useEffect(() => {
    setLoading(true);
    api.getLeaderboard(sortType)
      .then(res => setUsers(res.users))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sortType]);

  return (
    <div className="page-container">
      <div className={styles.header}>
        <h1 className={styles.title}>Leaderboard</h1>
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className={styles.sortRow}>
        <span className={styles.sortLabel}>Sort by:</span>
        {SORT_TYPES.map(s => (
          <button
            key={s.id}
            className={`${styles.sortBtn} ${sortType === s.id ? styles.sortBtnActive : ''}`}
            onClick={() => setSortType(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Loading…
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thRank}>#</th>
                <th className={styles.thPlayer}>Player</th>
                <th className={styles.thStat}>{sortDef.col}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  className={`${styles.row} ${i === 0 ? styles.top1 : i === 1 ? styles.top2 : i === 2 ? styles.top3 : ''}`}
                >
                  <td className={styles.tdRank}>
                    <span className={styles.rankNum}>{i + 1}</span>
                    {u.weeklyChange > 0 && <span className={styles.up}>↑{u.weeklyChange}</span>}
                    {u.weeklyChange < 0 && <span className={styles.down}>↓{Math.abs(u.weeklyChange)}</span>}
                    {u.weeklyChange === 0 && <span className={styles.same}>—</span>}
                  </td>
                  <td className={styles.tdPlayer}>
                    <div className="avatar">{u.avatar}</div>
                    <div className={styles.playerInfo}>
                      <Link to={`/profile/${u.name}`} className={styles.playerName}>{u.name}</Link>
                      <span className={styles.playerCountry}>{u.country}</span>
                    </div>
                    <span className={u.online ? 'online-dot' : 'offline-dot'} />
                  </td>
                  <td className={styles.tdStat}>
                    {sortType === 'coins'
                      ? (u[sortType] || 0).toLocaleString()
                      : u[sortType] ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.achievementBar}>
        <span className={styles.achieveLabel}>Filter by achievement:</span>
        {ACHIEVEMENTS.map(a => (
          <button
            key={a.filterKey}
            className={`${styles.achieveBtn} ${achievementFilter === a.filterKey ? styles.achieveActive : ''}`}
            onClick={() => setAchievementFilter(prev => prev === a.filterKey ? null : a.filterKey)}
            title={a.label}
          >
            {a.icon}
          </button>
        ))}
        {achievementFilter && (
          <span className={styles.filterNote}>
            Achievement: {ACHIEVEMENTS.find(a => a.filterKey === achievementFilter)?.label}
          </span>
        )}
      </div>
    </div>
  );
}
