export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 text-muted">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-nude border-t-gold" />
      <p className="text-sm tracking-wide">{label}</p>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`shimmer rounded-2xl ${className}`} />;
}
