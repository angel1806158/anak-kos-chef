export const MEAL_TIME_ITEMS = [
  { label: 'Sarapan',     desc: 'Menu ringan buat pagi hari',  value: 'Sarapan',     emoji: '🌅' },
  { label: 'Makan Siang', desc: 'Lauk-pauk mengenyangkan',     value: 'Makan Siang', emoji: '☀️' },
  { label: 'Makan Malam', desc: 'Santapan penghilang lelah',    value: 'Makan Malam', emoji: '🌙' },
  { label: 'Camilan',     desc: 'Ngemil hemat di kamar kos',   value: 'Camilan',     emoji: '🍿' },
];

export const LEVEL_OPTIONS = [
  { label: 'Mudah',  emoji: '😊' },
  { label: 'Sedang', emoji: '🤔' },
  { label: 'Susah',  emoji: '😤' },
];

export const TIME_OPTIONS = [
  { label: '< 15 Menit',  value: '< 15 menit',  emoji: '⚡' },
  { label: '15–30 Menit', value: '15-30 menit', emoji: '⏱️' },
  { label: '> 30 Menit',  value: '> 30 menit',  emoji: '🍳' },
];

export const EKSPLORASI_ITEMS = [
  { label: 'Kuliner Indonesia', desc: 'Cita rasa nusantara otentik',   value: 'kuliner indonesia', emoji: '🇮🇩' },
  { label: 'Western Food',      desc: 'Pasta, sosis, & western vibes', value: 'western food',       emoji: '🍝' },
  { label: 'Dessert',           desc: 'Manis-manis penggugah selera',  value: 'dessert',            emoji: '🍰' },
  { label: 'Minuman',           desc: 'Kopi, teh & minuman segar',     value: 'drink',              emoji: '🧋' },
];

export const MAHASISWA_ITEMS = [
  { label: 'Tanggal Muda', desc: 'Budget longgar, masak bebas!', value: 'muda', emoji: '💰' },
  { label: 'Tanggal Tua',  desc: 'Super hemat, kantong aman',    value: 'tua',  emoji: '🪙' },
];

export const AVATAR_COLORS = {
  admin: 'from-amber-400 to-orange-500',
  user:  'from-orange-400 to-rose-500',
};

export const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().substring(0, 2);

export const decodeJWT = (token) => {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch { return null; }
};
