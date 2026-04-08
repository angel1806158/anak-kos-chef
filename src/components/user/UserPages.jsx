import React from 'react';
import { ChevronLeft, History, Heart, Calendar, Trash2 } from 'lucide-react';
import { StarRating } from '../rating/StarRating';

const BackBtn = ({ onClick }) => (
  <button onClick={onClick} className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 font-semibold text-sm mb-6 transition-colors">
    <ChevronLeft className="w-5 h-5" />Kembali ke Beranda
  </button>
);

// ─── RIWAYAT KUNJUNGAN ────────────────────────────────────────
export function HistoryPage({
  isDarkMode, textColor, textMuted, cardBg,
  recipeHistory, ratings, onRate,
  onBack, onOpenRecipe, onClearHistory,
}) {
  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      <BackBtn onClick={onBack} />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
          <h2 className={`text-2xl font-bold ${textColor}`}>Riwayat Kunjungan</h2>
          <span className={`text-sm ${textMuted}`}>({recipeHistory.length} resep)</span>
        </div>
        {recipeHistory.length > 0 && (
          <button onClick={onClearHistory}
            className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}>
            <Trash2 className="w-4 h-4" />Hapus Semua
          </button>
        )}
      </div>

      {recipeHistory.length === 0 ? (
        <div className={`text-center py-16 ${cardBg} rounded-2xl border`}>
          <History className={`w-12 h-12 mx-auto mb-3 ${textMuted}`} />
          <p className={`font-semibold ${textColor}`}>Belum ada riwayat</p>
          <p className={`text-sm ${textMuted} mt-1`}>Buka resep untuk mulai merekam riwayat</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recipeHistory.map((item, idx) => (
            <div key={`${item.id}-${idx}`} onClick={() => onOpenRecipe(item)}
              className={`${cardBg} rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 group`}>
              <div className="relative h-44 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className={`absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-sm ${isDarkMode ? 'bg-gray-900/80 text-gray-200' : 'bg-white/90 text-gray-700'}`}>
                  <Calendar className="w-3 h-3" />{item.visitedAt}
                </div>
              </div>
              <div className="p-4">
                <h3 className={`font-bold text-base ${textColor} line-clamp-1 group-hover:text-orange-500 transition-colors`}>{item.title}</h3>
                <div className="mt-2">
                  <StarRating recipeId={item.id} ratings={ratings} onRate={(star) => onRate(item.id, star)} isDarkMode={isDarkMode} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── KOLEKSI FAVORIT ──────────────────────────────────────────
export function FavoritesPage({
  isDarkMode, textColor, textMuted, cardBg,
  favRecipes, ratings, onRate,
  onBack, onOpenRecipe, onToggleFavorite,
}) {
  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      <BackBtn onClick={onBack} />
      <div className="flex items-center gap-3 mb-6">
        <Heart className={`w-6 h-6 fill-current ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
        <h2 className={`text-2xl font-bold ${textColor}`}>Koleksi Favorit</h2>
        <span className={`text-sm ${textMuted}`}>({favRecipes.length} resep)</span>
      </div>

      {favRecipes.length === 0 ? (
        <div className={`text-center py-16 ${cardBg} rounded-2xl border`}>
          <Heart className={`w-12 h-12 mx-auto mb-3 ${textMuted}`} />
          <p className={`font-semibold ${textColor}`}>Belum ada favorit</p>
          <p className={`text-sm ${textMuted} mt-1`}>Tekan ikon hati pada resep untuk menyimpannya</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favRecipes.map((recipe) => (
            <div key={recipe.id} onClick={() => onOpenRecipe(recipe)}
              className={`${cardBg} rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 group`}>
              <div className="relative h-44 overflow-hidden">
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(recipe.id, e); }}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-red-500/90 shadow hover:bg-red-600 transition-colors">
                  <Heart className="w-4 h-4 text-white fill-current" />
                </button>
                <div className={`absolute bottom-3 left-3 text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-sm ${isDarkMode ? 'bg-gray-900/80 text-gray-200' : 'bg-white/90 text-gray-700'}`}>
                  {recipe.prepTime}
                </div>
              </div>
              <div className="p-4">
                <h3 className={`font-bold text-base ${textColor} line-clamp-1 group-hover:text-orange-500 transition-colors`}>{recipe.title}</h3>
                <div className="mt-2">
                  <StarRating recipeId={recipe.id} ratings={ratings} onRate={(star) => onRate(recipe.id, star)} isDarkMode={isDarkMode} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
