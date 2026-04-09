import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../supabase'

export function useRecipes(currentUser) {
  const [recipesData, setRecipesData]   = useState([])
  const [favorites, setFavorites]       = useState([])
  const [recipeHistory, setRecipeHistory] = useState([])
  const [ratings, setRatings]           = useState({})
  const [loading, setLoading]           = useState(true)

  const userId = currentUser?.id

  // ── Recipes (realtime) ──────────────────────────────────────
  useEffect(() => {
    async function getRecipes() {
      const { data, error } = await supabase.from('recipes').select('*')
      if (!error) setRecipesData(data || [])
      setLoading(false)
    }
    getRecipes()

    const channel = supabase
      .channel('recipes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, () => {
        getRecipes()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  // ── Favorites (realtime) ────────────────────────────────────
  useEffect(() => {
    if (!userId) { setFavorites([]); return }

    async function getFavorites() {
      const { data } = await supabase
        .from('favorites')
        .select('recipeId')
        .eq('userId', userId)
      setFavorites((data || []).map(f => f.recipeId))
    }
    getFavorites()

    const channel = supabase
      .channel('favorites-changes-' + userId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites' }, () => {
        getFavorites()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])

  // ── History (realtime) ──────────────────────────────────────
  useEffect(() => {
    if (!userId) { setRecipeHistory([]); return }

    async function getHistory() {
      const { data } = await supabase
        .from('histories')
        .select('*, recipes(*)')
        .eq('userId', userId)
        .order('visitedAt', { ascending: false })
        .limit(20)
      setRecipeHistory((data || []).map(h => ({
        id: h.recipeId,
        title: h.recipes?.title,
        image: h.recipes?.image,
        visitedAt: new Date(h.visitedAt).toLocaleString('id-ID'),
      })))
    }
    getHistory()

    const channel = supabase
      .channel('history-changes-' + userId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'histories' }, () => {
        getHistory()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])

  // ── Ratings (realtime) ──────────────────────────────────────
  useEffect(() => {
    async function getRatings() {
      const { data } = await supabase.from('ratings').select('recipeId, star, userId')
      if (!data) return
      const map = {}
      data.forEach(r => {
        if (!map[r.recipeId]) map[r.recipeId] = { total: 0, count: 0, userStar: null }
        map[r.recipeId].total += r.star
        map[r.recipeId].count += 1
        if (r.userId === userId) map[r.recipeId].userStar = r.star
      })
      const result = {}
      Object.keys(map).forEach(id => {
        result[id] = map[id].userStar ?? Math.round(map[id].total / map[id].count)
      })
      setRatings(result)
    }
    getRatings()

    const channel = supabase
      .channel('ratings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ratings' }, () => {
        getRatings()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])

  // ── Toggle Favorite ─────────────────────────────────────────
  const toggleFavorite = useCallback(async (recipeId) => {
    if (!userId) return
    const isFav = favorites.includes(recipeId)
    if (isFav) {
      await supabase.from('favorites')
        .delete().eq('userId', userId).eq('recipeId', recipeId)
    } else {
      await supabase.from('favorites')
        .insert([{ userId, recipeId }])
    }
  }, [userId, favorites])

  // ── Add to History ──────────────────────────────────────────
  const addToHistory = useCallback(async (recipe) => {
    if (!userId) return
    await supabase.from('histories')
      .delete().eq('userId', userId).eq('recipeId', recipe.id)
    await supabase.from('histories')
      .insert([{ userId, recipeId: recipe.id, visitedAt: new Date().toISOString() }])
  }, [userId])

  // ── Clear History ───────────────────────────────────────────
  const clearHistory = useCallback(async () => {
    if (!userId) return
    await supabase.from('histories').delete().eq('userId', userId)
  }, [userId])

  // ── Handle Rate ─────────────────────────────────────────────
  const handleRate = useCallback(async (recipeId, star) => {
    if (!userId) return
    await supabase.from('ratings')
      .upsert([{ userId, recipeId, star }], { onConflict: 'userId,recipeId' })
  }, [userId])

  // ── CRUD Recipes ────────────────────────────────────────────
  const createRecipe = async (data) => {
    const { data: saved, error } = await supabase
      .from('recipes').insert([data]).select()
    if (!error) setRecipesData(prev => [...prev, saved[0]])
  }

  const updateRecipe = async (id, data) => {
    const { data: updated, error } = await supabase
      .from('recipes').update(data).eq('id', id).select()
    if (!error) setRecipesData(prev => prev.map(r => r.id === id ? updated[0] : r))
  }

  const deleteRecipe = async (id) => {
    await supabase.from('recipes').delete().eq('id', id)
    setRecipesData(prev => prev.filter(r => r.id !== id))
  }

  return {
    recipesData, favorites, recipeHistory, ratings, loading,
    toggleFavorite, addToHistory, clearHistory, handleRate,
    createRecipe, updateRecipe, deleteRecipe,
  }
}

export function useFilteredRecipes(recipesData, { filters, showFavorites, favorites, selectedIngredients }) {
  return useMemo(() => {
    let result = recipesData

    if (showFavorites) {
      result = result.filter(r => favorites.includes(r.id))
    } else {
      if (filters.category)    result = result.filter(r => r.category === filters.category)
      if (filters.subCategory) result = result.filter(r => r.subCategory === filters.subCategory)
      if (filters.level)       result = result.filter(r => r.level === filters.level)
      if (filters.budget)      result = result.filter(r => r.budget === filters.budget)
    }

    if (selectedIngredients.length > 0) {
      result = result.filter(r =>
        r.ingredients?.some(i =>
          selectedIngredients.some(s =>
            (typeof i === 'string' ? i : i.name ?? '').toLowerCase().includes(s.toLowerCase())
          )
        )
      )
    }

    return result
  }, [recipesData, filters, showFavorites, favorites, selectedIngredients])
}