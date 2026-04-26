import { useEffect } from 'react';
import { NEWS, TAG_COLORS } from '../data/news';
import { useApp } from '../context/AppContext';
import styles from './News.module.css';

export default function News() {
  const { markAllNewsRead, readNewsIds } = useApp();

  useEffect(() => {
    markAllNewsRead();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page-container">
      <div className={styles.header}>
        <h1 className={styles.title}>News</h1>
        <p className={styles.subtitle}>Announcements, contests, and platform updates.</p>
      </div>

      <div className={styles.feed}>
        {NEWS.map(item => {
          const tagStyle = TAG_COLORS[item.tag] || {};
          const isNew = !readNewsIds.includes(item.id);
          return (
            <div key={item.id} className={`${styles.card} ${isNew ? styles.cardNew : ''}`}>
              <div className={styles.cardTop}>
                <span className="tag" style={{ background: tagStyle.bg, color: tagStyle.color }}>
                  {item.tag}
                </span>
                {isNew && <span className={styles.newBadge}>NEW</span>}
                <span className={styles.date}>{item.date}</span>
              </div>
              <h2 className={styles.cardTitle}>{item.title}</h2>
              <p className={styles.cardDesc}>{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
