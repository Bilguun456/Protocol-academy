import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.brand}>Protocol Academy</span>
        <div className={styles.links}>
          <Link to="/about">About</Link>
          <Link to="/news">News</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/settings">Settings</Link>
        </div>
        <span className={styles.copy}>Built by a 14-year-old developer from Mongolia</span>
      </div>
    </footer>
  );
}
