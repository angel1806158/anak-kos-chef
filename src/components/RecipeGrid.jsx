import React from 'react';
import { Search, X, Dices, AlertTriangle, Info, Clock, Wallet, Heart, ChevronLeft } from 'lucide-react';
import { StarRating, CheckCircle } from './rating/StarRating';

// ─── SEARCH BAR ───────────────────────────────────────────────
export function SearchBar({
  isDarkMode, cardBg, textColor, textMuted,
  inputValue, selectedIngredients,
  onInputChange, onAddIngredient, onRemoveIngredient, onGacha,
  isTanggalTua, tanggalTuaQuote,
}) {
  return (
    <div className={`${cardBg} rounded-2xl p-6 sm:p-8 shadow-sm mb-8 animate-in fade-in duration-500`}>
      <div className="flex items-center mb-2">
        <Search className="w-6 h-6 text-red-500 mr-3" strokeWidth={2.5} />
        <h2 className={`text-2xl font-bold ${textColor}`}>Cari Resep Berdasarkan Bahan</h2>
      </div>
      <p className={`${textMuted} mb-6 ml-9`}>
        Masukkan bahan yang ada di kulkasmu (pisahkan dengan koma untuk beberapa bahan sekaligus)
      </p>

      <div className="flex flex-col lg:flex-row gap-4 mb-2 ml-0 sm:ml-9">
        <form onSubmit={onAddIngredient} className="flex flex-col sm:flex-row gap-4 flex-grow">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Contoh: telur, mie, bawang putih"
            className={`flex-grow px-5 py-3 rounded-xl border focus:ring-2 transition-all outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500 focus:ring-red-900/50' : 'bg-white border-gray-300 text-gray-900 focus:border-red-400 focus:ring-red-100'}`}
          />
          <button type="submit" disabled={!inputValue.trim()}
            className="bg-gradient-to-r from-red-500 to-orange-400 hover:opacity-90 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium transition-opacity flex items-center justify-center min-w-[150px]">
            <Search className="w-5 h-5 mr-2" />Cari Resep
          </button>
        </form>
        <button onClick={onGacha}
          className="lg:flex-none bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 text-white px-5 py-3 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-md text-sm sm:text-base whitespace-nowrap">
          <Dices className="w-5 h-5 mr-1.5" />Kocok Resep!
        </button>
      </div>

      {selectedIngredients.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 ml-0 sm:ml-9">
          {selectedIngredients.map((ing, idx) => (
            <div key={idx} className={`px-4 py-1.5 rounded-full flex items-center text-sm font-medium ${isDarkMode ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'bg-yellow-300 text-yellow-900'}`}>
              {ing}
              <button type="button" onClick={() => onRemoveIngredient(ing)}
                className={`ml-2 rounded-full p-0.5 transition-colors ${isDarkMode ? 'hover:bg-yellow-500/30' : 'hover:bg-yellow-400'}`}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isTanggalTua && (
        <div className={`mt-6 ml-0 sm:ml-9 p-4 rounded-xl flex items-start gap-4 ${isDarkMode ? 'bg-red-900/30 border border-red-500/30 text-red-200' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          <AlertTriangle className="w-6 h-6 flex-shrink-0 text-red-500 animate-bounce" />
          <div>
            <h4 className="font-bold mb-1">Mode Tanggal Tua Diaktifkan!</h4>
            <p className="text-sm opacity-90">Menyembunyikan resep mahal. Saatnya bertahan hidup dengan resep ramah kantong.</p>
            {tanggalTuaQuote && (
              <div className={`mt-3 text-sm italic font-medium p-3 rounded-lg border ${isDarkMode ? 'bg-red-900/50 border-red-500/30' : 'bg-white/60 border-red-200/50'}`}>
                "{tanggalTuaQuote}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────
function EmptyState({ isDarkMode, cardBg, textColor, textMuted, showFavorites }) {
  return (
    <div className={`text-center py-16 px-6 ${cardBg} rounded-3xl border-dashed border-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
      <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
        <Search className={`w-10 h-10 ${textMuted}`} />
      </div>
      <h3 className={`text-xl font-bold ${textColor} mb-2`}>Yah, resepnya belum ada!</h3>
      <p className={`${textMuted} mb-4`}>
        {showFavorites ? 'Kamu belum menandai satu pun resep sebagai favorit.' : 'Coba kurangi bahan atau ubah filter yang kamu pilih.'}
      </p>
    </div>
  );
}

// ─── RECIPE CARD ─────────────────────────────────────────────
function RecipeCard({ recipe, isDarkMode, cardBg, textColor, textMuted, isFav, ratings, onRate, onToggleFavorite, onOpen, isDancing, isLoggedIn }) {
  return (
    <div
      onClick={onOpen}
      className={`${cardBg} rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group flex flex-col h-full ${isDancing ? 'dancing-card shadow-lg' : ''}`}
    >
      <div className="relative h-48 overflow-hidden">
        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isLoggedIn) { alert('Anda harus login terlebih dahulu'); return; }
            onToggleFavorite(recipe.id, e);
          }}
          className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all shadow-md z-10 ${isFav ? 'bg-red-500/90 text-white hover:bg-red-600' : 'bg-white/70 text-gray-700 hover:bg-white/90 hover:text-red-500'}`}>
          <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
        </button>
        {recipe.matchCount > 0 && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />{recipe.matchCount} Bahan
          </div>
        )}
        <div className={`absolute bottom-4 right-4 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center ${isDarkMode ? 'bg-gray-900/90 text-gray-200' : 'bg-white/90 text-gray-700'}`}>
          <Clock className="w-3 h-3 mr-1" />{recipe.prepTime}
        </div>
      </div>
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <h3 className={`text-xl font-bold ${textColor} mb-2 group-hover:text-orange-500 transition-colors line-clamp-2`}>{recipe.title}</h3>
          <p className={`text-sm ${textMuted} mb-4 line-clamp-2`}>{Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : recipe.ingredients}</p>
        </div>
        <div onClick={(e) => e.stopPropagation()} className="mt-2 mb-1">
          <StarRating
            recipeId={recipe.id}
            ratings={ratings}
            onRate={(star) => {
              if (!isLoggedIn) { alert('Login dulu untuk memberi rating'); return; }
              onRate(recipe.id, star);
            }}
            isDarkMode={isDarkMode}
          />
        </div>
        <div className={`flex items-center justify-between mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <span className={`flex items-center text-sm font-medium px-2 py-1 rounded-md ${isDarkMode ? 'text-emerald-400 bg-emerald-900/30' : 'text-emerald-600 bg-emerald-50'}`}>
            <Wallet className="w-4 h-4 mr-1" />{recipe.cost}
          </span>
          <span className="text-orange-500 font-semibold text-sm group-hover:translate-x-1 transition-transform flex items-center">
            Lihat Resep <ChevronLeft className="w-4 h-4 ml-1 rotate-180" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── RECIPE GRID ──────────────────────────────────────────────
export function RecipeGrid({
  isDarkMode, cardBg, textColor, textMuted,
  filteredRecipes, selectedIngredients, hasFilters, showFavorites,
  favorites, ratings, onRate, onToggleFavorite, onOpenRecipe,
  isDancing, isLoggedIn,
}) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${textColor}`}>
          {selectedIngredients.length > 0
            ? `Hasil Pencocokan (${filteredRecipes.length} Resep)`
            : hasFilters
              ? `Hasil Filter (${filteredRecipes.length})`
              : 'Rekomendasi Resep Populer'}
        </h2>
        {selectedIngredients.length > 0 && filteredRecipes.length > 0 && (
          <div className={`flex items-center text-sm px-3 py-1 rounded-full ${isDarkMode ? 'text-gray-300 bg-gray-800 border border-gray-700' : 'text-gray-500 bg-gray-100'}`}>
            <Info className="w-4 h-4 mr-1" />Diurutkan dari kecocokan
          </div>
        )}
      </div>

      {filteredRecipes.length === 0 ? (
        <EmptyState
          isDarkMode={isDarkMode} cardBg={cardBg} textColor={textColor} textMuted={textMuted}
          showFavorites={showFavorites}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id} recipe={recipe}
              isDarkMode={isDarkMode} cardBg={cardBg} textColor={textColor} textMuted={textMuted}
              isFav={favorites.includes(recipe.id)}
              ratings={ratings} onRate={onRate}
              onToggleFavorite={onToggleFavorite}
              onOpen={() => onOpenRecipe(recipe)}
              isDancing={isDancing}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      )}
    </>
  );
}
