import StatusBadge from './StatusBadge';

export default function ExamDrawer({ exam, open, onClose, onEdit, onDelete }) {
  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-slate-900/30 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-xl transition-transform transition-colors duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Exam details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {exam && (
          <div className="px-6 py-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{exam.courseCode}</p>
                <p className="text-slate-500 dark:text-slate-400">{exam.courseName}</p>
              </div>
              <StatusBadge status={exam.status} />
            </div>

            <dl className="mt-6 space-y-3">
              <Row label="Date" value={exam.date} />
              <Row label="Time" value={exam.time} />
              <Row label="Duration" value={`${exam.duration} minutes`} />
              <Row label="Students" value={exam.studentCount} />
            </dl>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => onEdit(exam)}
                className="flex-1 rounded-md bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(exam)}
                className="flex-1 rounded-md border border-rose-200 dark:border-rose-900/40 px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-2">
      <dt className="text-sm text-slate-400 dark:text-slate-500">{label}</dt>
      <dd className="font-mono text-sm text-slate-800 dark:text-slate-300">{value}</dd>
    </div>
  );
}
