export default function KpiCards({ kpis }) {
  const cards = [
    { label: 'Total Exams', value: kpis.total, color: 'text-slate-900 dark:text-slate-100' },
    { label: 'Upcoming Exams', value: kpis.upcoming, color: 'text-indigo-700 dark:text-indigo-400' },
    { label: 'Students Impacted', value: kpis.totalStudents.toLocaleString(), color: 'text-slate-900 dark:text-slate-100' },
    { label: 'Fully Assigned', value: kpis.assigned, color: 'text-emerald-700 dark:text-emerald-400' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors duration-200">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
          <p className={`mt-2 font-mono text-3xl font-semibold tracking-tight ${card.color}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
