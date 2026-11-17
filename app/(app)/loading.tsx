export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Загрузка страницы">
      <div className="space-y-2">
        <div className="skeleton h-8 w-56" />
        <div className="skeleton h-4 w-80" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24" />)}
      </div>
      <div className="skeleton h-56" />
    </div>
  );
}
