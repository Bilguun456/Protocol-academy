import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TOPICS } from '../data/problems';
import styles from './Problems.module.css';

const COIN_MAP = { easy: 10, medium: 25, hard: 50 };

const STATUS_STYLES = {
  untouched: {},
  attempted: { background: '#fffbeb', borderLeft: '3px solid #d97706' },
  solved:    { background: '#f0fdf4', borderLeft: '3px solid #16a34a' },
};

export default function Problems() {
  const { problemState, setProblemStatus } = useApp();
  const [openTopics, setOpenTopics] = useState({});

  function toggleTopic(id) {
    setOpenTopics(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function getStatus(problemId) {
    return problemState[problemId]?.status || 'untouched';
  }

  function topicSolved(topic) {
    return topic.problems.filter(p => getStatus(p.id) === 'solved').length;
  }

  function topicAllSolved(topic) {
    return topicSolved(topic) === topic.problems.length;
  }

  return (
    <div className="page-container">
      <div className={styles.header}>
        <h1 className={styles.title}>Problems</h1>
        <p className={styles.subtitle}>Click a topic to expand its problem set. Earn coins for every solve.</p>
      </div>

      <div className={styles.topicList}>
        {TOPICS.map(topic => {
          const solved = topicSolved(topic);
          const total = topic.problems.length;
          const allSolved = topicAllSolved(topic);
          const isOpen = openTopics[topic.id];

          return (
            <div
              key={topic.id}
              className={styles.topicBlock}
              style={allSolved ? { borderColor: '#16a34a', background: '#f0fdf4' } : {}}
            >
              <button
                className={styles.topicHeader}
                onClick={() => toggleTopic(topic.id)}
              >
                <span className={styles.topicArrow}>{isOpen ? '▼' : '▶'}</span>
                <span className={styles.topicName}>{topic.name}</span>
                <span
                  className={styles.topicProgress}
                  style={allSolved ? { color: '#16a34a', fontWeight: 700 } : {}}
                >
                  {solved}/{total}
                </span>
                {allSolved && <span className={styles.topicComplete}>✓ Complete</span>}
              </button>

              {isOpen && (
                <div className={styles.problemList}>
                  {topic.problems.map(problem => {
                    const status = getStatus(problem.id);
                    const coins = COIN_MAP[problem.difficulty];
                    return (
                      <div
                        key={problem.id}
                        className={styles.problemRow}
                        style={STATUS_STYLES[status]}
                      >
                        <span className={styles.problemName}>{problem.name}</span>
                        <div className={styles.problemRight}>
                          <span className={`tag tag-${problem.difficulty}`}>{problem.difficulty}</span>
                          <span className={styles.coinBadge}>+{coins}</span>
                          <div className={styles.statusButtons}>
                            <button
                              className={`btn btn-ghost ${status === 'attempted' ? styles.btnAttempted : ''}`}
                              onClick={() => setProblemStatus(problem.id, status === 'attempted' ? 'untouched' : 'attempted')}
                              title="Mark as attempted"
                            >
                              ○
                            </button>
                            <button
                              className={`btn btn-ghost ${status === 'solved' ? styles.btnSolved : ''}`}
                              onClick={() => setProblemStatus(problem.id, status === 'solved' ? 'untouched' : 'solved')}
                              title="Mark as solved"
                            >
                              ✓
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
