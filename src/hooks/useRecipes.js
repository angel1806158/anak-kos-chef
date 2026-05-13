import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../supabase'

export function useRecipes(currentUser) {
  const [recipesData, setRecipesData]     = useState([])
  const [favorites, setFavorites]         = useState([])
  const [recipeHistory, setRecipeHistory] = useState([])
  const [ratings, setRatings]             = useState({})
  const [loading, setLoading]             = useState(true)

  const userId = currentUser?.id ? Number(currentUser.id) : null

  // ── Recipes (realtime) ──────────────────────────────────────────────
  useEffect(() => {
    async function getRecipes() {
      const { data, error } = await supabase.from('recipes').select('*')
      if (!error) setRecipesData(data || [])
      setLoading(false)
    }
    getRecipes()

    const channel = supabase
      .channel('recipes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, getRecipes)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  // ── Favorites (realtime) ────────────────────────────────────────────
  useEffect(() => {
    if (!userId) { setFavorites([]); return }

    async function getFavorites() {
      const { data } = await supabase
        .from('favorites')
        .select('recipeId')
        .eq('userId', userId)
      setFavorites((data || []).map(f => Number(f.recipeId)))
    }
    getFavorites()

    const channel = supabase
      .channel('favorites-' + userId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites' }, getFavorites)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])

  // ── History (realtime) ──────────────────────────────────────────────
useEffect(() => {
  if (!userId) { setRecipeHistory([]); return }

  async function getHistory() {
    const { data: histData } = await supabase
      .from('histories')
      .select('*')
      .eq('userId', userId)
      .order('visitedAt', { ascending: false })
      .limit(20)

    if (!histData || histData.length === 0) {
      setRecipeHistory([])
      return
    }

    const recipeIds = histData.map(h => h.recipeId)
    const { data: recipeData } = await supabase
      .from('recipes')
      .select('id, title, image')
      .in('id', recipeIds)

    const recipeMap = {}
    recipeData?.forEach(r => { recipeMap[r.id] = r })

    setRecipeHistory(histData.map(h => ({
      id: Number(h.recipeId),
      title: recipeMap[h.recipeId]?.title,
      image: recipeMap[h.recipeId]?.image,
      visitedAt: new Date(h.visitedAt).toLocaleString('id-ID'),
    })))
  }

  getHistory()

  // Realtime channel
  const channel = supabase
    .channel('history-' + userId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'histories' }, getHistory)
    .subscribe()

  // Polling setiap 2 detik sebagai backup
  const interval = setInterval(getHistory, 2000)

  return () => {
    supabase.removeChannel(channel)
    clearInterval(interval)
  }
}, [userId])

  // ── Ratings (realtime) ──────────────────────────────────────────────
  useEffect(() => {
    async function getRatings() {
      const { data } = await supabase.from('ratings').select('recipeId, star, userId')
      if (!data) return

      // Hitung rata-rata per resep, dan simpan bintang user saat ini
      const avgMap = {}   // { recipeId: { total, count } }
      const userMap = {}  // { recipeId: star } khusus user ini

      data.forEach(r => {
        const rid = Number(r.recipeId)
        if (!avgMap[rid]) avgMap[rid] = { total: 0, count: 0 }
        avgMap[rid].total += r.star
        avgMap[rid].count += 1
        if (userId && Number(r.userId) === userId) {
          userMap[rid] = r.star
        }
      })

      const result = {}
      Object.keys(avgMap).forEach(rid => {
        // Tampilkan bintang user jika sudah rating, kalau belum tampilkan rata-rata
        result[rid] = userMap[rid] ?? (avgMap[rid].total / avgMap[rid].count)
      })
      setRatings(result)
    }
    getRatings()

    const channel = supabase
      .channel('ratings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ratings' }, getRatings)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])

  // ── Toggle Favorite ─────────────────────────────────────────────────
  const toggleFavorite = useCallback(async (recipeId) => {
    if (!userId) { alert('Login dulu untuk menyimpan favorit'); return }
    const rid = Number(recipeId)
    const isFav = favorites.includes(rid)

    // Optimistic update: langsung update state dulu biar terasa cepat
    setFavorites(prev => isFav ? prev.filter(id => id !== rid) : [...prev, rid])

    if (isFav) {
      const { error } = await supabase.from('favorites')
        .delete().eq('userId', userId).eq('recipeId', rid)
      // Rollback kalau gagal
      if (error) setFavorites(prev => [...prev, rid])
    } else {
      const { error } = await supabase.from('favorites')
        .insert([{ userId, recipeId: rid }])
      // Rollback kalau gagal
      if (error) setFavorites(prev => prev.filter(id => id !== rid))
    }
  }, [userId, favorites])

  // ── Add to History ──────────────────────────────────────────────────
  const addToHistory = useCallback(async (recipe) => {
    if (!userId) return
    const rid = Number(recipe.id)
    // Hapus dulu kalau sudah ada (biar tidak duplikat), lalu insert baru
    await supabase.from('histories')
      .delete().eq('userId', userId).eq('recipeId', rid)
    await supabase.from('histories')
      .insert([{ userId, recipeId: rid, visitedAt: new Date().toISOString() }])
  }, [userId])

  // ── Clear History ───────────────────────────────────────────────────
const clearHistory = useCallback(async () => {
  if (!userId) return
  await supabase.from('histories').delete().eq('userId', userId)
  setRecipeHistory([])
}, [userId])

  // ── Handle Rate ─────────────────────────────────────────────────────
  const handleRate = useCallback(async (recipeId, star) => {
    if (!userId) { alert('Login dulu untuk memberi rating'); return }
    const rid = Number(recipeId)

    // Optimistic update
    setRatings(prev => ({ ...prev, [rid]: star }))

    // Cek apakah sudah pernah rating
    const { data: existing } = await supabase
      .from('ratings')
      .select('id')
      .eq('userId', userId)
      .eq('recipeId', rid)
      .single()

    if (existing) {
      // Update
      const { error } = await supabase.from('ratings')
        .update({ star })
        .eq('userId', userId)
        .eq('recipeId', rid)
      if (error) console.error('Rating update error:', error)
    } else {
      // Insert baru
      const { error } = await supabase.from('ratings')
        .insert([{ userId, recipeId: rid, star }])
      if (error) console.error('Rating insert error:', error)
    }
  }, [userId])

  // ── CRUD Recipes ────────────────────────────────────────────────────
  const createRecipe = async (data) => {
    const { data: saved, error } = await supabase
      .from('recipes').insert([data]).select()
    if (!error && saved) setRecipesData(prev => [...prev, saved[0]])
  }

  const updateRecipe = async (id, data) => {
    const { data: updated, error } = await supabase
      .from('recipes').update(data).eq('id', id).select()
    if (!error && updated) setRecipesData(prev => prev.map(r => r.id === id ? updated[0] : r))
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
      result = result.filter(r => favorites.includes(Number(r.id)))
    } else {
      if (filters.category)    result = result.filter(r => r.category === filters.category)
      if (filters.subCategory) result = result.filter(r => r.subCategory === filters.subCategory)
      if (filters.level)       result = result.filter(r => r.level === filters.level)
      if (filters.budget)      result = result.filter(r => r.budget === filters.budget)
    }

    if (selectedIngredients.length > 0) {
      result = result.filter(r => {
        const ingredients = Array.isArray(r.ingredients)
          ? r.ingredients
          : (() => { try { return JSON.parse(r.ingredients || '[]') } catch { return [] } })()
        return selectedIngredients.some(s =>
          ingredients.some(i => {
            const name = typeof i === 'string' ? i : (i?.name ?? '')
            return name.toLowerCase().includes(s.toLowerCase())
          })
        )
      })
    }

    return result
  }, [recipesData, filters, showFavorites, favorites, selectedIngredients])
}