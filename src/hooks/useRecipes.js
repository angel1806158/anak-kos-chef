import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../supabase'

export function useRecipes(currentUser) {
  const [recipesData, setRecipesData] = useState([])
  const [favorites, setFavorites] = useState([])
  const [recipeHistory, setRecipeHistory] = useState([])
  const [ratings, setRatings] = useState({})
  const [loading, setLoading] = useState(true)

  // 🔥 AMBIL DATA DARI SUPABASE
  useEffect(() => {
    async function getRecipes() {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')

      if (error) {
        console.error('Supabase error:', error)
      } else {
        setRecipesData(data)
      }
      setLoading(false)
    }

    getRecipes()
  }, [])

  // 🔥 FAVORIT (sementara lokal)
  const toggleFavorite = useCallback((recipeId) => {
    setFavorites((f) =>
      f.includes(recipeId)
        ? f.filter((id) => id !== recipeId)
        : [...f, recipeId]
    )
  }, [])

  // 🔥 HISTORY (lokal)
  const addToHistory = useCallback((recipe) => {
    const now = new Date().toLocaleString()
    const entry = {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      visitedAt: now
    }

    setRecipeHistory((prev) =>
      [entry, ...prev.filter((r) => r.id !== recipe.id)].slice(0, 20)
    )
  }, [])

  const clearHistory = useCallback(() => {
    setRecipeHistory([])
  }, [])

  // 🔥 RATING (lokal)
  const handleRate = useCallback((recipeId, star) => {
    setRatings((r) => ({ ...r, [recipeId]: star }))
  }, [])

  // 🔥 CRUD (sementara disable backend lama)
  const createRecipe = async (data) => {
    const { data: saved, error } = await supabase
      .from('recipes')
      .insert([data])
      .select()

    if (!error) {
      setRecipesData((prev) => [...prev, saved[0]])
    }
  }

  const updateRecipe = async (id, data) => {
    const { data: updated, error } = await supabase
      .from('recipes')
      .update(data)
      .eq('id', id)
      .select()

    if (!error) {
      setRecipesData((prev) =>
        prev.map((r) => (r.id === id ? updated[0] : r))
      )
    }
  }

  const deleteRecipe = async (id) => {
    await supabase.from('recipes').delete().eq('id', id)
    setRecipesData((prev) => prev.filter((r) => r.id !== id))
  }

  return {
    recipesData,
    favorites,
    recipeHistory,
    ratings,
    loading,
    toggleFavorite,
    addToHistory,
    clearHistory,
    handleRate,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  }
}

export function useFilteredRecipes(recipesData, { filters, showFavorites, favorites, selectedIngredients }) {
  return useMemo(() => {
    let result = recipesData

    if (showFavorites) {
      result = result.filter((r) => favorites.includes(r.id))
    } else {
      if (filters.category) result = result.filter((r) => r.category === filters.category)
      if (filters.subCategory) result = result.filter((r) => r.subCategory === filters.subCategory)
      if (filters.level) result = result.filter((r) => r.level === filters.level)
    }

    if (selectedIngredients.length > 0) {
      result = result.filter((r) =>
        r.ingredients?.some((i) =>
          selectedIngredients.some((s) =>
            i.toLowerCase().includes(s.toLowerCase())
          )
        )
      )
    }

    return result
  }, [recipesData, filters, showFavorites, favorites, selectedIngredients])
}