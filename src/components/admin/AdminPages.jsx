import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft, Plus, BookMarked, ChefHat, BookOpen, BarChart3,
  Eye, Star, Heart, Trash2, Edit2, X, TrendingUp, Users, Utensils,
  MessageCircle, CornerDownRight, Send, Tag, Music, Upload, Play,
  Pause, SkipForward, SkipBack, Volume2, VolumeX, ListMusic, Check,
} from 'lucide-react';
import { adminAPI, commentAPI } from '../../api';
import { StarRating } from '../rating/StarRating';

const useFormTheme = (isDarkMode) => ({
  bg:      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
  input:   isDarkMode
    ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-orange-400'
    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-400',
  label:   isDarkMode ? 'text-gray-300' : 'text-gray-600',
  divider: isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-gray-50',
});

// ─── RECIPE FORM ─────────────────────────────────────────────
function RecipeForm({ initial, isDarkMode, onSubmit, onCancel, submitLabel = 'Simpan Resep' }) {
  const { bg, input, label: labelCls, divider } = useFormTheme(isDarkMode);
  const [form,   setForm]   = useState(initial);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => set('imagePreview', reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.prepTime) { alert('Nama resep dan waktu masak wajib diisi!'); return; }
    setSaving(true);
const payload = {
  title: form.title,
  category: form.category,
  subCategory: form.subCategory,
  budget: form.budget || null,
  cost: form.cost || 'Murah',
  priceLabel: form.priceLabel || 'tidak ditentukan',
  level: form.level,
  prepTime: form.prepTime,
  prepTimeMinutes: parseInt(form.prepTime) || 0,
  image: form.imagePreview || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',

  ingredients: (form.ingredients || '')
    .split('\n')
    .filter((i) => i.trim()),

  instructions: (form.instructions || '')
    .split('\n')
    .filter((i) => i.trim()),
};
    try { await onSubmit(payload); } finally { setSaving(false); }
  };

  const selectField = (key, options, labelText) => (
    <div>
      <label className={`text-xs font-bold uppercase tracking-wide mb-2 block ${labelCls}`}>{labelText}</label>
      <select value={form[key]} onChange={(e) => set(key, e.target.value)}
        className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-400/30 transition-all ${input}`}>
        {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  );

  return (
    <div className={`${bg} rounded-2xl border shadow-sm overflow-hidden`}>
      <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        {form.imagePreview ? (
          <div className="h-48 overflow-hidden relative">
            <img src={form.imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white font-bold text-sm bg-black/60 px-4 py-2 rounded-xl">Klik untuk Ganti Foto</span>
            </div>
          </div>
        ) : (
          <div className={`h-48 flex flex-col items-center justify-center gap-2 border-b-2 border-dashed transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:border-orange-400' : 'bg-gray-100 border-gray-300 hover:border-orange-400'}`}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
              <ChefHat className={`w-7 h-7 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            </div>
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Klik untuk upload foto resep</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>PNG atau JPG, maks. 5MB</p>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleImageChange} className="hidden" />
      </div>

      <div className="p-6 space-y-5">
        <div>
          <label className={`text-xs font-bold uppercase tracking-wide mb-2 block ${labelCls}`}>Nama Resep</label>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Contoh: Nasi Goreng Spesial"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-400/30 transition-all ${input}`} />
        </div>
        <div>
          <label className={`text-xs font-bold uppercase tracking-wide mb-2 block ${labelCls}`}>Waktu Masak</label>
          <input value={form.prepTime} onChange={(e) => set('prepTime', e.target.value)} placeholder="Contoh: 15 Menit"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-400/30 transition-all ${input}`} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {selectField('category', ['Sarapan', 'Makan Siang', 'Makan Malam', 'Camilan'], 'Kategori')}
          {selectField('level', ['Mudah', 'Sedang', 'Susah'], 'Tingkat Kesulitan')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {selectField('subCategory', [
            { value: 'kuliner indonesia', label: 'Kuliner Indonesia' },
            { value: 'western food',      label: 'Western Food' },
            { value: 'dessert',           label: 'Dessert' },
            { value: 'drink',             label: 'Minuman' },
          ], 'Eksplorasi Rasa')}
          {selectField('budget', [
            { value: '',     label: '— Tidak Ditentukan —' },
            { value: 'muda', label: 'Tanggal Muda' },
            { value: 'tua',  label: 'Tanggal Tua' },
          ], 'Khusus Mahasiswa')}
        </div>
        <div>
          <label className={`text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5 ${labelCls}`}>
            <Tag className="w-3.5 h-3.5" />Label Harga
          </label>
          <select value={form.priceLabel} onChange={(e) => set('priceLabel', e.target.value)}
            className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-400/30 transition-all ${input}`}>
            <option value="tidak ditentukan">Tidak Ditentukan</option>
            <option value="murah">Murah</option>
            <option value="menengah">Menengah</option>
            <option value="mahal">Mahal</option>
          </select>
        </div>
        <div>
          <label className={`text-xs font-bold uppercase tracking-wide mb-2 block ${labelCls}`}>
            Bahan-bahan <span className="font-normal opacity-60">(satu baris = satu bahan)</span>
          </label>
          <textarea rows={5} value={form.ingredients} onChange={(e) => set('ingredients', e.target.value)}
            placeholder={'1 butir Telur\n2 siung Bawang Putih\n...'}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-400/30 resize-none transition-all ${input}`} />
        </div>
        <div>
          <label className={`text-xs font-bold uppercase tracking-wide mb-2 block ${labelCls}`}>
            Langkah-langkah <span className="font-normal opacity-60">(satu baris = satu langkah)</span>
          </label>
          <textarea rows={6} value={form.instructions} onChange={(e) => set('instructions', e.target.value)}
            placeholder={'Panaskan minyak di wajan...\nTumis bawang hingga harum...'}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-400/30 resize-none transition-all ${input}`} />
        </div>
      </div>

      <div className={`px-6 py-4 border-t ${divider} flex gap-3`}>
        <button onClick={onCancel}
          className={`flex-1 py-3 rounded-xl font-bold text-sm border transition-colors ${isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
          Batal
        </button>
        <button onClick={handleSubmit} disabled={saving}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${saving ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:opacity-90'}`}>
          {saving ? <><BookMarked className="w-4 h-4" />Tersimpan!</> : submitLabel}
        </button>
      </div>
    </div>
  );
}

