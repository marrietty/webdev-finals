import { useEffect, useRef } from 'react';

/**
 * ConflictCenter — displays a prominent banner for assignment conflicts.
 * Also auto-dismisses after a timeout.
 */
export default function ConflictCenter({ conflicts, onDismiss }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (conflicts.length === 0) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timerRef.current);
  }, [conflicts, onDismiss]);

  if (conflicts.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="animate-in slide-in-from-top-4 rounded-xl border border-rose-300 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-4 shadow-lg transition-colors duration-200"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex-shrink-0 text-rose-500 dark:text-rose-400">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </span>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-rose-800 dark:text-rose-200">
            ⚠ Scheduling Conflict Detected
          </h4>
          <ul className="mt-1 space-y-1">
            {conflicts.map((msg, i) => (
              <li key={i} className="text-sm text-rose-700 dark:text-rose-300">
                {msg}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 rounded-md p-1 text-rose-400 dark:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-300"
          aria-label="Dismiss conflict warning"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
