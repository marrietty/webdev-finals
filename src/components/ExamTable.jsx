import StatusBadge from './StatusBadge';

function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ExamTable({ exams, rooms, invigilators, onSelect, onDelete, onAssign }) {
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
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Course</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Time</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Duration</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Students</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Room</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Invigilator</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {exams.map((exam) => {
            const room = exam.roomId ? roomMap[exam.roomId] : null;
            const inv = exam.invigilatorId ? invMap[exam.invigilatorId] : null;
            return (
              <tr
                key={exam.id}
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => onSelect(exam)}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{exam.courseCode}</div>
                  <div className="text-sm text-slate-500">{exam.courseName}</div>
                </td>
                <td className="px-4 py-3 font-mono text-sm text-slate-700">{formatDate(exam.date)}</td>
                <td className="px-4 py-3 font-mono text-sm text-slate-700">{exam.time}</td>
                <td className="px-4 py-3 font-mono text-sm text-slate-700">{exam.duration} min</td>
                <td className="px-4 py-3 font-mono text-sm text-slate-700">{exam.studentCount}</td>
                <td className="px-4 py-3 text-sm">
                  {room ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      {room.building} {room.roomNumber}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {inv ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      {inv.name}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={exam.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onAssign(exam); }}
                      className="rounded-md px-2 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                    >
                      Assign
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDelete(exam); }}
                      className="rounded-md px-2 py-1 text-sm font-medium text-rose-600 hover:bg-rose-50"
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