const BLANK_FORM = {
  title: '', category: 'Makan Siang', subCategory: 'kuliner indonesia',
  budget: '', level: 'Mudah', prepTime: '',
  ingredients: '', instructions: '', imagePreview: '',
  priceLabel: 'tidak ditentukan', cost: 'Murah',
};

// ─── ADD RECIPE PAGE ─────────────────────────────────────────
export function AddRecipePage({ isDarkMode, textColor, onBack, onSave }) {
  return (
    <div className="max-w-2xl mx-auto pb-12 animate-in fade-in duration-300">
      <button onClick={onBack} className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 font-semibold text-sm mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5" />Kembali ke Beranda
      </button>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 shadow-md">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${textColor}`}>Input Resep Baru</h2>
      </div>
      <RecipeForm
        initial={BLANK_FORM}
        isDarkMode={isDarkMode}
        onSubmit={async (payload) => { await onSave(payload); onBack(); }}
        onCancel={onBack}
        submitLabel="Simpan Resep"
      />
    </div>
  );
}

// ─── EDIT RECIPE MODAL ────────────────────────────────────────
export function EditRecipeModal({ recipe, isDarkMode, onClose, onSave }) {
  const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const initial = {
    title:        recipe.title,
    category:     recipe.category,
    subCategory:  recipe.subCategory ?? 'kuliner indonesia',
    budget:       recipe.budget ?? '',
    level:        recipe.level,
    prepTime:     recipe.prepTime,
    cost:         recipe.cost || 'Murah',
    priceLabel:   recipe.priceLabel || 'tidak ditentukan',
    ingredients:  Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : recipe.ingredients,
    instructions: Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : recipe.instructions,
    imagePreview: recipe.image ?? '',
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[9990]" onClick={onClose} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-8 overflow-y-auto pointer-events-none">
        <div className="relative w-full max-w-2xl pointer-events-auto" style={{ animation: 'slideInPanel 0.2s cubic-bezier(0.34,1.2,0.64,1) both' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                <Edit2 className="w-5 h-5 text-white" />
              </div>
              <h2 className={`text-xl font-bold ${textColor}`}>Edit Resep</h2>
            </div>
            <button onClick={onClose} className={`p-2 rounded-xl ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <RecipeForm
            initial={initial}
            isDarkMode={isDarkMode}
            onSubmit={async (payload) => { await onSave(recipe.id, payload); onClose(); }}
            onCancel={onClose}
            submitLabel="Update Resep"
          />
        </div>
      </div>
    </>
  );
}

// ─── ADMIN COMMENT PANEL ──────────────────────────────────────
function AdminCommentPanel({ recipeId, isDarkMode, textColor, textMuted }) {
  const [comments, setComments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [replyId,  setReplyId]  = useState(null);
  const [replyText,setReplyText]= useState('');

  useEffect(() => {
    commentAPI.getByRecipe(recipeId)
      .then(d => setComments(Array.isArray(d) ? d : []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [recipeId]);

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;
    try {
      await commentAPI.reply(commentId, replyText.trim());
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, adminReply: replyText.trim() } : c));
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

  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  if (loading) return <div className="py-6 flex justify-center"><div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (comments.length === 0) return <p className={`text-sm text-center py-4 ${textMuted}`}>Belum ada ulasan untuk resep ini.</p>;

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {comments.map((c) => (
        <div key={c.id} className={`rounded-xl p-3 border text-sm ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <span className={`font-bold text-xs ${textColor}`}>{c.userName}</span>
              <span className={`text-xs ${textMuted}`}>{formatDate(c.createdAt)}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setReplyId(replyId === c.id ? null : c.id); setReplyText(''); }}
                className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${isDarkMode ? 'text-blue-400 hover:bg-blue-500/10' : 'text-blue-500 hover:bg-blue-50'}`}>
                Balas
              </button>
              <button onClick={() => handleDelete(c.id)}
                className={`p-1 rounded-lg ${isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-400 hover:bg-red-50'}`}>
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{c.content}</p>
          {c.adminReply && (
            <div className={`mt-2 ml-3 pl-2 border-l-2 ${isDarkMode ? 'border-orange-500/50' : 'border-orange-300'}`}>
              <div className="flex items-center gap-1 mb-0.5">
                <CornerDownRight className="w-3 h-3 text-orange-500" />
                <span className="text-xs font-bold text-orange-500">Admin</span>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{c.adminReply}</p>
            </div>
          )}
          {replyId === c.id && (
            <div className="mt-2 flex gap-2">
              <input value={replyText} onChange={e => setReplyText(e.target.value)}
                placeholder="Balas komentar ini..."
                className={`flex-1 px-2.5 py-1.5 rounded-lg border text-xs outline-none ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <button onClick={() => handleReply(c.id)} disabled={!replyText.trim()}
                className="px-2.5 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold disabled:opacity-50 hover:bg-orange-600">
                <Send className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── RECIPE DETAIL PAGE (for Admin Collection) ────────────────
function AdminRecipeDetailPage({ recipe, isDarkMode, textColor, textMuted, cardBg, recipeStats, onBack, onEdit, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const stat      = recipeStats?.[recipe.id] ?? {};
  const visitPct  = stat.visitPct  ?? 0;
  const savedPct  = stat.savedPct  ?? 0;
  const avgRating = stat.avgRating ?? 0;
  const ratingPct = avgRating > 0 ? Math.round((avgRating / 5) * 100) : 0;
  const textSec   = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const handleDelete = async () => {
    if (!window.confirm(`Hapus resep "${recipe.title}"?`)) return;
    setDeleting(true);
    try { await onDelete(recipe.id); onBack(); } finally { setDeleting(false); }
  };

  const ingArr = Array.isArray(recipe.ingredients) ? recipe.ingredients
    : (() => { try { return JSON.parse(recipe.ingredients || '[]'); } catch { return []; } })();
  const insArr = Array.isArray(recipe.instructions) ? recipe.instructions
    : (() => { try { return JSON.parse(recipe.instructions || '[]'); } catch { return []; } })();

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 font-semibold text-sm transition-colors">
          <ChevronLeft className="w-5 h-5" />Kembali ke Koleksi
        </button>
        <div className="flex gap-2">
          <button onClick={() => onEdit(recipe)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 transition-colors">
            <Edit2 className="w-4 h-4" />Edit
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50">
            <Trash2 className="w-4 h-4" />{deleting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className={`${cardBg} rounded-3xl shadow-xl overflow-hidden mb-6`}>
        <div className="h-56 sm:h-72 relative">
          <img
            src={recipe.image || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-6 w-full">
              <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">{recipe.title}</h1>
              <div className="flex flex-wrap gap-2 text-white/80 text-sm">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">{recipe.prepTime}</span>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">{recipe.level}</span>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">{recipe.category}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Statistik real-time */}
          <h3 className={`font-bold text-base mb-4 flex items-center gap-2 ${textColor}`}>
            <BarChart3 className="w-4 h-4 text-purple-500" />Statistik Real-time
          </h3>
          <div className="space-y-3 mb-6">
            {[
              { icon: Eye,   label: 'Dikunjungi',   pct: visitPct,  color: 'blue',  valueLabel: `${visitPct}%` },
              { icon: Heart, label: 'Difavoritkan', pct: savedPct,  color: 'rose',  valueLabel: `${savedPct}%` },
              { icon: Star,  label: 'Rating',        pct: ratingPct, color: 'amber', valueLabel: avgRating > 0 ? `${avgRating} / 5` : 'Belum ada rating' },
            ].map(({ icon: Icon, label, pct, color, valueLabel }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`flex items-center gap-1.5 text-sm ${textSec}`}><Icon className="w-4 h-4" />{label}</span>
                  <span className={`text-sm font-bold ${isDarkMode ? `text-${color}-400` : `text-${color}-600`}`}>{valueLabel}</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className={`h-full rounded-full bg-${color}-500`} style={{ width: `${pct}%`, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Bahan & Langkah */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className={`font-bold text-sm mb-2 ${textColor}`}>Bahan-bahan</h4>
              <ul className="space-y-1.5">
                {ingArr.map((ing, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${textSec}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className={`font-bold text-sm mb-2 ${textColor}`}>Cara Membuat</h4>
              <ol className="space-y-2">
                {insArr.map((step, i) => (
                  <li key={i} className={`flex gap-2 text-sm ${textSec}`}>
                    <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isDarkMode ? 'bg-gray-700 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Ulasan */}
          <div className={`pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <h4 className={`font-bold text-sm mb-3 flex items-center gap-1.5 ${textColor}`}>
              <MessageCircle className="w-4 h-4 text-orange-500" />Ulasan Pengguna
            </h4>
            <AdminCommentPanel
              recipeId={recipe.id}
              isDarkMode={isDarkMode}
              textColor={textColor}
              textMuted={textSec}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN COLLECTION PAGE ────────────────────────────────────
export function AdminCollectionPage({ isDarkMode, textColor, textMuted, cardBg, onBack, recipesData, ratings, onUpdateRecipe, onDeleteRecipe }) {
  const [editTarget,   setEditTarget]   = useState(null);
  const [detailRecipe, setDetailRecipe] = useState(null);
  const [recipeStats,  setRecipeStats]  = useState({});
  const [loadingStats, setLoadingStats] = useState(true);

  // Muat & refresh statistik real-time setiap 15 detik
  const loadStats = () => {
    adminAPI.getRecipeStats()
      .then(setRecipeStats)
      .catch(() => {});
  };

  useEffect(() => {
    loadStats();
    setLoadingStats(false);
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, []);

  if (detailRecipe) {
    return (
      <AdminRecipeDetailPage
        recipe={detailRecipe}
        isDarkMode={isDarkMode} textColor={textColor} textMuted={textMuted} cardBg={cardBg}
        recipeStats={recipeStats}
        onBack={() => setDetailRecipe(null)}
        onEdit={(r) => { setDetailRecipe(null); setEditTarget(r); }}
        onDelete={async (id) => { await onDeleteRecipe(id); setDetailRecipe(null); }}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      <button onClick={onBack} className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 font-semibold text-sm mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5" />Kembali ke Beranda
      </button>
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
        <h2 className={`text-2xl font-bold ${textColor}`}>Koleksi Resep</h2>
        <span className={`text-sm ${textMuted}`}>({recipesData.length} resep)</span>
        <span className={`text-xs ${textMuted} animate-pulse`}>● Live</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {recipesData.map((r) => {
          const stat      = recipeStats?.[r.id] ?? {};
          const avgRating = stat.avgRating ?? 0;
          const visitPct  = stat.visitPct  ?? 0;
          const savedPct  = stat.savedPct  ?? 0;
          const textSec   = isDarkMode ? 'text-gray-400' : 'text-gray-500';

          return (
            <div
              key={r.id}
              onClick={() => setDetailRecipe(r)}
              className={`${cardBg} rounded-2xl overflow-hidden shadow-sm border cursor-pointer hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5`}
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={r.image || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'}
                  alt={r.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'; }}
                />
                {/* Edit & delete tetap bisa diklik tanpa buka detail */}
                <div className="absolute top-3 right-3 flex gap-1.5" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setEditTarget(r)} className="p-1.5 rounded-lg bg-blue-500/90 text-white hover:bg-blue-600 shadow backdrop-blur-sm transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={async () => {
                    if (!window.confirm(`Hapus resep "${r.title}"?`)) return;
                    await onDeleteRecipe(r.id);
                  }} className="p-1.5 rounded-lg bg-red-500/90 text-white hover:bg-red-600 shadow backdrop-blur-sm transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className={`font-bold text-sm ${textColor} line-clamp-1 mb-0.5`}>{r.title}</h3>
                <span className={`text-xs ${textSec}`}>{r.prepTime} · {r.level}</span>

                {/* Mini stats */}
                <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between`}>
                  <span className={`flex items-center gap-1 text-xs ${textSec}`}>
                    <Eye className="w-3 h-3" />{visitPct}%
                  </span>
                  <span className={`flex items-center gap-1 text-xs ${textSec}`}>
                    <Heart className="w-3 h-3" />{savedPct}%
                  </span>
                  <span className={`flex items-center gap-1 text-xs ${textSec}`}>
                    <Star className="w-3 h-3" />{avgRating > 0 ? `${avgRating}/5` : '-'}
                  </span>
                  <span className={`text-xs font-semibold text-blue-500`}>Lihat Detail →</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editTarget && (
        <EditRecipeModal
          key={editTarget.id}
          recipe={editTarget} isDarkMode={isDarkMode}
          onClose={() => setEditTarget(null)}
          onSave={async (id, payload) => { await onUpdateRecipe(id, payload); setEditTarget(null); }}
        />
      )}
    </div>
  );
}

// ─── ADMIN DASHBOARD PAGE ─────────────────────────────────────
export function AdminDashboardPage({ isDarkMode, textColor, textMuted, cardBg, onBack, recipesData }) {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboardStats()
      .then(setStats)
      .catch(() => {
        setStats({
          totalRecipes:   recipesData.length,
          totalUsers:     '--',
          totalViews:     '--',
          totalFavorites: '--',
          topRecipes:     recipesData.slice(0, 5).map((r) => ({ ...r, views: 0, favorites: 0 })),
        });
      })
      .finally(() => setLoading(false));
  }, [recipesData]);

  const statCard = (icon, label, value, gradient) => (
    <div className={`${cardBg} rounded-2xl p-5 border shadow-sm`}>
      <div className={`inline-flex p-2.5 rounded-xl mb-3 bg-gradient-to-br ${gradient}`}>{icon}</div>
      <p className={`text-2xl font-black ${textColor}`}>{loading ? '...' : value}</p>
      <p className={`text-sm mt-0.5 ${textMuted}`}>{label}</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      <button onClick={onBack} className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 font-semibold text-sm mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5" />Kembali ke Beranda
      </button>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
        <h2 className={`text-2xl font-bold ${textColor}`}>Dashboard Admin</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCard(<Utensils className="w-5 h-5 text-white" />, 'Total Resep',    stats?.totalRecipes,   'from-orange-400 to-rose-500')}
        {statCard(<Users    className="w-5 h-5 text-white" />, 'Total User',     stats?.totalUsers,     'from-blue-400 to-indigo-500')}
        {statCard(<Eye      className="w-5 h-5 text-white" />, 'Total Kunjungan',stats?.totalViews,     'from-teal-400 to-green-500')}
        {statCard(<Heart    className="w-5 h-5 text-white" />, 'Total Favorit',  stats?.totalFavorites, 'from-pink-400 to-rose-500')}
      </div>

      {stats?.topRecipes?.length > 0 && (
        <div className={`${cardBg} rounded-2xl border shadow-sm overflow-hidden`}>
          <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center gap-2`}>
            <TrendingUp className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
            <h3 className={`font-bold ${textColor}`}>Resep Paling Populer</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.topRecipes.map((r, idx) => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className={`text-lg font-black w-6 text-center ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : textMuted}`}>
                  {idx + 1}
                </span>
                <img src={r.image} alt={r.title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${textColor}`}>{r.title}</p>
                  <p className={`text-xs ${textMuted}`}>{r.category} · {r.level}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}><Eye className="w-3 h-3" />{r.views}</span>
                  <span className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}><Heart className="w-3 h-3" />{r.favorites}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SONG MANAGER (Admin) ─────────────────────────────────────
// Key di localStorage untuk menyimpan daftar lagu admin
const SONGS_STORAGE_KEY = 'anakkos_songs_v1';

function loadSongs() {
  try {
    const raw = localStorage.getItem(SONGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSongs(songs) {
  localStorage.setItem(SONGS_STORAGE_KEY, JSON.stringify(songs));
}

export function AdminSongManagerPage({ isDarkMode, textColor, textMuted, cardBg, onBack }) {
  const { input, label: labelCls } = useFormTheme(isDarkMode);
  const [songs,    setSongs]    = useState(loadSongs);
  const [title,    setTitle]    = useState('');
  const [youtubeId,setYoutubeId]= useState('');
  const [error,    setError]    = useState('');
  const [saved,    setSaved]    = useState(false);

  const extractId = (val) => {
    // Accept raw ID or full URL
    const urlMatch = val.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    if (urlMatch) return urlMatch[1];
    if (/^[A-Za-z0-9_-]{11}$/.test(val.trim())) return val.trim();
    return null;
  };

  const handleAdd = () => {
    setError('');
    if (!title.trim()) { setError('Judul lagu wajib diisi'); return; }
    const id = extractId(youtubeId.trim());
    if (!id) { setError('YouTube ID atau URL tidak valid. Contoh: dQw4w9WgXcQ'); return; }
    if (songs.find(s => s.id === id)) { setError('Lagu sudah ada di daftar'); return; }
    const newSongs = [...songs, { id, title: title.trim() }];
    setSongs(newSongs);
    saveSongs(newSongs);
    setTitle(''); setYoutubeId('');
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = (id) => {
    const newSongs = songs.filter(s => s.id !== id);
    setSongs(newSongs);
    saveSongs(newSongs);
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 animate-in fade-in duration-300">
      <button onClick={onBack} className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 font-semibold text-sm mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5" />Kembali ke Beranda
      </button>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
          <Music className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${textColor}`}>Manajemen Lagu</h2>
          <p className={`text-sm ${textMuted}`}>Tambah lagu dari YouTube untuk diputar pengguna</p>
        </div>
      </div>

      {/* Form tambah lagu */}
      <div className={`${cardBg} rounded-2xl border shadow-sm p-6 mb-6`}>
        <h3 className={`font-bold mb-4 ${textColor}`}>Tambah Lagu Baru</h3>
        <div className="space-y-4">
          <div>
            <label className={`text-xs font-bold uppercase tracking-wide mb-2 block ${labelCls}`}>Judul Lagu</label>
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Cha Cha Cha - Käärijä"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all ${input}`}
            />
          </div>
          <div>
            <label className={`text-xs font-bold uppercase tracking-wide mb-2 block ${labelCls}`}>YouTube ID atau URL</label>
            <input
              value={youtubeId} onChange={e => setYoutubeId(e.target.value)}
              placeholder="Contoh: dQw4w9WgXcQ atau https://youtube.com/watch?v=..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all ${input}`}
            />
            <p className={`text-xs mt-1.5 ${textMuted}`}>
              Copy ID dari URL YouTube: youtube.com/watch?v=<strong>ID_INI</strong>
            </p>
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <button onClick={handleAdd}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${saved ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90'}`}>
            {saved ? <><Check className="w-4 h-4" />Lagu Ditambahkan!</> : <><Plus className="w-4 h-4" />Tambah Lagu</>}
          </button>
        </div>
      </div>

      {/* Daftar lagu */}
      <div className={`${cardBg} rounded-2xl border shadow-sm overflow-hidden`}>
        <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <ListMusic className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
            <h3 className={`font-bold ${textColor}`}>Daftar Lagu ({songs.length})</h3>
          </div>
        </div>
        {songs.length === 0 ? (
          <div className="py-12 text-center">
            <Music className={`w-10 h-10 mx-auto mb-3 ${textMuted}`} />
            <p className={`text-sm ${textMuted}`}>Belum ada lagu. Tambah lagu di atas!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {songs.map((s, idx) => (
              <div key={s.id} className={`flex items-center gap-3 px-5 py-3 ${isDarkMode ? 'divide-gray-700' : ''}`}>
                <span className={`text-xs font-bold w-5 text-center ${textMuted}`}>{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${textColor}`}>{s.title}</p>
                  <p className={`text-xs truncate ${textMuted}`}>ID: {s.id}</p>
                </div>
                <a
                  href={`https://www.youtube.com/watch?v=${s.id}`}
                  target="_blank" rel="noreferrer"
                  className={`text-xs px-2 py-1 rounded-lg ${isDarkMode ? 'text-blue-400 hover:bg-blue-500/10' : 'text-blue-500 hover:bg-blue-50'} font-semibold`}
                >
                  Preview
                </a>
                <button onClick={() => handleDelete(s.id)}
                  className={`p-1.5 rounded-lg ${isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-400 hover:bg-red-50'} transition-colors`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
