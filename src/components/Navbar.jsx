import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, unreadCount, getAvatarStyle, logout } = useApp();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo}>
          PROTOCOL<span className={styles.logoAccent}>_</span>ACADEMY
        </NavLink>

        <ul className={styles.links}>
          {[
            { to: '/',           label: 'Home',        end: true },
            { to: '/problems',   label: 'Problems' },
            { to: '/community',  label: 'Community' },
            { to: '/courses',    label: 'Courses' },
            { to: '/leaderboard',label: 'Leaderboard' },
            { to: '/shop',       label: 'Shop' },
          ].map(link => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
              >
                {link.label}
              </NavLink>
            </li>
          ))}

          <li>
            <NavLink
              to="/news"
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              News
              {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
            </NavLink>
          </li>
        </ul>

        <div className={styles.right}>
          <span className={styles.coins}>⬡ {user?.coins ?? 0}</span>
          <NavLink
            to="/settings"
            className={({ isActive }) => `${styles.iconLink} ${isActive ? styles.iconActive : ''}`}
            title="Settings"
          >
            ⚙
          </NavLink>
          <button
            className={styles.avatarBtn}
            style={getAvatarStyle()}
            onClick={() => navigate('/profile/me')}
            title={user?.name}
          >
            {user?.avatar ?? '?'}
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Log out">
            ⏻
          </button>
        </div>
      </div>
    </nav>
  );
}
