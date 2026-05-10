import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import styles from './ProblemDetail.module.css';

const COIN_MAP = { easy: 10, medium: 25, hard: 50 };

const LANG_OPTIONS = [
  { label: 'C++',    id: 54 },
  { label: 'Python', id: 71 },
  { label: 'Java',   id: 62 },
];

const STARTER_CODE = {
  54: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    \n    // your code here\n    \n    return 0;\n}',
  71: 'import sys\ninput = sys.stdin.readline\n\ndef main():\n    # your code here\n    pass\n\nmain()',
  62: 'import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // your code here\n    }\n}',
};

const VERDICT_META = {
  'Accepted':             { color: 'var(--green)', bg: 'rgba(22,163,74,0.08)',  icon: '✓' },
  'Wrong Answer':         { color: 'var(--red)',   bg: 'rgba(220,38,38,0.08)',  icon: '✗' },
  'Time Limit Exceeded':  { color: '#d97706',      bg: 'rgba(217,119,6,0.08)', icon: '⏱' },
  'Compilation Error':    { color: 'var(--red)',   bg: 'rgba(220,38,38,0.08)',  icon: '⚠' },
  'Runtime Error':        { color: 'var(--red)',   bg: 'rgba(220,38,38,0.08)',  icon: '💥' },
};

function verdictMeta(v) {
  return VERDICT_META[v] ?? { color: '#6b7a8d', bg: 'rgba(107,122,141,0.08)', icon: '?' };
}

function Confetti() {
  const pieces = useRef(
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${(Math.random() * 1.5).toFixed(2)}s`,
      duration: `${(1.8 + Math.random() * 1.8).toFixed(2)}s`,
      color: ['#00c853', '#1a7fd4', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][i % 6],
      size: `${7 + Math.floor(Math.random() * 8)}px`,
    }))
  );
  return (
    <div className={styles.confettiWrap} aria-hidden="true">
      {pieces.current.map(p => (
        <div key={p.id} className={styles.confettiPiece} style={{
          left: p.left, animationDelay: p.delay, animationDuration: p.duration,
          background: p.color, width: p.size, height: p.size,
        }} />
      ))}
    </div>
  );
}

export default function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { problemState, setProblemStatus, setUser } = useApp();

  const [problem, setProblem]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [fetchErr, setFetchErr]     = useState('');

  const [langId, setLangId]         = useState(54);
  const [code, setCode]             = useState(STARTER_CODE[54]);

  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr]   = useState('');
  const [result, setResult]         = useState(null); // { verdict, stdout, stderr, time, memory, accepted, coins }
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getProblem(id)
      .then(d => { setProblem(d.problem); setFetchErr(''); })
      .catch(err => setFetchErr(err.message || 'Problem not found'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleLangChange(id) {
    setLangId(id);
    setCode(STARTER_CODE[id]);
    setResult(null);
    setSubmitErr('');
  }

  async function handleSubmit() {
    if (!code.trim() || submitting) return;
    setSubmitting(true);
    setResult(null);
    setSubmitErr('');
    try {
      const data = await api.submit({ code, language_id: langId, problem_id: problem.id });
      setResult(data);
      if (data.accepted) {
        // Sync coins into context if server returned new total
        if (data.coins != null) setUser(u => ({ ...u, coins: data.coins }));
        // Update local problem state
        await setProblemStatus(problem.id, 'solved');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    } catch (err) {
      setSubmitErr(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  const status = problemState[id]?.status || 'untouched';

  if (loading) return (
    <div className="page-container" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading problem…</div>
    </div>
  );

  if (fetchErr || !problem) return (
    <div className="page-container" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>{fetchErr || 'Problem not found'}</div>
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
            You can still write and test your code below — submit once the statement is available.
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
            {LANG_OPTIONS.map(l => (
              <button
                key={l.id}
                className={`${styles.langTab} ${langId === l.id ? styles.langTabActive : ''}`}
                onClick={() => handleLangChange(l.id)}
                disabled={submitting}
              >
                {l.label}
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
          disabled={submitting}
        />
        <div className={styles.editorFooter}>
          {status === 'solved' && !result && (
            <span className={styles.alreadySolved}>✓ Already solved — +{COIN_MAP[problem.difficulty]} coins earned</span>
          )}
          {submitErr && (
            <span className={styles.submitErr}>{submitErr}</span>
          )}
          <button
            className={`btn btn-accent ${styles.submitBtn}`}
            onClick={handleSubmit}
            disabled={submitting || !code.trim()}
          >
            {submitting ? (
              <><span className={styles.spinner} /> Judging…</>
            ) : 'Submit Solution'}
          </button>
        </div>
      </div>

      {/* Verdict panel */}
      {result && (
        <VerdictPanel result={result} difficulty={problem.difficulty} />
      )}
    </div>
  );
}

function VerdictPanel({ result, difficulty }) {
  const { verdict, stdout, stderr, time, memory, accepted, coins } = result;
  const meta = verdictMeta(verdict);
  const [showOutput, setShowOutput] = useState(true);

  return (
    <div className={styles.verdictPanel} style={{ borderColor: meta.color, background: meta.bg }}>
      <div className={styles.verdictHeader}>
        <span className={styles.verdictBadge} style={{ color: meta.color }}>
          {meta.icon} {verdict}
        </span>
        <div className={styles.verdictStats}>
          {time != null && (
            <span className={styles.stat}>⏱ {(time * 1000).toFixed(0)} ms</span>
          )}
          {memory != null && (
            <span className={styles.stat}>📦 {(memory / 1024).toFixed(1)} MB</span>
          )}
          {accepted && coins != null && (
            <span className={styles.coinStat}>+{COIN_MAP[difficulty]} coins earned!</span>
          )}
        </div>
      </div>

      {accepted && (
        <div className={styles.acceptedMsg}>
          Great work! Your solution passed all test cases.
        </div>
      )}

      {(stdout || stderr) && (
        <div className={styles.outputSection}>
          <button
            className={styles.outputToggle}
            onClick={() => setShowOutput(v => !v)}
          >
            {showOutput ? '▼' : '▶'} {stderr ? 'Compiler / Error Output' : 'Program Output'}
          </button>
          {showOutput && (
            <pre className={styles.outputBlock}>
              {stderr || stdout || '(no output)'}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
