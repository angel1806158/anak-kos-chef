// ============================
// API DIMATIKAN TOTAL
// (SEMUA PAKAI SUPABASE)
// ============================

// AUTH (dummy biar ga error)
export const authAPI = {
  register: async () => ({ success: true }),
  login: async () => ({
    user: { name: "User", identifier: "user@gmail.com" },
    token: "dummy-token"
  }),
};

// RECIPES (tidak dipakai lagi)
export const recipeAPI = {
  getAll: async () => []
};

// FAVORITES (sementara kosong)
export const favoriteAPI = {
  getAll: async () => [],
  toggle: async () => ({})
};

// HISTORY (sementara kosong)
export const historyAPI = {
  getAll: async () => [],
  add: async () => ({}),
  clear: async () => ({})
};

// RATINGS (sementara kosong)
export const ratingAPI = {
  getAll: async () => ({}),
  set: async () => ({})
};

// ADMIN (dummy)
export const adminAPI = {
  getDashboardStats: async () => ({}),
  getRecipeStats: async () => ({})
};

// COMMENTS (dummy)
export const commentAPI = {
  getByRecipe: async () => [],
  send: async () => ({}),
  reply: async () => ({}),
  delete: async () => ({})
};