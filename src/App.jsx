import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ChefHat, Music, Moon, Sun, User, Shield,
  Dices, UtensilsCrossed, Globe, GraduationCap, Heart, X, Volume2, VolumeX,
  Play, Pause, SkipForward, SkipBack, ListMusic,
} from 'lucide-react';

import { useAuth }                        from './hooks/useAuth';
import { useRecipes, useFilteredRecipes } from './hooks/useRecipes';
import { useFilters }                     from './hooks/useFilters';
import { EKSPLORASI_ITEMS, MAHASISWA_ITEMS } from './config';

import { WaktuMakanDropdown, SimpleDropdown, MobileMenu } from './components/navbar/Dropdowns';
import { AuthModal }     from './components/AuthModal';
import { ProfilePanel }  from './components/ProfilePanel';
import { RecipeDetail }  from './components/RecipeDetail';
import { SearchBar, RecipeGrid } from './components/RecipeGrid';
import { HistoryPage, FavoritesPage }   from './components/user/UserPages';
import {
  AddRecipePage, AdminCollectionPage, AdminDashboardPage, AdminSongManagerPage,
} from './components/admin/AdminPages';

const GLOBAL_CSS = `
  @keyframes dance { 0%{transform:translateY(0) rotate(0deg)} 25%{transform:translateY(-8px) rotate(-3deg)} 50%{transform:translateY(0) rotate(0deg)} 75%{transform:translateY(-8px) rotate(3deg)} 100%{transform:translateY(0) rotate(0deg)} }
  @keyframes disco      { 0%{background-color:#fca5a5} 33%{background-color:#fcd34d} 66%{background-color:#6ee7b7} 100%{background-color:#93c5fd} }
  @keyframes disco-dark { 0%{background-color:#4c1d95} 33%{background-color:#831843} 66%{background-color:#064e3b} 100%{background-color:#1e3a8a} }
  @keyframes slideInPanel { from{opacity:0;transform:translateY(-10px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
  .dancing-card  { animation: dance 0.8s infinite ease-in-out; }
  .disco-bg      { animation: disco 3s infinite alternate; }
  .disco-bg-dark { animation: disco-dark 3s infinite alternate; }
  .hide-scrollbar::-webkit-scrollbar{display:none}
  .hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
`;

const SONGS_STORAGE_KEY = 'anakkos_songs_v1';

