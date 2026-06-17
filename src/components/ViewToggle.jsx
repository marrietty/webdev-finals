const OPTIONS = [
  { key: 'table', label: 'Table' },
  { key: 'cards', label: 'Cards' },
  { key: 'timetable', label: 'Timetable' },
];

export default function ViewToggle({ view, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 transition-colors duration-200">
      {OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          id={`view-toggle-${option.key}`}
          onClick={() => onChange(option.key)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            view === option.key ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
