const colors = {
  Active:    'bg-green-100 text-green-700',
  Inactive:  'bg-gray-100 text-gray-600',
  Pending:   'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-700',
  Draft:     'bg-gray-100 text-gray-600',
  Issued:    'bg-blue-100 text-blue-700',
  Paid:      'bg-green-100 text-green-700',
  Overdue:   'bg-red-100 text-red-700',
  Planned:   'bg-purple-100 text-purple-700',
  Completed: 'bg-green-100 text-green-700',
  Scheduled: 'bg-blue-100 text-blue-700',
  default:   'bg-gray-100 text-gray-600',
};

export default function Badge({ label }) {
  const cls = colors[label] || colors.default;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}
