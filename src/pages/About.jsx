import { Link } from 'react-router-dom';
import styles from './About.module.css';

export default function About() {
  return (
    <div className="page-container">
      <div className={styles.wrap}>
        <h1 className={styles.title}>About Protocol Academy</h1>

        {/* Creator */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title">The Creator</div>
          <div className={styles.creatorRow}>
            <div className={styles.creatorAvatar}>B</div>
            <div className={styles.creatorInfo}>
              <div className={styles.creatorName}>Bilguun</div>
              <div className={styles.creatorMeta}>14 years old · Mongolia 🇲🇳</div>
            </div>
          </div>
          <p className={styles.body}>
            I'm a 14-year-old competitive programmer from Mongolia. I practice competitive programming
            on my iPad and participate in contests whenever I can. I built Protocol Academy because
            I wanted a platform that felt fast, clean, and focused — something designed by a competitive
            programmer for competitive programmers.
          </p>
          <p className={styles.body}>
            Everything here — the problems, the arena, the diagnostic system, the courses — is
            built with the goal of helping people get better at competitive programming faster.
            I use it myself to track my progress and stay consistent.
          </p>
        </div>

        {/* Mission */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title">Our Mission</div>
          <p className={styles.body}>
            Protocol Academy exists to make competitive programming more accessible and structured.
            We believe everyone — regardless of background, device, or experience level — deserves
            a great environment to practice algorithms and problem-solving.
          </p>
          <div className={styles.pillars}>
            {[
              { icon: '◈', title: 'Calibrate', desc: 'Know exactly where you stand with the Diagnostic tool' },
              { icon: '⚔', title: 'Compete', desc: 'Battle other solvers in real-time Arena matches' },
              { icon: '▲', title: 'Improve', desc: 'Structured problem sets with clear progression paths' },
              { icon: '★', title: 'Earn', desc: 'Collect achievements and coins as you grow' },
            ].map(p => (
              <div key={p.title} className={styles.pillar}>
                <span className={styles.pillarIcon}>{p.icon}</span>
                <div className={styles.pillarTitle}>{p.title}</div>
                <div className={styles.pillarDesc}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="card">
          <div className="section-title">Support Us</div>
          <p className={styles.body}>
            Protocol Academy is built and maintained by one person in their spare time.
            If you find this platform helpful, consider supporting its development.
            Every contribution helps keep the servers running and lets me spend more
            time building new features.
          </p>
          <div className={styles.supportActions}>
            <button
              className="btn btn-accent"
              onClick={() => alert('Donation system coming soon! Thank you for your support.')}
            >
              ♥ Donate
            </button>
            <button
              className="btn"
              onClick={() => alert('Share this platform with a friend!')}
            >
              Share Platform
            </button>
            <Link to="/shop" className="btn">
              ⬡ Buy Coins
            </Link>
          </div>
          <p className={styles.thankYou}>
            Thank you for being part of the Protocol Academy community. Every user
            who practices here makes the platform better.
          </p>
        </div>
      </div>
    </div>
  );
}
