import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, Heart, Clock, Wallet, Flame, Utensils, ChefHat,
  MessageCircle, Send, Share2, Copy, Trash2, CornerDownRight, Tag,
} from 'lucide-react';
import { StarRating } from './rating/StarRating';
import { commentAPI } from '../api';

// ─── Helper: safe parse JSON or array ────────────────────────
function safeParse(val, fallback = []) {
  if (Array.isArray(val)) return val;
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

// ─── Share helpers ────────────────────────────────────────────
function getShareUrl(recipe) {
  return `${window.location.origin}${window.location.pathname}?recipe=${recipe.id}`;
}

function SharePanel({ recipe, isDarkMode }) {
  const [copied, setCopied] = useState(false);
  const url = getShareUrl(recipe);
  const text = encodeURIComponent(`Resep ${recipe.title} - AnakKosChef`);
  const encodedUrl = encodeURIComponent(url);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shares = [
    { label: 'WhatsApp',  color: 'bg-green-500', href: `https://wa.me/?text=${text}%20${encodedUrl}` },
    { label: 'Facebook',  color: 'bg-blue-600',  href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: 'Twitter/X', color: 'bg-gray-900',  href: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}` },
    { label: 'Telegram',  color: 'bg-sky-500',   href: `https://t.me/share/url?url=${encodedUrl}&text=${text}` },
    { label: 'Line',      color: 'bg-green-600', href: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}` },
    { label: 'Messenger', color: 'bg-blue-500',  href: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=181374745380921` },
  ];

  return (
    <div className={`rounded-2xl border shadow-xl p-5 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <p className={`font-bold text-sm mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Bagikan resep ini via:</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {shares.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
            className={`${s.color} text-white text-xs font-bold py-2 px-1 rounded-xl text-center hover:opacity-90 transition-opacity`}>
            {s.label}
          </a>
        ))}
      </div>
      <button onClick={copy}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${copied ? 'bg-green-500 text-white border-green-500' : isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
        <Copy className="w-4 h-4" />{copied ? 'Tautan Disalin!' : 'Salin Tautan'}
      </button>
    </div>
  );
}

