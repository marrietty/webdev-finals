import StatusBadge from './StatusBadge';

function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ExamTable({ exams, rooms, invigilators, onSelect, onDelete, onAssign, onPlanSeating }) {
  // Build lookup maps for efficient rendering
  const roomMap = Object.fromEntries((rooms ?? []).map((r) => [r.id, r]));
  const invMap = Object.fromEntries((invigilators ?? []).map((i) => [i.id, i]));

  if (exams.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
        No exams match your filters. Try adjusting the search or filter options.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors duration-200">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-850/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Course</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Time</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Duration</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Students</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Room</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Invigilator</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {exams.map((exam) => {
            const room = exam.roomId ? roomMap[exam.roomId] : null;
            const inv = exam.invigilatorId ? invMap[exam.invigilatorId] : null;
            return (
              <tr
                key={exam.id}
                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors duration-150"
                onClick={() => onSelect(exam)}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{exam.courseCode}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{exam.courseName}</div>
                </td>
                <td className="px-4 py-3 font-mono text-sm text-slate-700 dark:text-slate-300">{formatDate(exam.date)}</td>
                <td className="px-4 py-3 font-mono text-sm text-slate-700 dark:text-slate-300">{exam.time}</td>
                <td className="px-4 py-3 font-mono text-sm text-slate-700 dark:text-slate-300">{exam.duration} min</td>
                <td className="px-4 py-3 font-mono text-sm text-slate-700 dark:text-slate-300">{exam.studentCount}</td>
                <td className="px-4 py-3 text-sm">
                  {room ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      {room.building} {room.roomNumber}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {inv ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                      {inv.name}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={exam.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onPlanSeating(exam); }}
                      className="rounded-md px-2 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    >
                      Plan Seating
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onAssign(exam); }}
                      className="rounded-md px-2 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                    >
                      Assign
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDelete(exam); }}
                      className="rounded-md px-2 py-1 text-sm font-medium text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
