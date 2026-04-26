import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ALL_PROBLEMS, TOPICS } from '../../data/problems';
import styles from './ProblemSearch.module.css';

const PAGE_SIZE = 8;

export default function ProblemSearch() {
  const { bookmarks, toggleBookmark, problemState, setProblemStatus, triggerDailyTask, comments, loadComments, addComment, user, votes, toggleUpvote } = useApp();
  const [query, setQuery] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [difficulty, setDifficulty] = useState(2);
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (expanded) loadComments(expanded);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const DIFF_LABELS = ['Easy only', 'Easy + Medium', 'All difficulties', 'Hard only'];
  const DIFF_FILTERS = [['easy'], ['easy', 'medium'], ['easy', 'medium', 'hard'], ['hard']];

  const results = ALL_PROBLEMS.filter(p => {
    const matchQ = !query || p.name.toLowerCase().includes(query.toLowerCase());
    const matchT = !topicFilter || p.topicId === topicFilter;
    const matchD = DIFF_FILTERS[difficulty].includes(p.difficulty);
    return matchQ && matchT && matchD;
  });

  const paged = results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(results.length / PAGE_SIZE);

  function search() {
    setQuery(inputVal);
    setPage(0);
    triggerDailyTask('search_problem');
  }

  function clear() {
    setInputVal('');
    setQuery('');
    setPage(0);
  }

  function toggleComments(id) {
    setExpanded(prev => prev === id ? null : id);
    setCommentText('');
  }

  function submitComment(problemId) {
    if (!commentText.trim()) return;
    addComment(problemId, commentText);
    setCommentText('');
  }

  function fmtTime(ts) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Problem Search</h2>

      <div className={styles.filters}>
        <div className={styles.searchRow}>
          <input
            type="text"
            placeholder="Search problems..."
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            className={styles.searchInput}
          />
          <button className="btn btn-accent" onClick={search}>Search</button>
          <button className="btn btn-ghost" onClick={clear}>Clear</button>
        </div>

        <div className={styles.filterRow}>
          <select value={topicFilter} onChange={e => { setTopicFilter(e.target.value); setPage(0); }} style={{ flex: 1, maxWidth: 260 }}>
            <option value="">All Topics</option>
            {TOPICS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div className={styles.diffSlider}>
            <span className={styles.diffLabel}>Difficulty: {DIFF_LABELS[difficulty]}</span>
            <input type="range" min={0} max={3} value={difficulty}
              onChange={e => { setDifficulty(+e.target.value); setPage(0); }}
              className={styles.slider} />
          </div>
        </div>
      </div>

      <div className={styles.resultsMeta}>
        Showing {paged.length > 0 ? page * PAGE_SIZE + 1 : 0}–{Math.min((page + 1) * PAGE_SIZE, results.length)} out of {results.length} results
      </div>

      <div className={styles.resultsList}>
        {paged.length === 0 && <div className={styles.empty}>No problems match your filters.</div>}
        {paged.map(p => {
          const status = problemState[p.id]?.status || 'untouched';
          const isBookmarked = bookmarks.includes(p.id);
          const isExpanded = expanded === p.id;
          const problemComments = comments[p.id] || [];

          return (
            <div key={p.id} className={styles.problemCard}
              style={
                status === 'solved'   ? { borderLeftColor: '#16a34a', borderLeftWidth: 3 } :
                status === 'attempted'? { borderLeftColor: 'var(--orange)', borderLeftWidth: 3 } : {}
              }
            >
              {/* Problem row */}
              <div className={styles.cardMain}>
                <div className={styles.cardLeft}>
                  <span className={styles.problemName}>{p.name}</span>
                  <div className={styles.cardMeta}>
                    <span className={`tag tag-${p.difficulty}`}>{p.difficulty}</span>
                    <span className={styles.topicTag}>{p.topic}</span>
                  </div>
                </div>
                <div className={styles.cardRight}>
                  <button
                    className={`${styles.iconBtn} ${votes[p.id + '_voted'] ? styles.iconBtnActive : ''}`}
                    onClick={() => toggleUpvote(p.id)} title="Upvote"
                  >
                    ▲ {votes[p.id] || 0}
                  </button>
                  <button
                    className={`${styles.iconBtn} ${isBookmarked ? styles.iconBtnBookmarked : ''}`}
                    onClick={() => toggleBookmark(p.id)} title="Bookmark"
                  >
                    {isBookmarked ? '★' : '☆'}
                  </button>
                  <button
                    className={`${styles.iconBtn} ${isExpanded ? styles.iconBtnActive : ''}`}
                    onClick={() => toggleComments(p.id)}
                    title="Comments"
                  >
                    💬 {problemComments.length || ''}
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: 12, padding: '4px 10px' }}
                    onClick={() => setProblemStatus(p.id, status === 'solved' ? 'untouched' : 'solved')}
                  >
                    {status === 'solved' ? '✓ Solved' : 'Mark Solved'}
                  </button>
                </div>
              </div>

              {/* Comments panel */}
              {isExpanded && (
                <div className={styles.commentsPanel}>
                  <div className={styles.commentsList}>
                    {problemComments.length === 0 && (
                      <div className={styles.noComments}>No comments yet. Be the first!</div>
                    )}
                    {problemComments.map((c, i) => (
                      <div key={i} className={styles.commentRow}>
                        <div className={styles.commentAvatar}>{c.avatar || c.user[0]}</div>
                        <div className={styles.commentBody}>
                          <div className={styles.commentMeta}>
                            <span className={styles.commentUser}>{c.user}</span>
                            <span className={styles.commentTime}>{fmtTime(c.ts)}</span>
                          </div>
                          <div className={styles.commentText}>{c.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.commentInput}>
                    <div className={styles.commentAvatar}>{user.avatar}</div>
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && submitComment(p.id)}
                      className={styles.commentField}
                    />
                    <button
                      className="btn btn-accent"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => submitComment(p.id)}
                      disabled={!commentText.trim()}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className="btn btn-ghost" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>← Prev</button>
          <span className={styles.pageNum}>Page {page + 1} / {totalPages}</span>
          <button className="btn btn-ghost" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Next →</button>
        </div>
      )}
    </div>
  );
}
