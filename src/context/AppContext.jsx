import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import { ALL_PROBLEMS } from '../data/problems';

const AppContext = createContext(null);

const COIN_MAP = { easy: 10, medium: 25, hard: 50 };

const DAILY_TASKS_DEF = [
  { id: 'solve_easy',     label: 'Solve 1 easy problem',  reward: 15, icon: '✓' },
  { id: 'visit_arena',    label: 'Visit the Arena',        reward: 10, icon: '⚔' },
  { id: 'search_problem', label: 'Search for a problem',   reward: 5,  icon: '⊕' },
];

export function AppProvider({ children }) {
  const [token, setTokenRaw] = useState(() => localStorage.getItem('pa_token'));
  const [user, setUserData]  = useState(null);
  const [problemState, setProblemStateData] = useState({});
  const [bookmarks, setBookmarksData]       = useState([]);
  const [votes, setVotesData]               = useState({});
  const [dailyState, setDailyStateData]     = useState({ date: '', completed: {} });
  const [readNewsIds, setReadNewsIdsData]   = useState([]);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [comments, setCommentsData]         = useState({});
  const [drafts, setDraftsData]             = useState([]);
  const [inventory, setInventoryData]       = useState([]);
  const [authLoading, setAuthLoading]       = useState(!!localStorage.getItem('pa_token'));

  function setToken(t) {
    setTokenRaw(t);
    if (t) localStorage.setItem('pa_token', t);
    else localStorage.removeItem('pa_token');
  }

  // Load all user data when token changes
  useEffect(() => {
    if (!token) { setAuthLoading(false); return; }
    setAuthLoading(true);

    Promise.all([
      api.getMe(),
      api.getProblemStatuses(),
      api.getBookmarks(),
      api.getDailyTasks(),
      api.getNews(),
      api.getUpvotes(),
      api.getPurchases(),
    ]).then(([meRes, statusRes, bookmarkRes, dailyRes, newsRes, upvoteRes, purchaseRes]) => {
      setUserData(meRes.user);
      setProblemStateData(statusRes.statuses);
      setBookmarksData(bookmarkRes.bookmarks);
      setDailyStateData(dailyRes.state);
      setReadNewsIdsData(newsRes.readIds);
      setUnreadCount(newsRes.unreadCount);
      setVotesData(upvoteRes.votes);
      setInventoryData(purchaseRes.itemIds);
    }).catch(() => {
      setToken(null);
    }).finally(() => {
      setAuthLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  async function login(credentials) {
    const { token: t, user: u } = await api.login(credentials);
    setToken(t);
    setUserData(u);
  }

  async function register(data) {
    const { token: t, user: u } = await api.register(data);
    setToken(t);
    setUserData(u);
  }

  function logout() {
    setToken(null);
    setUserData(null);
    setProblemStateData({});
    setBookmarksData([]);
    setVotesData({});
    setDailyStateData({ date: '', completed: {} });
    setReadNewsIdsData([]);
    setCommentsData({});
    setDraftsData([]);
    setInventoryData([]);
    setUnreadCount(0);
  }

  // ── Profile ───────────────────────────────────────────────────────────────
  function setUser(updater) {
    setUserData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      api.updateMe({
        avatar: next.avatar, avatarBg: next.avatarBg,
        country: next.country, rank: next.rank, diagnostic: next.diagnostic,
      }).catch(() => {});
      return next;
    });
  }

  function getAvatarStyle() {
    return user?.avatarBg ? { background: user.avatarBg, color: '#fff', borderColor: user.avatarBg } : {};
  }

  // ── Problems ──────────────────────────────────────────────────────────────
  async function setProblemStatus(problemId, status) {
    const prev = problemState[problemId];
    if (prev?.status === status) return;
    setProblemStateData(s => ({ ...s, [problemId]: { ...(s[problemId] || {}), status } }));
    try {
      const res = await api.setProblemStatus(problemId, status);
      if (res.coins != null) setUserData(u => ({ ...u, coins: res.coins }));
      if (res.dailyState) setDailyStateData(res.dailyState);
    } catch {
      setProblemStateData(s => ({ ...s, [problemId]: prev || {} }));
    }
  }

  function countSolvedByDifficulty() {
    const result = { easy: 0, medium: 0, hard: 0 };
    ALL_PROBLEMS.forEach(p => {
      if (problemState[p.id]?.status === 'solved') result[p.difficulty]++;
    });
    return result;
  }

  function totalSolved() {
    return Object.values(problemState).filter(v => v.status === 'solved').length;
  }

  // ── Bookmarks ─────────────────────────────────────────────────────────────
  async function toggleBookmark(problemId) {
    const was = bookmarks.includes(problemId);
    setBookmarksData(prev => was ? prev.filter(id => id !== problemId) : [...prev, problemId]);
    try {
      await api.toggleBookmark(problemId);
    } catch {
      setBookmarksData(prev => was ? [...prev, problemId] : prev.filter(id => id !== problemId));
    }
  }

  // ── Upvotes ───────────────────────────────────────────────────────────────
  async function toggleUpvote(problemId) {
    const was = votes[problemId + '_voted'];
    setVotesData(v => ({
      ...v,
      [problemId]: (v[problemId] || 0) + (was ? -1 : 1),
      [problemId + '_voted']: !was,
    }));
    try {
      const res = await api.toggleUpvote(problemId);
      setVotesData(v => ({ ...v, [problemId]: res.total, [problemId + '_voted']: res.voted }));
    } catch {
      setVotesData(v => ({
        ...v,
        [problemId]: (v[problemId] || 0) + (was ? 1 : -1),
        [problemId + '_voted']: was,
      }));
    }
  }

  // ── Comments ──────────────────────────────────────────────────────────────
  async function loadComments(problemId) {
    if (comments[problemId]) return;
    try {
      const res = await api.getComments(problemId);
      setCommentsData(prev => ({ ...prev, [problemId]: res.comments }));
    } catch {}
  }

  async function addComment(problemId, text) {
    if (!text.trim()) return;
    const optimistic = { user: user.name, avatar: user.avatar, text: text.trim(), ts: Date.now() };
    setCommentsData(prev => ({ ...prev, [problemId]: [...(prev[problemId] || []), optimistic] }));
    try {
      const res = await api.addComment(problemId, text);
      setCommentsData(prev => ({
        ...prev,
        [problemId]: [...(prev[problemId] || []).slice(0, -1), res.comment],
      }));
    } catch {
      setCommentsData(prev => ({
        ...prev,
        [problemId]: (prev[problemId] || []).slice(0, -1),
      }));
    }
  }

  // ── Daily tasks ───────────────────────────────────────────────────────────
  async function completeDailyTask(taskId) {
    if (dailyState.completed?.[taskId]) return;
    const task = DAILY_TASKS_DEF.find(t => t.id === taskId);
    if (!task) return;
    setDailyStateData(prev => ({ ...prev, completed: { ...prev.completed, [taskId]: true } }));
    setUserData(u => ({ ...u, coins: (u?.coins || 0) + task.reward }));
    try {
      const res = await api.completeTask(taskId);
      if (res.coins != null) setUserData(u => ({ ...u, coins: res.coins }));
      if (res.state) setDailyStateData(res.state);
    } catch {}
  }

  function triggerDailyTask(taskId) { completeDailyTask(taskId); }

  // ── News ──────────────────────────────────────────────────────────────────
  async function markAllNewsRead() {
    try {
      const res = await api.markAllRead();
      setReadNewsIdsData(res.readIds);
      setUnreadCount(0);
    } catch {}
  }

  // ── Shop ──────────────────────────────────────────────────────────────────
  async function purchaseItem(item) {
    const cost = item.salePrice ?? item.price;
    if ((user?.coins || 0) < cost) return { error: 'Not enough coins' };
    if (inventory.includes(item.id)) return { error: 'Already owned' };
    setUserData(u => ({ ...u, coins: u.coins - cost }));
    setInventoryData(prev => [...prev, item.id]);
    try {
      const res = await api.purchase(item.id);
      if (res.coins != null) setUserData(u => ({ ...u, coins: res.coins }));
      return { success: true };
    } catch (err) {
      setUserData(u => ({ ...u, coins: u.coins + cost }));
      setInventoryData(prev => prev.filter(id => id !== item.id));
      return { error: err.message };
    }
  }

  // ── Drafts ────────────────────────────────────────────────────────────────
  async function loadDrafts() {
    const res = await api.getMyDrafts();
    setDraftsData(res.drafts);
  }

  async function saveDraft(data) {
    const res = await api.createDraft(data);
    setDraftsData(prev => [...prev, res.draft]);
    return res.draft;
  }

  async function updateDraft(id, data) {
    setDraftsData(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    try { await api.updateDraft(id, data); } catch {}
  }

  async function deleteDraft(id) {
    setDraftsData(prev => prev.filter(d => d.id !== id));
    try { await api.deleteDraft(id); } catch {}
  }

  const contextValue = useMemo(() => ({
    token, login, register, logout, authLoading,
    user, setUser, getAvatarStyle,
    problemState, setProblemStatus, countSolvedByDifficulty, totalSolved,
    bookmarks, toggleBookmark,
    votes, toggleUpvote,
    readNewsIds, markAllNewsRead, unreadCount,
    dailyState, dailyTasksDef: DAILY_TASKS_DEF, completeDailyTask, triggerDailyTask,
    comments, loadComments, addComment,
    drafts, setDrafts: setDraftsData, loadDrafts, saveDraft, updateDraft, deleteDraft,
    inventory, purchaseItem,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [token, user, problemState, bookmarks, votes, dailyState, readNewsIds, unreadCount, comments, drafts, inventory, authLoading]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() { return useContext(AppContext); }
