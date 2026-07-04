export default function Select({ label, error, id, required, options = [], placeholder = 'Select...', className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      <select id={id} {...props}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white
          ${error ? 'border-red-400' : 'border-gray-300 hover:border-gray-400'}`}>
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
