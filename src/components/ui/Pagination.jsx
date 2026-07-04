export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
      {pages.map((p) => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 text-sm border rounded-lg ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
    </div>
  );
}
