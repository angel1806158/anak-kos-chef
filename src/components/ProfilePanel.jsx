import React from 'react';
import { ChevronRight, History, Heart, Plus, BookOpen, LogOut, Shield, Music } from 'lucide-react';

export function ProfilePanel({
  isDarkMode, favorites, recipeHistory, role, user,
  onClose, onLogout, onNavigate, recipesCount,
}) {
  const isAdmin  = role === 'admin';
  const panelBg  = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const textPri  = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const textSec  = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const divider  = isDarkMode ? 'border-gray-800' : 'border-gray-100';
  const rowHover = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50';

  const MenuRow = ({ icon: Icon, iconBg, iconColor, label, subtitle, onClick }) => (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors border-b ${divider} ${rowHover}`}>
      <div className={`p-2 rounded-xl flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm ${textPri}`}>{label}</p>
        {subtitle && <p className={`text-xs mt-0.5 ${textSec}`}>{subtitle}</p>}
      </div>
      <ChevronRight className={`w-4 h-4 flex-shrink-0 ${textSec}`} />
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 z-[9980]" onClick={onClose} />
      <div
        className={`fixed top-[74px] right-4 w-[320px] max-h-[82vh] rounded-2xl shadow-2xl border z-[9990] flex flex-col overflow-hidden ${panelBg}`}
        style={{ animation: 'slideInPanel 0.18s cubic-bezier(0.34,1.2,0.64,1) both' }}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b ${divider} ${isDarkMode ? 'bg-gray-800/80' : 'bg-gradient-to-br from-orange-50 to-rose-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${user.avatarColor} flex items-center justify-center text-white font-black text-sm shadow-lg flex-shrink-0`}>
              {user.avatar}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm leading-tight ${textPri} truncate`}>{user.name}</span>
                {isAdmin && (
                  <span className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                    <Shield className="w-2.5 h-2.5" />ADMIN
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 truncate ${textSec}`}>{user.identifier}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto">
          {!isAdmin ? (
            <>
              <MenuRow icon={History}
                iconBg={isDarkMode ? 'bg-orange-500/15' : 'bg-orange-50'}
                iconColor={isDarkMode ? 'text-orange-400' : 'text-orange-500'}
                label="Riwayat Kunjungan"
                subtitle={`${recipeHistory.length} resep dikunjungi`}
                onClick={() => { onNavigate('history'); onClose(); }} />
              <MenuRow icon={Heart}
                iconBg={isDarkMode ? 'bg-red-500/15' : 'bg-red-50'}
                iconColor={isDarkMode ? 'text-red-400' : 'text-red-500'}
                label="Koleksi Favorit"
                subtitle={`${favorites.length} resep tersimpan`}
                onClick={() => { onNavigate('favorites'); onClose(); }} />
            </>
          ) : (
            <>
              <MenuRow icon={Plus}
                iconBg={isDarkMode ? 'bg-orange-500/15' : 'bg-orange-50'}
                iconColor={isDarkMode ? 'text-orange-400' : 'text-orange-500'}
                label="Input Resep Baru"
                onClick={() => { onNavigate('addRecipe'); onClose(); }} />
              <MenuRow icon={BookOpen}
                iconBg={isDarkMode ? 'bg-blue-500/15' : 'bg-blue-50'}
                iconColor={isDarkMode ? 'text-blue-400' : 'text-blue-500'}
                label="Koleksi Resep"
                subtitle={`${recipesCount} resep terdaftar`}
                onClick={() => { onNavigate('adminCollection'); onClose(); }} />
              <MenuRow icon={Music}
                iconBg={isDarkMode ? 'bg-indigo-500/15' : 'bg-indigo-50'}
                iconColor={isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}
                label="Manajemen Lagu"
                subtitle="Kelola lagu untuk pengguna"
                onClick={() => { onNavigate('adminSongs'); onClose(); }} />
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`px-5 py-3 border-t ${divider} ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50/80'}`}>
          <button onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-semibold">Keluar Akun</span>
          </button>
        </div>
      </div>
    </>
  );
}
