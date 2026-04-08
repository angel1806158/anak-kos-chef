const BASE = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const authHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ─── AUTH ────────────────────────────────────────────────────
export const authAPI = {
  register: async ({ name, identifier, password }) => {
    const res  = await fetch(`${BASE}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal mendaftar');
    return data;
  },

  login: async ({ identifier, password }) => {
    const res  = await fetch(`${BASE}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login gagal');
    return data;
  },
};

// ─── RECIPES ─────────────────────────────────────────────────
export const recipeAPI = {
  getAll: async () => {
    const res = await fetch(`${BASE}/recipes`);
    if (!res.ok) throw new Error('Gagal memuat resep');
    return res.json();
  },

  create: async (recipeData) => {
    const res  = await fetch(`${BASE}/recipes`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify(recipeData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menyimpan resep');
    return data;
  },

  update: async (id, recipeData) => {
    const res  = await fetch(`${BASE}/recipes/${id}`, {
      method:  'PUT',
      headers: authHeaders(),
      body:    JSON.stringify(recipeData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal mengupdate resep');
    return data;
  },

  delete: async (id) => {
    const res = await fetch(`${BASE}/recipes/${id}`, {
      method:  'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Gagal menghapus resep');
    }
    return res.json();
  },
};

// ─── FAVORITES ───────────────────────────────────────────────
export const favoriteAPI = {
  // Returns: [recipeId, recipeId, ...]
  getAll: async () => {
    const res = await fetch(`${BASE}/favorites`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Gagal memuat favorit');
    return res.json();
  },

  // Returns: { added: true/false, recipeId }
  toggle: async (recipeId) => {
    const res = await fetch(`${BASE}/favorites/${recipeId}`, {
      method:  'POST',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Gagal update favorit');
    return res.json();
  },
};

// ─── HISTORY ─────────────────────────────────────────────────
export const historyAPI = {
  // Returns: [{ id, title, image, visitedAt }, ...]
  getAll: async () => {
    const res = await fetch(`${BASE}/history`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Gagal memuat riwayat');
    return res.json();
  },

  add: async (recipeId) => {
    const res = await fetch(`${BASE}/history`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify({ recipeId }),
    });
    if (!res.ok) throw new Error('Gagal menyimpan riwayat');
    return res.json();
  },

  clear: async () => {
    const res = await fetch(`${BASE}/history`, {
      method:  'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Gagal menghapus riwayat');
    return res.json();
  },
};

// ─── RATINGS ─────────────────────────────────────────────────
export const ratingAPI = {
  // Returns: { "1": 4, "5": 3, ... }
  getAll: async () => {
    const res = await fetch(`${BASE}/ratings`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Gagal memuat rating');
    return res.json();
  },

  // star: 1-5 | star: 0 = hapus rating
  set: async (recipeId, star) => {
    const res = await fetch(`${BASE}/ratings/${recipeId}`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify({ star }),
    });
    if (!res.ok) throw new Error('Gagal menyimpan rating');
    return res.json();
  },
};

// ─── ADMIN ───────────────────────────────────────────────────
export const adminAPI = {
  getDashboardStats: async () => {
    const res = await fetch(`${BASE}/admin/stats`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Gagal memuat statistik');
    return res.json();
  },

  getRecipeStats: async () => {
    const res = await fetch(`${BASE}/admin/recipe-stats`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Gagal memuat statistik resep');
    return res.json();
  },
};

// ─── COMMENTS ────────────────────────────────────────────────
export const commentAPI = {
  getByRecipe: async (recipeId) => {
    const res = await fetch(`${BASE}/comments/${recipeId}`);
    if (!res.ok) throw new Error('Gagal memuat komentar');
    return res.json();
  },

  send: async (recipeId, content, guestName) => {
    const res = await fetch(`${BASE}/comments/${recipeId}`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify({ content, guestName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal mengirim komentar');
    return data;
  },

  reply: async (commentId, reply) => {
    const res = await fetch(`${BASE}/comments/${commentId}/reply`, {
      method:  'PUT',
      headers: authHeaders(),
      body:    JSON.stringify({ reply }),
    });
    if (!res.ok) throw new Error('Gagal menyimpan balasan');
    return res.json();
  },

  delete: async (commentId) => {
    const res = await fetch(`${BASE}/comments/${commentId}`, {
      method:  'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Gagal menghapus komentar');
    return res.json();
  },
};
