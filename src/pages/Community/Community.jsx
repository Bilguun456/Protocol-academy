import { NavLink, Outlet, useLocation } from 'react-router-dom';
import styles from './Community.module.css';

const SUBNAV = [
  { to: '/community/arena',      label: '⚔ Arena' },
  { to: '/community/diagnostic', label: '◈ Diagnostic' },
  { to: '/community/search',     label: '⊕ Problem Search' },
  { to: '/community/create',     label: '+ Create Problem' },
  { to: '/community/saved',      label: '☆ Saved Drafts' },
];

export default function Community() {
  const location = useLocation();
  const isRoot = location.pathname === '/community';

  return (
    <div className="page-container">
      <div className={styles.subnav}>
        {SUBNAV.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `${styles.sublink} ${isActive ? styles.sublinkActive : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      {isRoot ? <CommunityHome /> : <Outlet />}
    </div>
  );
}

function CommunityHome() {
  return (
    <div className={styles.home}>
      <h1 className={styles.title}>Community</h1>
      <p className={styles.subtitle}>Compete, practice, and collaborate with others.</p>
      <div className={styles.cards}>
        {[
          { to: '/community/arena',      icon: '⚔', label: 'Arena',          desc: 'PvP rooms, timed matches, ranked games' },
          { to: '/community/diagnostic', icon: '◈', label: 'Diagnostic',     desc: 'Calibrate your skill level adaptively' },
          { to: '/community/search',     icon: '⊕', label: 'Problem Search', desc: 'Filter and find problems by topic, difficulty' },
          { to: '/community/create',     icon: '+', label: 'Create Problem',  desc: 'Submit your own problem to the platform' },
          { to: '/community/saved',      icon: '☆', label: 'Saved Drafts',   desc: 'Your saved problem drafts' },
        ].map(card => (
          <NavLink key={card.to} to={card.to} className={styles.featureCard}>
            <span className={styles.featureIcon}>{card.icon}</span>
            <div className={styles.featureLabel}>{card.label}</div>
            <div className={styles.featureDesc}>{card.desc}</div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
