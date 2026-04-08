import { useState, useEffect, useMemo, useCallback } from 'react';
import { recipeAPI, favoriteAPI, historyAPI, ratingAPI } from '../api';

export function useRecipes(currentUser) {
  const [recipesData,   setRecipesData]   = useState([]);
  const [favorites,     setFavorites]     = useState([]);
  const [recipeHistory, setRecipeHistory] = useState([]);
  const [ratings,       setRatings]       = useState({});
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    recipeAPI.getAll()
      .then(setRecipesData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setFavorites([]);
      setRecipeHistory([]);
      setRatings({});
      return;
    }
    Promise.allSettled([
      favoriteAPI.getAll().then(setFavorites),
      historyAPI.getAll().then(setRecipeHistory),
      ratingAPI.getAll().then(setRatings),
    ]);
  }, [currentUser]);

  // Favorit hanya untuk user yang login
  const toggleFavorite = useCallback(async (recipeId, e) => {
    if (e) e.stopPropagation();
    if (!currentUser) return; // tamu tidak bisa favorit
    const prev = [...favorites];
    setFavorites((f) =>
      f.includes(recipeId) ? f.filter((id) => id !== recipeId) : [...f, recipeId]
    );
    try {
      await favoriteAPI.toggle(recipeId);
    } catch {
      setFavorites(prev);
    }
  }, [currentUser, favorites]);

  const addToHistory = useCallback(async (recipe) => {
    const now       = new Date();
    const visitedAt = `${now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    const entry     = { id: recipe.id, title: recipe.title, image: recipe.image, visitedAt };
    setRecipeHistory((prev) =>
      [entry, ...prev.filter((r) => r.id !== recipe.id)].slice(0, 20)
    );
    if (currentUser) historyAPI.add(recipe.id).catch(console.error);
  }, [currentUser]);

  const clearHistory = useCallback(async () => {
    setRecipeHistory([]);
    if (currentUser) historyAPI.clear().catch(console.error);
  }, [currentUser]);

  // Rating: tamu bisa beri rating secara lokal, user login disimpan ke backend
  const handleRate = useCallback(async (recipeId, star) => {
    const prevStar = ratings[recipeId] ?? 0;
    const newStar  = star === prevStar ? 0 : star;
    setRatings((r) => ({ ...r, [recipeId]: newStar }));
    if (currentUser) {
      ratingAPI.set(recipeId, newStar).catch(() => {
        setRatings((r) => ({ ...r, [recipeId]: prevStar }));
      });
    }
  }, [currentUser, ratings]);

  const createRecipe = async (data) => {
    const saved = await recipeAPI.create(data);
    setRecipesData((prev) => [...prev, saved]);
    return saved;
  };

  const updateRecipe = async (id, data) => {
    const updated = await recipeAPI.update(id, data);
    setRecipesData((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  const deleteRecipe = async (id) => {
    await recipeAPI.delete(id);
    setRecipesData((prev) => prev.filter((r) => r.id !== id));
  };

  return {
    recipesData, favorites, recipeHistory, ratings, loading,
    toggleFavorite, addToHistory, clearHistory, handleRate,
    createRecipe, updateRecipe, deleteRecipe,
  };
}

export function useFilteredRecipes(recipesData, { filters, showFavorites, favorites, selectedIngredients }) {
  return useMemo(() => {
    let result = recipesData;

    if (showFavorites) {
      result = result.filter((r) => favorites.includes(r.id));
    } else {
      if (filters.category)    result = result.filter((r) => r.category    === filters.category);
      if (filters.subCategory) result = result.filter((r) => r.subCategory === filters.subCategory);
      if (filters.level)       result = result.filter((r) => r.level       === filters.level);
      if (filters.budget === 'tua')
        result = result.filter((r) => r.cost === 'Sangat Murah' || r.cost === 'Murah');
      if (filters.time) {
        result = result.filter((r) => {
          const m = r.prepTimeMinutes;
          if (filters.time === '< 15 menit')  return m < 15;
          if (filters.time === '15-30 menit') return m >= 15 && m <= 30;
          if (filters.time === '> 30 menit')  return m > 30;
          return true;
        });
      }
    }

    if (selectedIngredients.length > 0) {
      result = result
        .map((recipe) => {
          const ingStr     = recipe.ingredients.map((i) => i.toLowerCase());
          const matchCount = selectedIngredients.reduce(
            (acc, s) => ingStr.some((ing) => ing.includes(s.toLowerCase())) ? acc + 1 : acc, 0
          );
          return { ...recipe, matchCount, matchPercentage: Math.round((matchCount / selectedIngredients.length) * 100) };
        })
        .filter((r) => r.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount || b.matchPercentage - a.matchPercentage);
    }

    return result;
  }, [recipesData, filters, showFavorites, favorites, selectedIngredients]);
}
