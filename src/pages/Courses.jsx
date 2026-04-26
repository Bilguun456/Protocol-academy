import { useState } from 'react';
import { TOPICS } from '../data/problems';
import styles from './Courses.module.css';

const COURSE_CONTENT = {
  intro: {
    readable: {
      text: `Introductory problems are designed to get you familiar with competitive programming workflows: reading input, performing computations, and outputting the answer within time limits.\n\nKey concepts: basic I/O, loops, conditionals, integer arithmetic, modular arithmetic.\n\nStart with "Weird Algorithm" — simulate the Collatz conjecture. Notice how the answer always terminates (unproven but empirically true for small inputs). Implement simply, don't over-engineer.`,
      quiz: [
        { q: 'What is the Collatz sequence step for an even number n?', a: 'n / 2' },
        { q: 'What value does the Collatz sequence eventually reach?', a: '1' },
      ],
    },
    video: { title: 'Intro to Competitive Programming', ytId: 'dQw4w9WgXcQ' },
  },
  sorting: {
    readable: {
      text: `Sorting and searching are foundational skills. Most problems require you to sort data and apply binary search or a two-pointer technique.\n\nKey concepts: std::sort (O(n log n)), binary search (O(log n)), two pointers, multisets.\n\nFor "Apartments": sort applicants and apartments, use two pointers to greedily match them within tolerance k.`,
      quiz: [
        { q: 'Time complexity of std::sort?', a: 'O(n log n)' },
        { q: 'Two-pointer technique works best when data is?', a: 'Sorted' },
      ],
    },
    video: { title: 'Sorting & Binary Search', ytId: 'dQw4w9WgXcQ' },
  },
  dp: {
    readable: {
      text: `Dynamic programming solves problems by breaking them into overlapping subproblems and storing solutions.\n\nKey concepts: memoization vs. tabulation, state design, 1D/2D DP, knapsack, LIS.\n\nFor "Dice Combinations": dp[i] = number of ways to reach sum i. dp[0]=1, dp[i] = sum of dp[i-j] for j in 1..6.`,
      quiz: [
        { q: 'What is memoization?', a: 'Caching subproblem results top-down' },
        { q: 'Knapsack base case?', a: 'dp[0] = 1 (one way to make sum 0)' },
      ],
    },
    video: { title: 'Dynamic Programming Fundamentals', ytId: 'dQw4w9WgXcQ' },
  },
  graphs: {
    readable: {
      text: `Graphs model relationships between entities. BFS finds shortest path in unweighted graphs. DFS explores all reachable nodes. Dijkstra handles weighted shortest paths.\n\nKey concepts: adjacency list, BFS, DFS, Dijkstra, Union-Find.\n\nFor "Counting Rooms": floodfill (BFS/DFS) on a grid, count connected components of floor tiles.`,
      quiz: [
        { q: 'BFS uses which data structure?', a: 'Queue' },
        { q: 'Dijkstra fails with?', a: 'Negative edge weights' },
      ],
    },
    video: { title: 'Graph Algorithms from Scratch', ytId: 'dQw4w9WgXcQ' },
  },
  range: {
    readable: {
      text: `Range queries answer questions about subarrays or subsets efficiently. Prefix sums answer static range sum queries in O(1). Segment trees handle dynamic queries in O(log n).\n\nKey concepts: prefix sums, difference arrays, segment trees, Fenwick trees.\n\nFor "Static Range Sum Queries": build prefix array, answer = prefix[r] - prefix[l-1].`,
      quiz: [
        { q: 'Prefix sum query time complexity?', a: 'O(1)' },
        { q: 'Segment tree update time?', a: 'O(log n)' },
      ],
    },
    video: { title: 'Segment Trees & BITs', ytId: 'dQw4w9WgXcQ' },
  },
  trees: {
    readable: {
      text: `Trees are connected acyclic graphs. Tree DP, LCA, and euler tour are essential techniques.\n\nKey concepts: rooted trees, DFS order, euler tour, LCA, heavy-light decomposition.\n\nFor "Tree Diameter": run DFS from any node to find the farthest node u, then DFS from u to find the diameter.`,
      quiz: [
        { q: 'How many edges does a tree with n nodes have?', a: 'n - 1' },
        { q: 'Tree diameter algorithm requires how many DFS runs?', a: '2' },
      ],
    },
    video: { title: 'Tree Algorithms Masterclass', ytId: 'dQw4w9WgXcQ' },
  },
  math: {
    readable: {
      text: `Mathematical topics in CP include number theory, combinatorics, and modular arithmetic.\n\nKey concepts: prime sieve, GCD/LCM, modular exponentiation, Euler's totient.\n\nFor "Counting Divisors": factorize n = p1^a1 * p2^a2 * ..., divisor count = (a1+1)(a2+1)...`,
      quiz: [
        { q: 'Sieve of Eratosthenes time complexity?', a: 'O(n log log n)' },
        { q: 'GCD(a, b) using Euclidean algorithm?', a: 'GCD(b, a mod b) until b=0' },
      ],
    },
    video: { title: 'Number Theory for CP', ytId: 'dQw4w9WgXcQ' },
  },
};

