import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ALL_PROBLEMS, TOPICS } from '../../data/problems';
import styles from './Diagnostic.module.css';

const TOTAL_ROUNDS = 7;
const BASE_SCORE = 1000;
const SCORE_DELTA = { easy: 150, medium: 250, hard: 400 };

// Build a pool of problems with their topic name attached
const POOL = ALL_PROBLEMS.map(p => ({
  ...p,
  topicName: TOPICS.find(t => t.id === p.topicId)?.name || p.topicId,
}));

function pickProblem(difficulty, excludeIds) {
  const candidates = POOL.filter(p => p.difficulty === difficulty && !excludeIds.includes(p.id));
  if (candidates.length === 0) {
    // Fallback: pick from any difficulty
    const all = POOL.filter(p => !excludeIds.includes(p.id));
    return all[Math.floor(Math.random() * all.length)] || POOL[0];
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function nextDifficulty(current, outcome) {
  const levels = ['easy', 'medium', 'hard'];
  const idx = levels.indexOf(current);
  if (outcome === 'solved') return levels[Math.min(idx + 1, 2)];
  return levels[Math.max(idx - 1, 0)];
}

function calcScore(history) {
  let score = BASE_SCORE;
  history.forEach(h => {
    if (h.outcome === 'solved') score += SCORE_DELTA[h.difficulty];
    else score -= Math.floor(SCORE_DELTA[h.difficulty] / 2);
  });
  return Math.max(0, Math.min(3000, score));
}

function scoreToRank(score) {
  if (score >= 2500) return 'Master';
  if (score >= 1800) return 'Expert';
  if (score >= 1300) return 'Specialist';
  if (score >= 900)  return 'Pupil';
  return 'Newbie';
}

export default function Diagnostic() {
  const { setUser, setProblemStatus } = useApp();
  const [phase, setPhase] = useState('intro'); // intro | active | done
  const [history, setHistory] = useState([]); // [{problemId, name, difficulty, outcome}]
  const [currentDiff, setCurrentDiff] = useState('easy');
  const [usedIds, setUsedIds] = useState([]);
  const [code, setCode] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const currentProblem = useMemo(() => {
    if (phase !== 'active') return null;
    return pickProblem(currentDiff, usedIds);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentDiff, usedIds.length]);

  function startDiagnostic() {
    setHistory([]);
    setUsedIds([]);
    setCurrentDiff('easy');
    setCode('');
    setSubmitted(false);
    setPhase('active');
  }

  function handleSubmit(outcome) {
    if (!currentProblem) return;
    const entry = { problemId: currentProblem.id, name: currentProblem.name, difficulty: currentProblem.difficulty, topicName: currentProblem.topicName, outcome };
    const newHistory = [...history, entry];
    setHistory(newHistory);
    setUsedIds(prev => [...prev, currentProblem.id]);

    // Honor system: mark as solved in problems state if they say solved
    if (outcome === 'solved') {
      setProblemStatus(currentProblem.id, 'solved');
    }

    setSubmitted(true);
  }

  function goNext() {
    if (!currentProblem) return;
    const last = history[history.length - 1];
    if (history.length >= TOTAL_ROUNDS) {
      const finalScore = calcScore(history);
      const rank = scoreToRank(finalScore);
      setUser(u => ({ ...u, diagnostic: finalScore, rank }));
      setPhase('done');
      return;
    }
    setCurrentDiff(nextDifficulty(last.difficulty, last.outcome));
    setCode('');
    setSubmitted(false);
  }

  function finish() {
    const finalScore = calcScore(history);
    const rank = scoreToRank(finalScore);
    setUser(u => ({ ...u, diagnostic: finalScore, rank }));
    setPhase('done');
  }

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className={styles.intro}>
        <div className={styles.introIcon}>◈</div>
        <h2 className={styles.introTitle}>Diagnostic Arena</h2>
        <p className={styles.introDesc}>
          The diagnostic evaluates your skill level using real problems from the problem set.
          It adapts — solve correctly and the next problem gets harder, struggle and it gets easier.
          This is an honor system: only mark solved if you actually wrote a working solution.
        </p>
        <ul className={styles.introList}>
          <li>{TOTAL_ROUNDS} adaptive problems from the real problem set</li>
          <li>Write your solution in the code editor</li>
          <li>Honor system — solved problems are saved to your profile</li>
          <li>Produces a skill score (0–3000) and rank</li>
        </ul>
        <button className="btn btn-accent" style={{ marginTop: 20 }} onClick={startDiagnostic}>
          Enter Arena
        </button>
      </div>
    );
  }

  // ── DONE ───────────────────────────────────────────────────────────────────
  if (phase === 'done') {
    const score = calcScore(history);
    const rank = scoreToRank(score);
    const solved = history.filter(h => h.outcome === 'solved').length;

    return (
      <div className={styles.done}>
        <div className={styles.doneIcon}>◈</div>
        <h2 className={styles.doneTitle}>Diagnostic Complete</h2>
        <div className={styles.finalScore}>{score}</div>
        <div className={styles.finalRank} style={{ color: rankColor(rank) }}>{rank}</div>
        <p className={styles.doneDesc}>
          Solved {solved} of {history.length} problems. Your rank has been updated.
        </p>

        <div className={styles.historyList}>
          {history.map((h, i) => (
            <div key={i} className={`${styles.historyRow} ${h.outcome === 'solved' ? styles.histSolved : styles.histWrong}`}>
              <span className={styles.histIcon}>{h.outcome === 'solved' ? '✓' : '✗'}</span>
              <span className={styles.histName}>{h.name}</span>
              <span className={`tag tag-${h.difficulty}`}>{h.difficulty}</span>
              <span className={styles.histTopic}>{h.topicName}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
          <button className="btn btn-accent" onClick={startDiagnostic}>Retake</button>
          <button className="btn btn-ghost" onClick={() => setPhase('intro')}>Back</button>
        </div>
      </div>
    );
  }

  // ── ACTIVE ─────────────────────────────────────────────────────────────────
  const round = history.length + 1;
  const pct = ((round - 1) / TOTAL_ROUNDS) * 100;

  return (
    <div className={styles.active}>
      <div className={styles.progressRow}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
        <span className={styles.counter}>{round} / {TOTAL_ROUNDS}</span>
      </div>

      {currentProblem && (
        <>
          <div className={styles.problemMeta}>
            <span className={`tag tag-${currentProblem.difficulty}`}>{currentProblem.difficulty}</span>
            <span className={styles.topic}>{currentProblem.topicName}</span>
          </div>

          <h3 className={styles.problemName}>{currentProblem.name}</h3>
          <div className={styles.statement}>
            {currentProblem.statement || 'Solve this problem using the appropriate algorithm for the given constraints.'}
          </div>

          <div className={styles.codeLabel}>Your Solution</div>
          <textarea
            className={styles.codeArea}
            rows={12}
            placeholder={`// Write your solution here\n// This is an honor system — only mark solved if it actually works\n\n`}
            value={code}
            onChange={e => setCode(e.target.value)}
            disabled={submitted}
            spellCheck={false}
          />

          {!submitted ? (
            <div className={styles.actionRow}>
              <button
                className="btn btn-accent"
                onClick={() => handleSubmit('solved')}
                disabled={!code.trim()}
                title={!code.trim() ? 'Write your solution first' : ''}
              >
                ✓ Mark as Solved
              </button>
              <button className="btn btn-danger" onClick={() => handleSubmit('unsolved')}>
                ✗ Could Not Solve
              </button>
              <button className="btn btn-ghost" onClick={finish} style={{ marginLeft: 'auto' }}>
                Finish Early
              </button>
            </div>
          ) : (
            <div className={styles.afterSubmit}>
              <div
                className={styles.verdict}
                style={{ color: history[history.length - 1]?.outcome === 'solved' ? '#16a34a' : 'var(--red)' }}
              >
                {history[history.length - 1]?.outcome === 'solved' ? '✓ Solved' : '✗ Could Not Solve'}
                {history[history.length - 1]?.outcome === 'solved' && (
                  <span className={styles.verdictSub}> · Next problem will be harder</span>
                )}
                {history[history.length - 1]?.outcome !== 'solved' && (
                  <span className={styles.verdictSub}> · Next problem will be easier</span>
                )}
              </div>
              <div className={styles.afterBtns}>
                <button className="btn btn-accent" onClick={goNext}>
                  {history.length >= TOTAL_ROUNDS ? 'See Results' : 'Next Problem →'}
                </button>
                <button className="btn btn-ghost" onClick={finish}>Finish</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function rankColor(rank) {
  return { Newbie: '#6b7a8d', Pupil: '#16a34a', Specialist: '#1a7fd4', Expert: '#7c3aed', Master: '#d97706' }[rank] || '#6b7a8d';
}
