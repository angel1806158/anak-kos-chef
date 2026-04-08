import React, { useState } from 'react';
import { ChefHat, X, ChevronLeft, ChevronRight, User, Shield, Plus } from 'lucide-react';

export function AuthModal({ isDarkMode, onClose, onLoginSuccess }) {
  // modes: landing | user_choice | user_login | user_register | admin_login
  const [mode,    setMode]    = useState('landing');
  const [form,    setForm]    = useState({ identifier: '', name: '', password: '', confirmPassword: '', adminCode: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const bg      = isDarkMode ? 'bg-gray-900'     : 'bg-white';
  const border  = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const textPri = isDarkMode ? 'text-gray-100'   : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400'   : 'text-gray-500';
  const divCls  = isDarkMode ? 'border-gray-800' : 'border-gray-100';
  const inputCls = isDarkMode
    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-orange-400 focus:ring-orange-400/20'
    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400/20';

  const reset = (nextMode) => {
    setError('');
    setForm({ identifier: '', name: '', password: '', confirmPassword: '', adminCode: '' });
    setMode(nextMode);
  };

  const backTo = {
    user_choice: 'landing', user_login: 'user_choice',
    user_register: 'user_choice', admin_login: 'landing',
  };

  const isAdmin = mode === 'admin_login';

  const headerTitle = {
    landing: 'AnakKosChef', user_choice: 'Akun User',
    user_login: 'Login User', user_register: 'Daftar Akun Baru', admin_login: 'Login Admin',
  };

  const headerGrad = isAdmin
    ? (isDarkMode ? 'from-amber-900/30 to-gray-800' : 'from-amber-50 to-orange-50')
    : mode === 'user_register'
      ? (isDarkMode ? 'from-blue-900/30 to-gray-800' : 'from-blue-50 to-indigo-50')
      : (isDarkMode ? 'from-orange-900/30 to-gray-800' : 'from-orange-50 to-rose-50');

  const headerAccent = isAdmin
    ? (isDarkMode ? 'text-amber-300' : 'text-amber-800')
    : (isDarkMode ? 'text-orange-300' : 'text-orange-800');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'user_register') {
        if (!form.identifier || !form.name || !form.password || !form.confirmPassword) throw new Error('Semua kolom wajib diisi.');
        if (form.password.length < 6) throw new Error('Password minimal 6 karakter.');
        if (form.password !== form.confirmPassword) throw new Error('Konfirmasi password tidak cocok.');
        await onLoginSuccess('register', form);
      } else if (mode === 'user_login') {
        if (!form.identifier || !form.password) throw new Error('Email dan password wajib diisi.');
        await onLoginSuccess('login', form);
      } else if (mode === 'admin_login') {
        if (!form.identifier || !form.adminCode) throw new Error('Email dan kode admin wajib diisi.');
        await onLoginSuccess('admin', { ...form, password: form.adminCode });
      }
    } catch (err) {
      setError(err.message || 'Gagal terhubung ke server.');
    }
    setLoading(false);
  };

  const inputField = (key, type, placeholder, label) => (
    <div>
      <label className={`text-xs font-semibold uppercase tracking-wide mb-1.5 block ${textSec}`}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 transition-all ${inputCls}`}
      />
    </div>
  );

  const submitBtn = (label, loadingLabel, gradient) => (
    <button type="submit" disabled={loading}
      className={`w-full py-3 rounded-xl font-bold text-sm ${gradient} text-white hover:opacity-90 transition-opacity shadow-md disabled:opacity-60 flex items-center justify-center gap-2`}>
      {loading
        ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{loadingLabel}</>
        : label}
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[9990]" onClick={onClose} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-8 pointer-events-none">
        <div
          className={`relative w-full max-w-sm flex flex-col rounded-2xl shadow-2xl border pointer-events-auto ${bg} ${border}`}
          style={{ maxHeight: 'min(88vh, 640px)', animation: 'slideInPanel 0.2s cubic-bezier(0.34,1.2,0.64,1) both' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex-shrink-0 px-5 py-4 flex items-center justify-between border-b ${divCls} bg-gradient-to-r ${headerGrad} rounded-t-2xl`}>
            <div className="flex items-center gap-2.5">
              {mode !== 'landing' && (
                <button onClick={() => reset(backTo[mode])}
                  className={`p-1.5 rounded-lg mr-0.5 ${isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/5 text-gray-500'}`}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <div className={`p-1.5 rounded-lg ${isAdmin ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-orange-500 to-red-500'}`}>
                {isAdmin ? <Shield className="w-4 h-4 text-white" /> : <ChefHat className="w-4 h-4 text-white" />}
              </div>
              <span className={`font-bold text-sm ${headerAccent}`}>{headerTitle[mode]}</span>
            </div>
            <button onClick={onClose} className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/5 text-gray-500'}`}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* Landing */}
            {mode === 'landing' && (
              <div className="px-5 py-5 space-y-4">
                <button onClick={() => reset('user_choice')}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all hover:scale-[1.01] text-left ${isDarkMode ? 'border-gray-700 hover:border-orange-500/50 bg-gray-800/60' : 'border-gray-200 hover:border-orange-300 bg-white hover:bg-orange-50/40'}`}>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-base ${textPri}`}>User</p>
                    <p className={`text-xs mt-0.5 ${textSec}`}>Login atau daftar akun baru</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 flex-shrink-0 ${textSec}`} />
                </button>

                <div className="flex items-center gap-3">
                  <div className={`flex-1 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                  <span className={`text-xs ${textSec}`}>atau</span>
                  <div className={`flex-1 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                </div>

                <button onClick={() => reset('admin_login')}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all hover:scale-[1.01] text-left ${isDarkMode ? 'border-amber-500/25 hover:border-amber-400/50 bg-gray-800/60' : 'border-amber-200 hover:border-amber-400 bg-white hover:bg-amber-50/40'}`}>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-base ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>Admin</p>
                    <p className={`text-xs mt-0.5 ${textSec}`}>Khusus tim pengelola</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 flex-shrink-0 ${textSec}`} />
                </button>
              </div>
            )}

            {/* User Choice */}
            {mode === 'user_choice' && (
              <div className="px-5 py-5 space-y-4">
                <p className={`text-sm text-center font-medium ${textSec}`}>Pilih cara masuk ke akun kamu</p>
                <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button onClick={() => reset('user_login')}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-colors border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-100 hover:bg-orange-50/60'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                      <User className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm ${textPri}`}>Login</p>
                      <p className={`text-xs mt-0.5 ${textSec}`}>Masuk dengan email dan password</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${textSec}`} />
                  </button>
                  <button onClick={() => reset('user_register')}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50/60'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                      <Plus className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm ${textPri}`}>Daftar</p>
                      <p className={`text-xs mt-0.5 ${textSec}`}>Buat akun baru dengan email</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${textSec}`} />
                  </button>
                </div>
              </div>
            )}

            {/* User Login */}
            {mode === 'user_login' && (
              <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
                {inputField('identifier', 'text', 'contoh@email.com', 'Email')}
                {inputField('password', 'password', 'Masukkan password', 'Password')}
                {error && <p className={`text-xs text-red-500 font-medium px-3 py-2 rounded-lg ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>{error}</p>}
                {submitBtn('Login', 'Masuk...', 'bg-gradient-to-r from-orange-500 to-rose-500')}
              </form>
            )}

            {/* User Register */}
            {mode === 'user_register' && (
              <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
                {inputField('identifier', 'text', 'contoh@email.com', 'Email')}
                {inputField('name', 'text', 'Nama kamu', 'Nama Lengkap')}
                {inputField('password', 'password', 'Minimal 6 karakter', 'Atur Password')}
                {inputField('confirmPassword', 'password', 'Ulangi password kamu', 'Konfirmasi Password')}
                {error && <p className={`text-xs text-red-500 font-medium px-3 py-2 rounded-lg ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>{error}</p>}
                {submitBtn('Buat Akun', 'Mendaftar...', 'bg-gradient-to-r from-blue-500 to-indigo-500')}
              </form>
            )}

            {/* Admin Login */}
            {mode === 'admin_login' && (
              <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
                {inputField('identifier', 'text', 'Email admin kamu', 'Email Admin')}
                {inputField('adminCode', 'password', 'Masukkan password admin', 'Password Khusus Admin')}
                {error && <p className={`text-xs text-red-500 font-medium px-3 py-2 rounded-lg ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>{error}</p>}
                {submitBtn('Masuk', 'Verifikasi...', 'bg-gradient-to-r from-amber-500 to-orange-500')}
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
