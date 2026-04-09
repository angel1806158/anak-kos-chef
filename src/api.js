import { supabase } from './supabase'

export const authAPI = {
  login: async (identifier, password) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('identifier', identifier)
      .eq('password', password)
    if (error) throw error
    if (!data || data.length === 0) throw new Error('Email atau password salah')
    return { user: data[0], token: 'custom-' + data[0].id }
  },
  register: async (name, identifier, password) => {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('identifier', identifier)
    if (existing && existing.length > 0) throw new Error('Email sudah terdaftar')
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, identifier, password, role: 'user' }])
      .select()
    if (error) throw error
    if (!data || data.length === 0) throw new Error('Gagal membuat akun')
    return { success: true, user: data[0] }
  }
}

// --- Recipes ---
export const recipeAPI = {
  getAll: async (filters = {}) => {
    let query = supabase.from('recipes').select('*')
    if (filters.category)    query = query.eq('category', filters.category)
    if (filters.subCategory) query = query.eq('subCategory', filters.subCategory)
    if (filters.level)       query = query.eq('level', filters.level)
    if (filters.budget)      query = query.eq('budget', filters.budget)
    if (filters.prepTime)    query = query.eq('prepTime', filters.prepTime)
    const { data, error } = await query
    if (error) throw error
    return data || []
  },
  getById: async (id) => {
    const { data, error } = await supabase
      .from('recipes').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },
  create: async (recipe) => {
    const { data, error } = await supabase
      .from('recipes').insert([recipe]).select().single()
    if (error) throw error
    return data
  },
  update: async (id, recipe) => {
    const { data, error } = await supabase
      .from('recipes').update(recipe).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  delete: async (id) => {
    const { error } = await supabase.from('recipes').delete().eq('id', id)
    if (error) throw error
    return { success: true }
  }
}

// --- Favorites ---
export const favoriteAPI = {
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('favorites')
      .select('*, recipes(*)')
      .eq('userId', userId)
    if (error) throw error
    return data || []
  },
  toggle: async (userId, recipeId) => {
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('userId', userId)
      .eq('recipeId', recipeId)
      .single()

    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id)
      return { favorited: false }
    } else {
      await supabase.from('favorites').insert([{ userId, recipeId }])
      return { favorited: true }
    }
  }
}

// --- History ---
export const historyAPI = {
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('histories')
      .select('*, recipes(*)')
      .eq('userId', userId)
      .order('visitedAt', { ascending: false })
    if (error) throw error
    return data || []
  },
  add: async (userId, recipeId) => {
    await supabase.from('histories')
      .delete().eq('userId', userId).eq('recipeId', recipeId)
    const { data, error } = await supabase
      .from('histories')
      .insert([{ userId, recipeId, visitedAt: new Date().toISOString() }])
    if (error) throw error
    return data
  },
  clear: async (userId) => {
    const { error } = await supabase
      .from('histories').delete().eq('userId', userId)
    if (error) throw error
    return { success: true }
  }
}

// --- Ratings ---
export const ratingAPI = {
  getAll: async (recipeId) => {
    const { data, error } = await supabase
      .from('ratings').select('*').eq('recipeId', recipeId)
    if (error) throw error
    const avg = data.length
      ? data.reduce((s, r) => s + r.star, 0) / data.length : 0
    return { ratings: data, average: avg, count: data.length }
  },
  set: async (userId, recipeId, star) => {
    const { data, error } = await supabase
      .from('ratings')
      .upsert([{ userId, recipeId, star }], { onConflict: 'userId,recipeId' })
    if (error) throw error
    return data
  }
}

// --- Comments ---
export const commentAPI = {
  getByRecipe: async (recipeId) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, users(name, avatar, avatarColor)')
      .eq('recipeId', recipeId)
      .order('createdAt', { ascending: true })
    if (error) throw error
    return data || []
  },
  send: async (userId, recipeId, content, guestName = null) => {
    const { data, error } = await supabase
      .from('comments')
      .insert([{ userId, recipeId, content, guestName }])
      .select().single()
    if (error) throw error
    return data
  },
  delete: async (id) => {
    const { error } = await supabase.from('comments').delete().eq('id', id)
    if (error) throw error
    return { success: true }
  }
}

// --- Admin ---
export const adminAPI = {
  getDashboardStats: async () => {
    const [r, u, c, f] = await Promise.all([
      supabase.from('recipes').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('comments').select('*', { count: 'exact', head: true }),
      supabase.from('favorites').select('*', { count: 'exact', head: true }),
    ])
    return {
      totalRecipes:   r.count || 0,
      totalUsers:     u.count || 0,
      totalComments:  c.count || 0,
      totalFavorites: f.count || 0,
    }
  },
  getRecipeStats: async () => {
    const { data, error } = await supabase
      .from('recipes').select('id, title, category')
    if (error) throw error
    return data || []
  }
}