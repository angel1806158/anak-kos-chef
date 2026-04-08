import React, { useState } from 'react';
import { ChefHat, X, ChevronLeft, ChevronRight, User, Shield, Plus } from 'lucide-react';

export function AuthModal({ isDarkMode, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('landing');
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

        // ✅ REGISTER DUMMY
        onLoginSuccess({
          name: form.name,
          identifier: form.identifier,
        });

      } else if (mode === 'user_login') {
        if (!form.identifier || !form.password)
          throw new Error('Email dan password wajib diisi.');

        // ✅ LOGIN DUMMY
        onLoginSuccess({
          name: "User",
          identifier: form.identifier,
        });

      } else if (mode === 'admin_login') {
        if (!form.identifier || !form.adminCode)
          throw new Error('Isi semua data admin.');

        // ✅ ADMIN DUMMY
        onLoginSuccess({
          name: "Admin",
          identifier: form.identifier,
          role: "admin"
        });
      }

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const input = (key, type, placeholder) => (
    <input
      type={type}
      value={form[key]}
      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
      placeholder={placeholder}
      className="w-full px-4 py-2 border rounded-lg mb-3"
    />
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-5 rounded-xl w-80">
        <h2 className="font-bold mb-3 text-center">Login User</h2>

        <form onSubmit={handleSubmit}>
          {input('identifier', 'text', 'Email')}
          {mode !== 'admin_login' && input('password', 'password', 'Password')}
          {mode === 'user_register' && input('name', 'text', 'Nama')}
          {mode === 'user_register' && input('confirmPassword', 'password', 'Ulangi Password')}
          {mode === 'admin_login' && input('adminCode', 'password', 'Kode Admin')}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button className="w-full bg-orange-500 text-white py-2 rounded mt-2">
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <div className="mt-3 text-center text-sm">
          <button onClick={() => reset('user_login')}>Login</button> |
          <button onClick={() => reset('user_register')}> Daftar</button> |
          <button onClick={() => reset('admin_login')}> Admin</button>
        </div>

        <button onClick={onClose} className="mt-3 text-xs text-gray-500 w-full">Close</button>
      </div>
    </div>
  );
}