export default function Courses() {
  const [mode, setMode] = useState(null); // null = picker, 'video' | 'readable'
  const [topicId, setTopicId] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizRevealed, setQuizRevealed] = useState({});

  const topic = TOPICS.find(t => t.id === topicId);
  const content = topicId ? COURSE_CONTENT[topicId] : null;

  if (!mode) {
    return (
      <div className="page-container">
        <h1 className={styles.title}>Courses</h1>
        <p className={styles.sub}>Choose your learning format.</p>
        <div className={styles.modePicker}>
          <button className={styles.modeCard} onClick={() => setMode('readable')}>
            <span className={styles.modeIcon}>📖</span>
            <div className={styles.modeLabel}>Readable</div>
            <div className={styles.modeDesc}>Text explanations, examples, mini quiz per topic</div>
          </button>
          <button className={styles.modeCard} onClick={() => setMode('video')}>
            <span className={styles.modeIcon}>▶</span>
            <div className={styles.modeLabel}>Video</div>
            <div className={styles.modeDesc}>YouTube video per topic with embedded player</div>
          </button>
        </div>
      </div>
    );
  }

  if (!topicId) {
    return (
      <div className="page-container">
        <div className={styles.breadcrumb}>
          <button className="btn btn-ghost" onClick={() => setMode(null)}>← Back</button>
          <span className={styles.breadMode}>{mode === 'readable' ? '📖 Readable' : '▶ Video'}</span>
        </div>
        <h2 className={styles.sectionTitle}>Select a Topic</h2>
        <div className={styles.topicGrid}>
          {TOPICS.map(t => (
            <button key={t.id} className={styles.topicBtn} onClick={() => setTopicId(t.id)}>
              <span className={styles.topicBtnName}>{t.name}</span>
              <span className={styles.topicBtnCount}>{t.problems.length} problems →</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'video') {
    return (
      <div className="page-container">
        <div className={styles.breadcrumb}>
          <button className="btn btn-ghost" onClick={() => setTopicId(null)}>← Topics</button>
          <span className={styles.breadMode}>{topic?.name}</span>
        </div>
        <h2 className={styles.videoTitle}>{content?.video.title}</h2>
        <div className={styles.videoEmbed}>
          <div className={styles.videoPlaceholder}>
            <span className={styles.playIcon}>▶</span>
            <p>YouTube embed placeholder</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {content?.video.title}
            </p>
          </div>
        </div>
        <div className={styles.relatedProblems}>
          <div className="section-title">Related Problems</div>
          {topic?.problems.slice(0, 4).map(p => (
            <div key={p.id} className={styles.relatedRow}>
              <span className={styles.relatedName}>{p.name}</span>
              <span className={`tag tag-${p.difficulty}`}>{p.difficulty}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Readable mode
  const paragraphs = content?.readable.text.split('\n\n') || [];

  return (
    <div className="page-container">
      <div className={styles.breadcrumb}>
        <button className="btn btn-ghost" onClick={() => setTopicId(null)}>← Topics</button>
        <span className={styles.breadMode}>{topic?.name}</span>
      </div>

      <div className={styles.readableLayout}>
        <div className={styles.readContent}>
          <h2 className={styles.readTitle}>{topic?.name}</h2>
          {paragraphs.map((para, i) => (
            <p key={i} className={styles.readPara}>{para}</p>
          ))}

          <div className="divider" />
          <div className="section-title">Example Problems</div>
          {topic?.problems.slice(0, 3).map(p => (
            <div key={p.id} className={styles.exampleProblem}>
              <span className={styles.relatedName}>{p.name}</span>
              <span className={`tag tag-${p.difficulty}`}>{p.difficulty}</span>
            </div>
          ))}

          <div className="divider" />
          <div className="section-title">Mini Quiz</div>
          <div className={styles.quiz}>
            {content?.readable.quiz.map((item, i) => (
              <div key={i} className={styles.quizItem}>
                <div className={styles.quizQ}>Q{i + 1}: {item.q}</div>
                {quizRevealed[i] ? (
                  <div className={styles.quizA}>→ {item.a}</div>
                ) : (
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: 12, marginTop: 6 }}
                    onClick={() => setQuizRevealed(r => ({ ...r, [i]: true }))}
                  >
                    Reveal Answer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
