import StatusBadge from './StatusBadge';

export default function ExamCardGrid({ exams, rooms, invigilators, onSelect, onDelete, onAssign }) {
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam) => {
        const room = exam.roomId ? roomMap[exam.roomId] : null;
        const inv = exam.invigilatorId ? invMap[exam.invigilatorId] : null;
        return (
          <div
            key={exam.id}
            onClick={() => onSelect(exam)}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900">{exam.courseCode}</p>
                <p className="text-sm text-slate-500">{exam.courseName}</p>
              </div>
              <StatusBadge status={exam.status} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-y-2 font-mono text-sm text-slate-700">
              <dt className="text-slate-400">Date</dt>
              <dd>{new Date(`${exam.date}T00:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</dd>
              <dt className="text-slate-400">Time</dt>
              <dd>{exam.time}</dd>
              <dt className="text-slate-400">Duration</dt>
              <dd>{exam.duration} min</dd>
              <dt className="text-slate-400">Students</dt>
              <dd>{exam.studentCount}</dd>
            </dl>

            {/* Assignment badges */}
            <div className="mt-3 flex flex-wrap gap-1">
              {room ? (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  {room.building} {room.roomNumber}
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">No room</span>
              )}
              {inv ? (
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                  {inv.name}
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">No invigilator</span>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onAssign(exam); }}
                className="flex-1 rounded-md border border-indigo-200 px-2 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
              >
                Assign
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(exam); }}
                className="flex-1 rounded-md border border-rose-200 px-2 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
