import React, { useState, useRef, useEffect } from 'react';
import { Coffee, Globe, GraduationCap, Menu, ChevronDown, ChevronRight, X, Heart } from 'lucide-react';
import { MEAL_TIME_ITEMS, LEVEL_OPTIONS, TIME_OPTIONS, EKSPLORASI_ITEMS, MAHASISWA_ITEMS } from '../../config';

const pillCls = (isActive, isDarkMode) =>
  isDarkMode
    ? isActive
      ? 'bg-white/20 text-white ring-1 ring-white/50 shadow-md scale-105'
      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white hover:scale-105'
    : isActive
      ? 'bg-white text-orange-600 shadow-md scale-105 ring-2 ring-white/60'
      : 'bg-white/25 text-white hover:bg-white/40 hover:scale-105';

function useDropdown() {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState({ top: 0, left: 0 });
  const btnRef  = useRef(null);
  const dropRef = useRef(null);

  const toggle = (width = 260) => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: Math.min(rect.left, window.innerWidth - width) });
    }
    setOpen((p) => !p);
  };

  useEffect(() => {
    const handler = (e) => {
      if (
        btnRef.current  && !btnRef.current.contains(e.target) &&
        dropRef.current && !dropRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return { open, setOpen, pos, btnRef, dropRef, toggle };
}

function DropHeader({ icon: Icon, label, isDarkMode }) {
  return (
    <div className={`px-4 py-2.5 flex items-center gap-2 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-orange-50 border-orange-100'}`}>
      <Icon className={`w-4 h-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
      <span className={`font-bold text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>{label}</span>
    </div>
  );
}

// ─── WAKTU MAKAN DROPDOWN ─────────────────────────────────────
export function WaktuMakanDropdown({ isDarkMode, filters, onToggleFilter }) {
  const { open, setOpen, pos, btnRef, dropRef, toggle } = useDropdown();
  const isActiveMenu = !!filters.category;
  const hasActive    = filters.category || filters.level || filters.time;

  const activePillCls = isDarkMode
    ? 'bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/40'
    : 'bg-orange-100 text-orange-700 ring-1 ring-orange-300';
  const inactivePillCls = isDarkMode
    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
    : 'bg-gray-50 text-gray-700 hover:bg-gray-100';

  return (
    <div className="relative flex-shrink-0">
      <button ref={btnRef} onClick={() => toggle(340)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs transition-all duration-200 shadow-sm whitespace-nowrap ${pillCls(isActiveMenu, isDarkMode)}`}>
        <Coffee className="w-3.5 h-3.5" />
        <span>Waktu Makan</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div ref={dropRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, width: 340 }}
          className={`rounded-2xl shadow-2xl border overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <DropHeader icon={Coffee} label="Waktu Makan" isDarkMode={isDarkMode} />

          <div className={`px-4 py-2 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <p className={`text-xs font-semibold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Pilih Waktu</p>
            <div className="grid grid-cols-2 gap-1.5">
              {MEAL_TIME_ITEMS.map((item) => (
                <button key={item.value} onClick={() => onToggleFilter('category', item.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${filters.category === item.value ? activePillCls : inactivePillCls}`}>
                  <span className="text-base">{item.emoji}</span>
                  <div>
                    <div className="font-semibold">{item.label}</div>
                    <div className={`text-xs font-normal ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={`px-4 py-2 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <p className={`text-xs font-semibold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Tingkat Kesulitan</p>
            <div className="flex gap-1.5 flex-wrap">
              {LEVEL_OPTIONS.map((opt) => (
                <button key={opt.label} onClick={() => onToggleFilter('level', opt.label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filters.level === opt.label ? activePillCls : inactivePillCls}`}>
                  <span>{opt.emoji}</span>{opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-2">
            <p className={`text-xs font-semibold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Waktu Memasak</p>
            <div className="flex gap-1.5 flex-wrap">
              {TIME_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => onToggleFilter('time', opt.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filters.time === opt.value ? activePillCls : inactivePillCls}`}>
                  <span>{opt.emoji}</span>{opt.label}
                </button>
              ))}
            </div>
          </div>

          {hasActive && (
            <div className={`px-4 py-2.5 border-t flex items-center justify-between ${isDarkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex flex-wrap gap-1">
                {filters.category && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>{filters.category}</span>}
                {filters.level    && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>{filters.level}</span>}
                {filters.time     && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>{filters.time}</span>}
              </div>
              <button onClick={() => { onToggleFilter('clearMealTime'); setOpen(false); }}
                className={`text-xs font-semibold ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'}`}>Reset</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SIMPLE DROPDOWN ─────────────────────────────────────────
export function SimpleDropdown({ label, icon: Icon, items, filterType, isDarkMode, filters, onToggleFilter }) {
  const { open, setOpen, pos, btnRef, dropRef, toggle } = useDropdown();
  const isActiveMenu = items.some((item) => filters[filterType] === item.value);

  return (
    <div className="relative flex-shrink-0">
      <button ref={btnRef} onClick={() => toggle(260)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs transition-all duration-200 shadow-sm whitespace-nowrap ${pillCls(isActiveMenu, isDarkMode)}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div ref={dropRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, minWidth: 250 }}
          className={`rounded-2xl shadow-2xl border overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <DropHeader icon={Icon} label={label} isDarkMode={isDarkMode} />
          {items.map((item) => {
            const isActive = filters[filterType] === item.value;
            return (
              <button key={item.value}
                onClick={() => { onToggleFilter(filterType, item.value); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b last:border-b-0 transition-colors ${isDarkMode ? 'border-gray-800' : 'border-gray-50'} ${isActive ? isDarkMode ? 'bg-orange-500/15 text-orange-300' : 'bg-orange-50 text-orange-700' : isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
                <span className="text-xl leading-none w-7 text-center flex-shrink-0">{item.emoji}</span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-semibold text-sm leading-tight">{item.label}</span>
                  {item.desc && <span className={`text-xs mt-0.5 leading-tight ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.desc}</span>}
                </div>
                {isActive && <span className="ml-auto w-2 h-2 rounded-full flex-shrink-0 bg-orange-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MOBILE MENU ─────────────────────────────────────────────
export function MobileMenu({ isDarkMode, filters, onToggleFilter, onSetShowFavorites, showFavorites, favCount }) {
  const [open,            setOpen]            = useState(false);
  const [expandedSection, setExpandedSection] = useState('waktuMakan');
  const close = () => setOpen(false);

  const base     = 'text-xs font-semibold px-3 py-1.5 rounded-full transition-all';
  const active   = isDarkMode ? 'bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/40' : 'bg-orange-100 text-orange-700 ring-1 ring-orange-200';
  const inactive = isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  const hasActiveFilters = filters.category || filters.level || filters.time || filters.subCategory || filters.budget || showFavorites;

  const Section = ({ id, icon: Icon, label, badge, iconColor, children }) => (
    <div className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
      <button onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className={`w-full flex items-center justify-between px-5 py-3.5 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <span className={`font-bold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{label}</span>
          {badge && <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white bg-orange-500">{badge}</span>}
        </div>
        <ChevronRight className={`w-4 h-4 transition-transform ${expandedSection === id ? 'rotate-90' : ''} ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
      </button>
      {expandedSection === id && <div className="px-5 pb-4">{children}</div>}
    </div>
  );

  return (
    <>
      <button onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm transition-all relative ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/25 text-white hover:bg-white/40'}`}>
        <Menu className="w-5 h-5" />
        <span className="text-xs">Menu</span>
        {hasActiveFilters && <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[9990]" onClick={close} />
          <div className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] z-[9999] shadow-2xl flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isDarkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-100 bg-gradient-to-r from-orange-500 to-rose-500'}`}>
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-white" />
                <span className="font-bold text-white text-base">Filter & Menu</span>
              </div>
              <button onClick={close} className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <p className={`text-xs font-bold uppercase tracking-wide mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Akses Cepat</p>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => { onToggleFilter('clearAll'); close(); }} className={`${base} ${!hasActiveFilters ? active : inactive}`}>🍽️ Semua Resep</button>
                  <button onClick={() => { onSetShowFavorites(!showFavorites); close(); }} className={`${base} flex items-center gap-1 ${showFavorites ? active : inactive}`}>
                    <Heart className={`w-3 h-3 ${showFavorites ? 'fill-current' : ''}`} />
                    Favorit {favCount > 0 && `(${favCount})`}
                  </button>
                </div>
              </div>

              <Section id="waktuMakan" icon={Coffee} label="Waktu Makan" badge={filters.category} iconColor={isDarkMode ? 'text-orange-400' : 'text-orange-500'}>
                <p className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Pilih Waktu</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {MEAL_TIME_ITEMS.map((item) => (
                    <button key={item.value} onClick={() => onToggleFilter('category', item.value)}
                      className={`${base} flex items-center gap-1.5 ${filters.category === item.value ? active : inactive}`}>
                      {item.emoji} {item.label}
                    </button>
                  ))}
                </div>
                <p className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Tingkat Kesulitan</p>
                <div className="flex gap-2 flex-wrap mb-4">
                  {LEVEL_OPTIONS.map((opt) => (
                    <button key={opt.label} onClick={() => onToggleFilter('level', opt.label)}
                      className={`${base} flex items-center gap-1 ${filters.level === opt.label ? active : inactive}`}>
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
                <p className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Waktu Memasak</p>
                <div className="flex gap-2 flex-wrap">
                  {TIME_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => onToggleFilter('time', opt.value)}
                      className={`${base} flex items-center gap-1 ${filters.time === opt.value ? active : inactive}`}>
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              </Section>

              <Section id="eksplorasi" icon={Globe} label="Eksplorasi Rasa"
                badge={filters.subCategory ? EKSPLORASI_ITEMS.find(i => i.value === filters.subCategory)?.label : null}
                iconColor={isDarkMode ? 'text-blue-400' : 'text-blue-500'}>
                <div className="grid grid-cols-2 gap-2">
                  {EKSPLORASI_ITEMS.map((item) => (
                    <button key={item.value} onClick={() => { onToggleFilter('subCategory', item.value); close(); }}
                      className={`${base} flex items-center gap-1.5 ${filters.subCategory === item.value ? active : inactive}`}>
                      {item.emoji} {item.label}
                    </button>
                  ))}
                </div>
              </Section>

              <Section id="mahasiswa" icon={GraduationCap} label="Khusus Mahasiswa"
                badge={filters.budget ? (filters.budget === 'tua' ? 'Tgl Tua' : 'Tgl Muda') : null}
                iconColor={isDarkMode ? 'text-purple-400' : 'text-purple-500'}>
                <div className="flex gap-2 flex-wrap">
                  {MAHASISWA_ITEMS.map((item) => (
                    <button key={item.value} onClick={() => { onToggleFilter('budget', item.value); close(); }}
                      className={`${base} flex items-center gap-1.5 ${filters.budget === item.value ? active : inactive}`}>
                      {item.emoji} {item.label}
                    </button>
                  ))}
                </div>
              </Section>
            </div>

            {hasActiveFilters && (
              <div className={`px-5 py-4 border-t ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}>
                <button onClick={() => { onToggleFilter('clearAll'); close(); }}
                  className="w-full py-2.5 rounded-xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white transition-colors">
                  Reset Semua Filter
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
