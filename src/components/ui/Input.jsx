export default function Input({ label, error, id, required, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      <input id={id} {...props}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}`} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
