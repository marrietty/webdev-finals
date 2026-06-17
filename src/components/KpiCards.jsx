export default function KpiCards({ kpis }) {
  const cards = [
    { label: 'Total Exams', value: kpis.total, color: 'text-slate-900' },
    { label: 'Upcoming Exams', value: kpis.upcoming, color: 'text-indigo-700' },
    { label: 'Students Impacted', value: kpis.totalStudents.toLocaleString(), color: 'text-slate-900' },
    { label: 'Fully Assigned', value: kpis.assigned, color: 'text-emerald-700' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{card.label}</p>
          <p className={`mt-2 font-mono text-3xl font-semibold tracking-tight ${card.color}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
