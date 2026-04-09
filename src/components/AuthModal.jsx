import React, { useState } from 'react';
import { X } from 'lucide-react';
import { authAPI } from '../api';

export function AuthModal({ isDarkMode, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('user_login');
  const [form, setForm] = useState({ identifier: '', name: '', password: '', confirmPassword: '', adminCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = (nextMode) => {
    setError('');
    setForm({ identifier: '', name: '', password: '', confirmPassword: '', adminCode: '' });
    setMode(nextMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'user_register') {
        if (!form.identifier || !form.name || !form.password || !form.confirmPassword)
          throw new Error('Semua kolom wajib diisi.');
        if (form.password !== form.confirmPassword)
          throw new Error('Password tidak cocok.');
        const result = await authAPI.register(form.name, form.identifier, form.password);
        onLoginSuccess(result.user);

      } else if (mode === 'user_login') {
        if (!form.identifier || !form.password)
          throw new Error('Email dan password wajib diisi.');
        const result = await authAPI.login(form.identifier, form.password);
        onLoginSuccess(result.user);

      } else if (mode === 'admin_login') {
        if (!form.identifier || !form.adminCode)
          throw new Error('Isi semua data admin.');
        const result = await authAPI.login(form.identifier, form.adminCode);
        if (result.user.role !== 'admin') throw new Error('Bukan akun admin.');
        onLoginSuccess(result.user);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const inputClass = `w-full px-4 py-3 border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-800'} rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition`;

  const input = (key, type, placeholder) => (
    <input
      type={type}
      value={form[key]}
      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
      placeholder={placeholder}
      className={inputClass}
    />
  );

  const titles = {
    user_login: 'Masuk Akun',
    user_register: 'Daftar Akun',
    admin_login: 'Login Admin',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-2xl shadow-2xl w-full max-w-sm p-6 relative`}>
        
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">👨‍🍳</span>
          </div>
          <h2 className="text-xl font-bold">{titles[mode]}</h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {mode === 'user_login' && 'Selamat datang kembali!'}
            {mode === 'user_register' && 'Buat akun baru kamu'}
            {mode === 'admin_login' && 'Akses panel admin'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {input('identifier', 'text', 'Email / Username')}
          {mode === 'user_register' && input('name', 'text', 'Nama Lengkap')}
          {mode !== 'admin_login' && input('password', 'password', 'Password')}
          {mode === 'user_register' && input('confirmPassword', 'password', 'Ulangi Password')}
          {mode === 'admin_login' && input('adminCode', 'password', 'Password Admin')}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-xl mb-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-400 to-rose-500 text-white font-semibold py-3 rounded-xl mt-1 hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? 'Loading...' : mode === 'user_register' ? 'Daftar' : 'Masuk'}
          </button>
        </form>

        {/* Mode switcher */}
        <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-center gap-4 text-sm`}>
          <button
            onClick={() => reset('user_login')}
            className={`font-medium transition ${mode === 'user_login' ? 'text-orange-500' : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Masuk
          </button>
          <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
          <button
            onClick={() => reset('user_register')}
            className={`font-medium transition ${mode === 'user_register' ? 'text-orange-500' : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Daftar
          </button>
          <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
          <button
            onClick={() => reset('admin_login')}
            className={`font-medium transition ${mode === 'admin_login' ? 'text-orange-500' : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}