function loadSongsFromStorage() {
  try {
    const raw = localStorage.getItem(SONGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function App() {
  const { currentUser, authLoading, login, register, logout } = useAuth();

  const [isDarkMode,       setIsDarkMode]       = useState(false);
  const [isDancing,        setIsDancing]        = useState(false);
  const [showAuthModal,    setShowAuthModal]    = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [activeView,       setActiveView]       = useState(null);

  // Music player state — loaded from localStorage (admin-managed songs)
  const [songs,          setSongs]          = useState(loadSongsFromStorage);
  const [currentSongIdx, setCurrentSongIdx] = useState(0);
  const [isMuted,        setIsMuted]        = useState(false);
  const [showPlaylist,   setShowPlaylist]   = useState(false);

  // Sync songs dari localStorage setiap kali party mode dibuka
  useEffect(() => {
    if (isDancing) {
      const updated = loadSongsFromStorage();
      setSongs(updated);
      setCurrentSongIdx(0);
    }
  }, [isDancing]);

  const {
    recipesData, favorites, recipeHistory, ratings,
    toggleFavorite, addToHistory, clearHistory, handleRate,
    createRecipe, updateRecipe, deleteRecipe,
  } = useRecipes(currentUser);

  const [activeRecipeId,      setActiveRecipeId]      = useState(null);
  const [inputValue,          setInputValue]           = useState('');
  const [selectedIngredients, setSelectedIngredients]  = useState([]);
  const [isSpinning,          setIsSpinning]           = useState(false);

  const {
    filters, showFavorites, setShowFavorites,
    isTanggalTua, tanggalTuaQuote,
    toggleFilter, getActiveFilterTags, hasFilters,
  } = useFilters();

  const filteredRecipes  = useFilteredRecipes(recipesData, { filters, showFavorites, favorites, selectedIngredients });
  const favRecipes       = recipesData.filter((r) => favorites.includes(r.id));
  const activeRecipe     = recipesData.find((r) => r.id === activeRecipeId);
  const activeFilterTags = getActiveFilterTags();

  const themeBg   = isDarkMode ? 'bg-gray-900' : 'bg-slate-50';
  const cardBg    = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  // Auto-advance lagu setiap 3 menit
  useEffect(() => {
    if (!isDancing || songs.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSongIdx((i) => (i + 1) % songs.length);
    }, 180000);
    return () => clearInterval(interval);
  }, [isDancing, songs.length]);

  const handleAddIngredient = (e) => {
    e.preventDefault();
    const val = inputValue.trim();
    if (!val) return;
    const parts = val.split(/[,]+/).map((s) => s.trim()).filter(Boolean);
    setSelectedIngredients((prev) => {
      const added = parts.filter((p) => p && !prev.includes(p));
      return [...prev, ...added];
    });
    setInputValue('');
  };

  const handleRemoveIngredient = (ing) => {
    setSelectedIngredients((p) => p.filter((i) => i !== ing));
  };

  const handleGacha = () => {
    if (!recipesData.length) return;
    setIsSpinning(true);
    const chosen = recipesData[Math.floor(Math.random() * recipesData.length)];
    setTimeout(() => { setActiveRecipeId(chosen.id); setIsSpinning(false); }, 1500);
  };

  const handleOpenRecipe = useCallback((recipe) => {
    setActiveRecipeId(recipe.id);
    addToHistory(recipe);
  }, [addToHistory]);

  const handleBack = useCallback(() => { setActiveRecipeId(null); }, []);

  const handleNavigate = (view) => { setActiveView(view); setActiveRecipeId(null); };

const handleLoginSuccess = async (mode, form) => {
  let user;
  if (mode === 'register') {
    user = await register({ name: form.name, identifier: form.identifier, password: form.password });
  } else {
    user = await login({ identifier: form.identifier, password: form.password });
  }
  if (mode === 'admin' && user.role !== 'admin') throw new Error('Akun ini bukan admin.');
  setShowAuthModal(false);
  setShowProfilePanel(true);
};

  const handleLogout = () => {
    logout();
    setShowProfilePanel(false);
    setActiveView(null);
    setActiveRecipeId(null);
  };

  const handleClearNav = () => {
    toggleFilter('clearAll');
    setActiveRecipeId(null);
    setSelectedIngredients([]);
  };

  const currentSong = songs.length > 0 ? songs[currentSongIdx % songs.length] : null;

  const renderView = () => {
    if (activeRecipe) return (
      <RecipeDetail
        recipe={activeRecipe} user={currentUser}
        isDarkMode={isDarkMode} cardBg={cardBg} textColor={textColor} textMuted={textMuted}
        selectedIngredients={selectedIngredients} favorites={favorites} ratings={ratings}
        onToggleFavorite={toggleFavorite} onRate={handleRate} onBack={handleBack}
      />
    );
    if (activeView === 'history') return (
      <HistoryPage isDarkMode={isDarkMode} textColor={textColor} textMuted={textMuted} cardBg={cardBg}
        recipeHistory={recipeHistory} ratings={ratings} onRate={handleRate}
        onBack={() => setActiveView(null)} onOpenRecipe={handleOpenRecipe} onClearHistory={clearHistory} />
    );
    if (activeView === 'favorites') return (
      <FavoritesPage isDarkMode={isDarkMode} textColor={textColor} textMuted={textMuted} cardBg={cardBg}
        favRecipes={favRecipes} ratings={ratings} onRate={handleRate}
        onBack={() => setActiveView(null)} onOpenRecipe={handleOpenRecipe} onToggleFavorite={toggleFavorite} />
    );
    if (activeView === 'addRecipe') return (
      <AddRecipePage isDarkMode={isDarkMode} textColor={textColor}
        onBack={() => setActiveView(null)} onSave={createRecipe} />
    );
    if (activeView === 'adminCollection') return (
      <AdminCollectionPage isDarkMode={isDarkMode} textColor={textColor} textMuted={textMuted} cardBg={cardBg}
        onBack={() => setActiveView(null)} recipesData={recipesData} ratings={ratings}
        onUpdateRecipe={updateRecipe} onDeleteRecipe={deleteRecipe} />
    );
    if (activeView === 'adminDashboard') return (
      <AdminDashboardPage isDarkMode={isDarkMode} textColor={textColor} textMuted={textMuted} cardBg={cardBg}
        onBack={() => setActiveView(null)} recipesData={recipesData} />
    );
    if (activeView === 'adminSongs') return (
      <AdminSongManagerPage isDarkMode={isDarkMode} textColor={textColor} textMuted={textMuted} cardBg={cardBg}
        onBack={() => setActiveView(null)} />
    );
    return (
      <>
        <SearchBar isDarkMode={isDarkMode} cardBg={cardBg} textColor={textColor} textMuted={textMuted}
          inputValue={inputValue} selectedIngredients={selectedIngredients}
          onInputChange={setInputValue} onAddIngredient={handleAddIngredient}
          onRemoveIngredient={handleRemoveIngredient} onGacha={handleGacha}
          isTanggalTua={isTanggalTua} tanggalTuaQuote={tanggalTuaQuote} />
        <RecipeGrid isDarkMode={isDarkMode} cardBg={cardBg} textColor={textColor} textMuted={textMuted}
          filteredRecipes={filteredRecipes} selectedIngredients={selectedIngredients}
          hasFilters={hasFilters} showFavorites={showFavorites}
          favorites={favorites} ratings={ratings} onRate={handleRate}
          onToggleFavorite={toggleFavorite} onOpenRecipe={handleOpenRecipe}
          isDancing={isDancing} isLoggedIn={!!currentUser} />
      </>
    );
  };

  if (authLoading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${isDancing ? (isDarkMode ? 'bg-indigo-950' : 'bg-indigo-50') : themeBg}`}>
      <style>{GLOBAL_CSS}</style>

      {/* ── Music Player (party mode) ── */}
      {isDancing && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
          {/* YouTube iframe (hidden, autoplay) */}
          {currentSong && (
            <iframe
              key={currentSong.id}
              width="0" height="0"
              src={`https://www.youtube.com/embed/${currentSong.id}?autoplay=1&mute=${isMuted ? 1 : 0}`}
              allow="autoplay"
              title="party music"
              className="hidden"
            />
          )}

          {/* Playlist dropdown */}
          {showPlaylist && songs.length > 0 && (
            <div className={`rounded-2xl shadow-2xl border p-3 w-64 max-h-60 overflow-y-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <p className={`text-xs font-bold mb-2 px-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pilih Lagu</p>
              {songs.map((s, i) => (
                <button key={s.id} onClick={() => { setCurrentSongIdx(i); setShowPlaylist(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium mb-1 transition-all ${i === currentSongIdx % songs.length ? 'bg-indigo-500 text-white' : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  {i + 1}. {s.title}
                </button>
              ))}
            </div>
          )}

          {/* Player bar */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl shadow-lg border ${isDarkMode ? 'bg-gray-800 text-gray-100 border-indigo-500/40' : 'bg-white text-gray-800 border-indigo-200'}`}>
            {/* Prev */}
            <button onClick={() => setCurrentSongIdx(i => (i - 1 + Math.max(songs.length, 1)) % Math.max(songs.length, 1))}
              disabled={songs.length === 0}
              className={`p-1 rounded-lg transition-colors disabled:opacity-40 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Song info */}
            <button onClick={() => setShowPlaylist(p => !p)}
              className="flex items-center gap-1.5 max-w-[160px]">
              <Music className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 animate-pulse" />
              <span className="text-xs font-semibold truncate">
                {currentSong ? currentSong.title : 'Belum ada lagu'}
              </span>
              <ListMusic className={`w-3 h-3 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            </button>

            {/* Next */}
            <button onClick={() => setCurrentSongIdx(i => (i + 1) % Math.max(songs.length, 1))}
              disabled={songs.length === 0}
              className={`p-1 rounded-lg transition-colors disabled:opacity-40 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            {/* Mute */}
            <button onClick={() => setIsMuted(m => !m)}
              className={`p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-gray-400" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-500" />}
            </button>
          </div>

          {/* No songs warning */}
          {songs.length === 0 && (
            <div className={`text-xs px-3 py-2 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
              Admin belum menambahkan lagu
            </div>
          )}
        </div>
      )}

      {/* Gacha overlay */}
      {isSpinning && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
          <Dices className="w-24 h-24 text-orange-500 animate-bounce mb-6" />
          <h2 className="text-3xl font-bold text-white animate-pulse text-center px-4">
            Mengocok Resep...<br /><span className="text-lg font-normal text-orange-200 mt-2 block">Mencari menu terbaik buat kamu!</span>
          </h2>
        </div>
      )}

      {/* NAVBAR */}
      <nav className={`sticky top-0 z-40 transition-all duration-500 ${isDancing ? (isDarkMode ? 'disco-bg-dark shadow-2xl' : 'disco-bg shadow-2xl') : (isDarkMode ? 'bg-gray-950 shadow-lg shadow-black/30' : 'bg-white shadow-sm shadow-orange-100/80')}`}>
        <div className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-orange-100/60'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button onClick={handleClearNav} className="flex items-center gap-2.5 group">
                <div className={`p-2 rounded-xl transition-transform group-hover:scale-110 ${isDancing ? 'bg-white/20' : 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-200'}`}>
                  <ChefHat className={`w-6 h-6 text-white ${isDancing ? 'animate-bounce' : ''}`} />
                </div>
                <span className={`font-black text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  AnakKos<span className="text-orange-500">Chef</span>
                </span>
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium hidden lg:block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {isDancing ? 'Party time!' : 'Masak hemat, perut kenyang!'}
                </span>
                <button onClick={() => { setIsDancing(d => !d); setCurrentSongIdx(0); setShowPlaylist(false); }}
                  className={`flex items-center gap-2 px-3 py-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm ${isDancing ? 'bg-indigo-600 text-white hover:bg-indigo-700 animate-pulse shadow-indigo-300' : isDarkMode ? 'bg-gray-800 text-indigo-400 hover:bg-gray-700 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'}`}>
                  <Music className="w-4 h-4" /><span className="hidden sm:inline">{isDancing ? 'Stop Party' : 'Mode Party'}</span>
                </button>
                <button onClick={() => setIsDarkMode(d => !d)}
                  className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 border border-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                {currentUser ? (
                  <button onClick={() => setShowProfilePanel(p => !p)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all border shadow-sm ${showProfilePanel ? isDarkMode ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'bg-orange-50 border-orange-300 text-orange-600' : isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-orange-200'}`}>
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${currentUser.avatarColor} flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0`}>
                      {currentUser.avatar}
                    </div>
                    <span className="hidden sm:inline max-w-[80px] truncate">{currentUser.name.split(' ')[0]}</span>
                    {currentUser.role === 'admin' && <Shield className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                  </button>
                ) : (
                  <button onClick={() => setShowAuthModal(true)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600'}`}>
                    <User className="w-4 h-4" /><span className="hidden sm:inline">Masuk</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={`border-b shadow-md ${isDarkMode ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 border-orange-400'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 h-14">
              <div className="hidden md:flex items-center gap-3 overflow-x-auto hide-scrollbar flex-1 justify-center">
                <button onClick={handleClearNav}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition-all duration-200 flex-shrink-0 shadow-sm ${!hasFilters ? 'bg-white text-orange-600 shadow-md scale-105' : isDarkMode ? 'bg-white/10 text-white/80 hover:bg-white/20' : 'bg-white/25 text-white hover:bg-white/40 hover:scale-105'}`}>
                  <UtensilsCrossed className="w-3.5 h-3.5" />Semua Resep
                </button>
                <div className={`w-px h-5 flex-shrink-0 ${isDarkMode ? 'bg-gray-700' : 'bg-white/30'}`} />
                <WaktuMakanDropdown isDarkMode={isDarkMode} filters={filters} onToggleFilter={toggleFilter} />
                <SimpleDropdown label="Eksplorasi Rasa"  icon={Globe}         items={EKSPLORASI_ITEMS} filterType="subCategory" isDarkMode={isDarkMode} filters={filters} onToggleFilter={toggleFilter} />
                <SimpleDropdown label="Khusus Mahasiswa" icon={GraduationCap} items={MAHASISWA_ITEMS}  filterType="budget"      isDarkMode={isDarkMode} filters={filters} onToggleFilter={toggleFilter} />
              </div>
              <div className="flex md:hidden items-center gap-2 flex-1">
                <button onClick={handleClearNav}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition-all flex-shrink-0 ${!hasFilters ? 'bg-white text-orange-600 shadow-md' : isDarkMode ? 'bg-white/10 text-white/80' : 'bg-white/25 text-white'}`}>
                  <UtensilsCrossed className="w-3.5 h-3.5" />Semua
                </button>
                <button onClick={() => { setShowFavorites(!showFavorites); toggleFilter('clearAll'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition-all flex-shrink-0 ${showFavorites ? 'bg-white text-red-600 shadow-md' : isDarkMode ? 'bg-white/10 text-white/80' : 'bg-white/25 text-white'}`}>
                  <Heart className={`w-3.5 h-3.5 ${showFavorites ? 'fill-current' : ''}`} />Favorit
                </button>
                {hasFilters && !showFavorites && (
                  <div className="flex gap-1 overflow-x-auto hide-scrollbar flex-1">
                    {activeFilterTags.slice(0, 2).map((tag) => (
                      <span key={tag.key} className="flex-shrink-0 text-xs px-2 py-1 rounded-full bg-white/90 text-orange-600 font-bold whitespace-nowrap">{tag.label}</span>
                    ))}
                    {activeFilterTags.length > 2 && <span className="flex-shrink-0 text-xs px-2 py-1 rounded-full bg-white/30 text-white font-bold">+{activeFilterTags.length - 2}</span>}
                  </div>
                )}
                <div className="ml-auto flex-shrink-0">
                  <MobileMenu isDarkMode={isDarkMode} filters={filters} onToggleFilter={toggleFilter}
                    onSetShowFavorites={(v) => { setShowFavorites(v); if (v) toggleFilter('clearAll'); }}
                    showFavorites={showFavorites} favCount={favorites.length} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {hasFilters && !showFavorites && activeFilterTags.length > 0 && (
          <div className={`border-b px-4 py-2 ${isDarkMode ? 'bg-orange-950/30 border-orange-900/30' : 'bg-orange-50 border-orange-100'}`}>
            <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 text-sm">
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Filter aktif:</span>
              {activeFilterTags.map((tag) => (
                <span key={tag.key} className={`px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'}`}>
                  {tag.label}
                  <button onClick={() => { if (tag.key === 'fav') setShowFavorites(false); else toggleFilter(tag.key, filters[tag.key]); }} className="ml-0.5 hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button onClick={handleClearNav} className={`text-xs font-semibold ml-1 ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'}`}>Reset semua</button>
              <span className={`ml-auto text-sm ${textMuted}`}>{filteredRecipes.length} resep</span>
            </div>
          </div>
        )}
      </nav>

      {showProfilePanel && currentUser && (
        <ProfilePanel isDarkMode={isDarkMode} favorites={favorites} recipeHistory={recipeHistory}
          role={currentUser.role} user={currentUser}
          onClose={() => setShowProfilePanel(false)} onLogout={handleLogout}
          onNavigate={handleNavigate} recipesCount={recipesData.length} />
      )}
      {showAuthModal && (
        <AuthModal isDarkMode={isDarkMode} onClose={() => setShowAuthModal(false)} onLoginSuccess={handleLoginSuccess} />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
    </div>
  );
}
