export default function EmptyState({ title = 'Nothing here yet', description, action }) {
  return (
    <div className="rounded-3xl border border-dashed border-nude/50 bg-nude/60 px-6 py-14 text-center">
      <h3 className="font-display text-3xl text-burgundy">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
