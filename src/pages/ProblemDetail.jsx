import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import styles from './ProblemDetail.module.css';

const COIN_MAP = { easy: 10, medium: 25, hard: 50 };
const LANGUAGES = ['C++', 'Python', 'Java'];

const STARTER_CODE = {
  'C++':    '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    \n    // your code here\n    \n    return 0;\n}',
  'Python': 'import sys\ninput = sys.stdin.readline\n\ndef main():\n    # your code here\n    pass\n\nmain()',
  'Java':   'import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // your code here\n    }\n}',
};

function Confetti() {
  const pieces = useRef(
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${(Math.random() * 1.5).toFixed(2)}s`,
      duration: `${(1.8 + Math.random() * 1.8).toFixed(2)}s`,
      color: ['#00c853', '#1a7fd4', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][i % 6],
      size: `${7 + Math.floor(Math.random() * 8)}px`,
      rotate: Math.random() > 0.5 ? 'rotate(45deg)' : 'rotate(0deg)',
    }))
  );
  return (
    <div className={styles.confettiWrap} aria-hidden="true">
      {pieces.current.map(p => (
        <div
          key={p.id}
          className={styles.confettiPiece}
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            background: p.color,
            width: p.size,
            height: p.size,
            transform: p.rotate,
          }}
        />
      ))}
    </div>
  );
}

export default function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { problemState, setProblemStatus, user } = useApp();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [lang, setLang] = useState('C++');
  const [code, setCode] = useState(STARTER_CODE['C++']);
  const [dialog, setDialog] = useState(null); // null | 'ask' | 'correct' | 'wrong'
  const [showConfetti, setShowConfetti] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.getProblem(id)
      .then(d => { setProblem(d.problem); setError(''); })
      .catch(err => setError(err.message || 'Problem not found'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleLangChange(newLang) {
    setLang(newLang);
    setCode(STARTER_CODE[newLang]);
  }

  function handleSubmit() {
    setDialog('ask');
  }

  async function handleVerdict(passed) {
    setDialog(null);
    if (passed) {
      const coins = COIN_MAP[problem.difficulty] || 10;
      setCoinsEarned(coins);
      await setProblemStatus(problem.id, 'solved');
      setShowConfetti(true);
      setDialog('correct');
      setTimeout(() => setShowConfetti(false), 4000);
    } else {
      setDialog('wrong');
    }
  }

  const status = problemState[id]?.status || 'untouched';

  if (loading) return (
    <div className="page-container" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading problem…</div>
    </div>
  );

  if (error || !problem) return (
    <div className="page-container" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>{error || 'Problem not found'}</div>
      <button className="btn" onClick={() => navigate('/problems')}>← Back to Problems</button>
    </div>
  );

  const hasContent = problem.statement || problem.input_format || problem.sample_input;

  return (
    <div className="page-container">
      {showConfetti && <Confetti />}

      {/* Header */}
      <div className={styles.header}>
        <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/problems')}>
          ← Problems
        </button>
        <div className={styles.meta}>
          <h1 className={styles.title}>{problem.name}</h1>
          <div className={styles.badges}>
            <span className={`tag tag-${problem.difficulty}`}>{problem.difficulty}</span>
            {(problem.category || problem.topic) && (
              <span className={styles.category}>{problem.category || problem.topic}</span>
            )}
            {status === 'solved' && <span className={styles.solvedBadge}>✓ Solved</span>}
          </div>
        </div>
      </div>

      {!hasContent ? (
        <div className={styles.noContent}>
          <p>Full problem statement coming soon.</p>
          <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            This problem can still be marked as solved below once you've worked it out.
          </p>
        </div>
      ) : (
        <div className={styles.problemBody}>
          {problem.statement && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Problem Statement</h2>
              <div className={styles.prose}>{problem.statement}</div>
            </section>
          )}

          {problem.input_format && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Input</h2>
              <div className={styles.prose}>{problem.input_format}</div>
            </section>
          )}

          {problem.output_format && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Output</h2>
              <div className={styles.prose}>{problem.output_format}</div>
            </section>
          )}

          {problem.constraints_text && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Constraints</h2>
              <div className={styles.prose}>{problem.constraints_text}</div>
            </section>
          )}

          {(problem.sample_input || problem.sample_output) && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Example</h2>
              <div className={styles.sampleGrid}>
                <div>
                  <div className={styles.sampleLabel}>Input</div>
                  <pre className={styles.codeBlock}>{problem.sample_input}</pre>
                </div>
                <div>
                  <div className={styles.sampleLabel}>Output</div>
                  <pre className={styles.codeBlock}>{problem.sample_output}</pre>
                </div>
              </div>
            </section>
          )}

          {problem.explanation && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Explanation</h2>
              <div className={styles.prose}>{problem.explanation}</div>
            </section>
          )}
        </div>
      )}

      {/* Code editor */}
      <div className={styles.editorSection}>
        <div className={styles.editorHeader}>
          <span className={styles.sectionTitle} style={{ margin: 0 }}>Your Solution</span>
          <div className={styles.langTabs}>
            {LANGUAGES.map(l => (
              <button
                key={l}
                className={`${styles.langTab} ${lang === l ? styles.langTabActive : ''}`}
                onClick={() => handleLangChange(l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <textarea
          className={styles.editor}
          value={code}
          onChange={e => setCode(e.target.value)}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
        <div className={styles.editorFooter}>
          {status === 'solved' && (
            <span className={styles.alreadySolved}>✓ Already solved — +{COIN_MAP[problem.difficulty]} coins earned</span>
          )}
          <button className="btn btn-accent" onClick={handleSubmit} style={{ marginLeft: 'auto' }}>
            Submit Solution
          </button>
        </div>
      </div>

      {/* Dialog overlay */}
      {dialog && (
        <div className={styles.overlay} onClick={() => dialog !== 'ask' && setDialog(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            {dialog === 'ask' && (
              <>
                <div className={styles.modalTitle}>Submit Solution</div>
                <p className={styles.modalText}>
                  Run your code against the sample cases above, then answer honestly:
                </p>
                <p className={styles.modalQuestion}>Did your solution pass all test cases?</p>
                <div className={styles.modalActions}>
                  <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleVerdict(false)}>
                    No — it failed
                  </button>
                  <button className="btn btn-accent" style={{ flex: 1 }} onClick={() => handleVerdict(true)}>
                    Yes — all passed!
                  </button>
                </div>
              </>
            )}

            {dialog === 'correct' && (
              <>
                <div className={styles.modalEmoji}>🎉</div>
                <div className={styles.modalTitle}>Correct!</div>
                <p className={styles.modalText}>
                  Great job! You earned <strong>+{coinsEarned} coins</strong>.
                </p>
                <button className="btn btn-accent" style={{ width: '100%' }} onClick={() => setDialog(null)}>
                  Continue
                </button>
              </>
            )}

            {dialog === 'wrong' && (
              <>
                <div className={styles.modalEmoji}>💪</div>
                <div className={styles.modalTitle}>Keep Going!</div>
                <p className={styles.modalText}>
                  No worries — debugging is part of the process. Read the constraints carefully, check your edge cases, and try again. You've got this!
                </p>
                <button className="btn btn-accent" style={{ width: '100%' }} onClick={() => setDialog(null)}>
                  Back to coding
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