// ─── Comment / Ulasan Section ─────────────────────────────────
function CommentSection({ recipeId, user, isDarkMode, textColor, textMuted, cardBg }) {
  const [comments,  setComments]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);
  const [text,      setText]      = useState('');
  const [guestName, setGuestName] = useState('');
  const [replyId,   setReplyId]   = useState(null);
  const [replyText, setReplyText] = useState('');

  const load = async () => {
    try {
      const data = await commentAPI.getByRecipe(recipeId);
      setComments(Array.isArray(data) ? data : []);
    } catch { setComments([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [recipeId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const newComment = await commentAPI.send(
        recipeId, text.trim(),
        user ? undefined : (guestName.trim() || 'Tamu')
      );
      setComments(prev => [newComment, ...prev]);
      setText('');
      setGuestName('');
    } catch (err) { alert(err.message); }
    setSending(false);
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;
    try {
      await commentAPI.reply(commentId, replyText.trim());
      setComments(prev => prev.map(c =>
        c.id === commentId ? { ...c, adminReply: replyText.trim() } : c
      ));
      setReplyId(null); setReplyText('');
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Hapus komentar ini?')) return;
    try {
      await commentAPI.delete(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) { alert(err.message); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className={`mt-8 ${cardBg} rounded-2xl border p-6`}>
      <h3 className={`text-lg font-bold ${textColor} mb-5 flex items-center gap-2`}>
        <MessageCircle className="w-5 h-5 text-orange-500" />Ulasan & Komentar ({comments.length})
      </h3>

      {/* Form kirim ulasan - untuk semua: tamu & user login */}
      <form onSubmit={handleSend} className="mb-6">
        {!user && (
          <input
            value={guestName} onChange={e => setGuestName(e.target.value)}
            placeholder="Nama kamu (opsional — untuk tamu)"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none mb-2 transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-orange-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-400'}`}
          />
        )}
        <div className="flex gap-2">
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            placeholder={user ? `Bagikan ulasanmu, ${user.name}...` : 'Tulis ulasan atau komentar tentang resep ini...'}
            rows={2}
            className={`flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none resize-none transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-orange-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-400'}`}
          />
          <button type="submit" disabled={!text.trim() || sending}
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-sm disabled:opacity-50 hover:opacity-90 transition-all flex items-center gap-1.5">
            <Send className="w-4 h-4" />{sending ? '...' : 'Kirim'}
          </button>
        </div>
        {!user && (
          <p className={`text-xs mt-2 ${textMuted}`}>
            💡 Tamu bisa langsung memberi ulasan. Login agar nama tersimpan permanen.
          </p>
        )}
      </form>

      {/* Daftar komentar */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : comments.length === 0 ? (
        <p className={`text-center py-8 text-sm ${textMuted}`}>Belum ada ulasan. Jadilah yang pertama!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 ${isDarkMode ? 'bg-orange-600' : 'bg-orange-500'}`}>
                    {(c.userName || 'T')[0].toUpperCase()}
                  </div>
                  <span className={`font-bold text-sm ${textColor}`}>{c.userName}</span>
                  <span className={`text-xs ${textMuted}`}>{formatDate(c.createdAt)}</span>
                </div>
                {user?.role === 'admin' && (
                  <div className="flex gap-1.5">
                    <button onClick={() => { setReplyId(replyId === c.id ? null : c.id); setReplyText(''); }}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg ${isDarkMode ? 'text-blue-400 hover:bg-blue-500/10' : 'text-blue-500 hover:bg-blue-50'}`}>
                      Balas
                    </button>
                    <button onClick={() => handleDelete(c.id)}
                      className={`p-1 rounded-lg ${isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-400 hover:bg-red-50'}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{c.content}</p>

              {c.adminReply && (
                <div className={`mt-3 ml-4 pl-3 border-l-2 ${isDarkMode ? 'border-orange-500/50' : 'border-orange-300'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <CornerDownRight className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs font-bold text-orange-500">Admin</span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{c.adminReply}</p>
                </div>
              )}

              {replyId === c.id && user?.role === 'admin' && (
                <div className="mt-3 flex gap-2">
                  <input value={replyText} onChange={e => setReplyText(e.target.value)}
                    placeholder="Tulis balasan admin..."
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm outline-none ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <button onClick={() => handleReply(c.id)} disabled={!replyText.trim()}
                    className="px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-bold disabled:opacity-50 hover:bg-orange-600">
                    Kirim
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── RECIPE DETAIL ────────────────────────────────────────────
export function RecipeDetail({
  recipe, user, isDarkMode, cardBg, textColor, textMuted,
  selectedIngredients, favorites, ratings,
  onRate, onToggleFavorite, onBack,
}) {
  const [showShare, setShowShare] = useState(false);

  if (!recipe) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <p className={textMuted}>Resep tidak ditemukan.</p>
        <button onClick={onBack} className="mt-4 text-orange-500 font-semibold">← Kembali</button>
      </div>
    );
  }

  const isFav = (favorites || []).includes(recipe.id);

  const priceLabel = {
    'tidak ditentukan': 'Tidak Ditentukan',
    'murah':   'Murah',
    'menengah':'Menengah',
    'mahal':   'Mahal',
  };
  const costLabel   = recipe.cost || null;
  const budgetLabel = recipe.budget ? (priceLabel[recipe.budget] || recipe.budget) : null;

  const ingredients  = safeParse(recipe.ingredients, []);
  const instructions = safeParse(recipe.instructions, []);

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Back + actions */}
      <div className="flex justify-between items-center mb-6 gap-3">
        <button onClick={onBack} className="flex items-center text-orange-500 hover:text-orange-600 font-medium transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />Kembali ke Pencarian
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowShare(s => !s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all shadow-sm border ${isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            <Share2 className="w-5 h-5" /><span className="hidden sm:inline">Bagikan</span>
          </button>
          <button
            onClick={() => {
              if (!user) { alert('Login dulu untuk menambah favorit'); return; }
              onToggleFavorite(recipe.id);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all shadow-sm border ${isFav ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100' : isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{isFav ? 'Hapus Favorit' : 'Tandai Favorit'}</span>
          </button>
        </div>
      </div>

      {showShare && (
        <div className="mb-6">
          <SharePanel recipe={recipe} isDarkMode={isDarkMode} />
        </div>
      )}

      {/* Main card */}
      <div className={`${cardBg} rounded-3xl shadow-xl overflow-hidden`}>
        {/* Hero image */}
        <div className="h-64 sm:h-96 relative">
          <img
            src={recipe.image || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end">
            <div className="p-6 sm:p-10 w-full">
              <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">{recipe.title}</h1>
              <div className="flex flex-wrap gap-4 text-white/90">
                <span className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
                  <Clock className="w-4 h-4 mr-2" />{recipe.prepTime}
                </span>
                <span className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
                  <Flame className="w-4 h-4 mr-2" />{recipe.level}
                </span>
                {costLabel && (
                  <span className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
                    <Wallet className="w-4 h-4 mr-2" />{costLabel}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <span className="text-white/70 text-sm">Rating:</span>
                <StarRating
                  recipeId={recipe.id}
                  ratings={ratings || {}}
                  onRate={(star) => {
                    if (!user) { alert('Login dulu untuk memberi rating'); return; }
                    onRate(recipe.id, star);
                  }}
                  isDarkMode={true}
                  size="md"
                  allowGuest={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-10">
          {budgetLabel && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold mb-6 ${isDarkMode ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/40' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              <Tag className="w-4 h-4" />Label Harga: {budgetLabel}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-10">
            {/* Ingredients */}
            <div className="md:col-span-1">
              <div className={`rounded-2xl p-6 border mb-6 ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-orange-50 border-orange-100'}`}>
                <h3 className={`text-xl font-bold ${textColor} mb-4 flex items-center`}>
                  <Utensils className="w-5 h-5 mr-2 text-orange-500" />Bahan-bahan
                </h3>
                {ingredients.length === 0 ? (
                  <p className={`text-sm ${textMuted}`}>—</p>
                ) : (
                  <ul className="space-y-3">
                    {ingredients.map((ing, idx) => {
                      const isMatched = (selectedIngredients || []).some(
                        s => ing.toLowerCase().includes(s.toLowerCase())
                      );
                      return (
                        <li key={idx} className="flex items-start">
                          <span className={`w-2 h-2 mt-2 mr-3 rounded-full flex-shrink-0 ${isMatched ? 'bg-orange-500' : isDarkMode ? 'bg-gray-500' : 'bg-gray-300'}`} />
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} ${isMatched ? 'font-bold text-orange-500' : ''}`}>{ing}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="md:col-span-2">
              <h3 className={`text-2xl font-bold ${textColor} mb-6 flex items-center`}>
                <ChefHat className="w-6 h-6 mr-3 text-orange-500" />Cara Membuat
              </h3>
              {instructions.length === 0 ? (
                <p className={`text-sm ${textMuted}`}>—</p>
              ) : (
                <div className="space-y-6">
                  {instructions.map((step, idx) => (
                    <div key={idx} className="flex">
                      <div className="flex-shrink-0 mr-4">
                        <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center ${isDarkMode ? 'bg-gray-700 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
                          {idx + 1}
                        </div>
                      </div>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed pt-1`}>{step}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ulasan Section - tamu & user bisa memberi ulasan */}
      <CommentSection
        recipeId={recipe.id}
        user={user}
        isDarkMode={isDarkMode}
        textColor={textColor}
        textMuted={textMuted}
        cardBg={cardBg}
      />
    </div>
  );
}
