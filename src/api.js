// ============================
// KILL ALL BACKEND CALLS
// ============================

// BASE DIHAPUS TOTAL
const BASE = ""

export const authAPI = {
  login: async () => ({
    user: { name: "User", identifier: "user@gmail.com" },
    token: "dummy"
  }),
  register: async () => ({ success: true })
}

export const recipeAPI = {
  getAll: async () => [],
  create: async () => ({}),
  update: async () => ({}),
  delete: async () => ({})
}

export const favoriteAPI = {
  getAll: async () => [],
  toggle: async () => ({})
}

export const historyAPI = {
  getAll: async () => [],
  add: async () => ({}),
  clear: async () => ({})
}

export const ratingAPI = {
  getAll: async () => ({}),
  set: async () => ({})
}

export const adminAPI = {
  getDashboardStats: async () => ({}),
  getRecipeStats: async () => ({})
}

export const commentAPI = {
  getByRecipe: async () => [],
  send: async () => ({}),
  reply: async () => ({}),
  delete: async () => ({})
}