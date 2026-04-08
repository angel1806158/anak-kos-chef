import { useState, useCallback } from 'react';
import { TIME_OPTIONS, EKSPLORASI_ITEMS } from '../config';

export function useFilters() {
  const [filters,         setFilters]         = useState({});
  const [showFavorites,   setShowFavorites]   = useState(false);
  const [isTanggalTua,    setIsTanggalTua]    = useState(false);
  const [tanggalTuaQuote, setTanggalTuaQuote] = useState(null);

  const toggleFilter = useCallback((type, value) => {
    if (type === 'clearAll') {
      setFilters({});
      setShowFavorites(false);
      setIsTanggalTua(false);
      setTanggalTuaQuote(null);
      return;
    }

    if (type === 'clearMealTime') {
      setFilters((p) => {
        const n = { ...p };
        delete n.category;
        delete n.level;
        delete n.time;
        return n;
      });
      return;
    }

    setFilters((prev) => {
      const next = { ...prev };
      if (next[type] === value) delete next[type];
      else next[type] = value;
      return next;
    });

    setShowFavorites(false);

    // ✅ TANPA AI (langsung kasih teks aja)
    if (type === 'budget') {
      const activating = value === 'tua';
      setIsTanggalTua(activating);

      if (activating) {
        setTanggalTuaQuote("Dompet menipis, tapi semangat makan tetap tebal 💪");
      } else {
        setTanggalTuaQuote(null);
      }
    }

  }, []);

  const getActiveFilterTags = useCallback(() => {
    const tags = [];

    if (showFavorites)
      tags.push({ key: 'fav', label: '❤️ Favorit' });

    if (filters.category)
      tags.push({ key: 'category', label: filters.category });

    if (filters.level)
      tags.push({ key: 'level', label: filters.level });

    if (filters.time) {
      const t = TIME_OPTIONS.find((o) => o.value === filters.time);
      tags.push({ key: 'time', label: t?.label ?? filters.time });
    }

    if (filters.subCategory) {
      const s = EKSPLORASI_ITEMS.find((o) => o.value === filters.subCategory);
      tags.push({ key: 'subCategory', label: s?.label ?? filters.subCategory });
    }

    if (filters.budget) {
      tags.push({
        key: 'budget',
        label: filters.budget === 'tua'
          ? 'Tanggal Tua 🪙'
          : 'Tanggal Muda 💰'
      });
    }

    return tags;
  }, [filters, showFavorites]);

  const hasFilters = Object.keys(filters).length > 0 || showFavorites;

  return {
    filters,
    showFavorites,
    setShowFavorites,
    isTanggalTua,
    tanggalTuaQuote,
    toggleFilter,
    getActiveFilterTags,
    hasFilters,
  };
}