const BASE = import.meta.env.VITE_API_URL ?? '';

async function request(path, options = {}) {
  const token = localStorage.getItem('pa_token');
  const res = await fetch(`${BASE}/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw Object.assign(new Error(err.error || 'Request failed'), { status: res.status });
  }
  return res.json();
}

export const api = {
  // Auth
  register: d => request('/auth/register', { method: 'POST', body: JSON.stringify(d) }),
  login:    d => request('/auth/login',    { method: 'POST', body: JSON.stringify(d) }),
  getMe:    () => request('/auth/me'),

  // Problems
  getProblemStatuses: () => request('/problems/status'),
  setProblemStatus:   (id, status) => request(`/problems/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getBookmarks:   () => request('/problems/bookmarks'),
  toggleBookmark: id => request(`/problems/${id}/bookmark`, { method: 'POST' }),
  getUpvotes:     () => request('/problems/upvotes'),
  toggleUpvote:   id => request(`/problems/${id}/upvote`, { method: 'POST' }),

  // Users
  getUser:  username => request(`/users/${username}`),
  updateMe: d => request('/users/me', { method: 'PUT', body: JSON.stringify(d) }),

  // Leaderboard
  getLeaderboard: sort => request(`/leaderboard?sort=${sort}`),

  // Community
  createDraft: d  => request('/community', { method: 'POST', body: JSON.stringify(d) }),
  getMyDrafts: () => request('/community/drafts'),
  updateDraft: (id, d) => request(`/community/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  deleteDraft: id => request(`/community/${id}`, { method: 'DELETE' }),

  // Comments
  getComments: problemId => request(`/comments/${problemId}`),
  addComment:  (problemId, text) => request(`/comments/${problemId}`, { method: 'POST', body: JSON.stringify({ text }) }),

  // Daily tasks
  getDailyTasks: () => request('/daily-tasks'),
  completeTask:  taskId => request(`/daily-tasks/${taskId}/complete`, { method: 'POST' }),

  // News
  getNews:     () => request('/news'),
  markAllRead: () => request('/news/read-all', { method: 'POST' }),

  // Shop
  getShopItems:  () => request('/shop/items'),
  getPurchases:  () => request('/shop/purchases'),
  purchase:      itemId => request(`/shop/purchase/${itemId}`, { method: 'POST' }),
};
