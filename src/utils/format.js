export function formatPKR(value) {
  const n = Number(value || 0);
  return `Rs. ${Math.round(n).toLocaleString('en-PK')}`;
}

export function formatTimeLabel(time) {
  if (!time) return '';
  const [h, m] = String(time).slice(0, 5).split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function mediaUrl(path) {
  if (!path) return '';
  // Absolute R2 / CDN URLs are stored as-is in the database
  if (/^https?:\/\//i.test(path) || path.startsWith('//')) return path;
  const configured = (import.meta.env.VITE_API_URL || '').trim();
  // Relative /uploads works via Vite proxy on any host (localhost or WiFi IP)
  if (!configured) return path.startsWith('/') ? path : `/${path}`;
  const base = configured.replace(/\/api$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

export const STATUS_COLORS = {
  pending: 'bg-gold/15 text-gold',
  confirmed: 'bg-champagne/20 text-champagne',
  completed: 'bg-emerald-500/15 text-emerald-400',
  cancelled: 'bg-white/10 text-muted',
  no_show: 'bg-amber-500/15 text-amber-400',
};
