import { useMemo } from 'react';
import StatusBadge from './StatusBadge';

/** Generate time labels from 07:00 to 21:00 in 1-hour slots */
function generateHours() {
  const hours = [];
  for (let h = 7; h <= 21; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`);
  }
  return hours;
}

const HOURS = generateHours();
const SLOT_HEIGHT = 60; // px per hour
const HEADER_HEIGHT = 48; // px
const TIME_COL_WIDTH = 72; // px

/** Pixels from top of grid for a given time string "HH:MM" */
function timeToPx(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return ((h - 7) * 60 + m) * (SLOT_HEIGHT / 60);
}

function durationToPx(minutes) {
  return (minutes / 60) * SLOT_HEIGHT;
}

const PALETTE = [
  'bg-indigo-100 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-650 text-indigo-800 dark:text-indigo-300',
  'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-650 text-emerald-800 dark:text-emerald-300',
  'bg-violet-100 dark:bg-violet-950/40 border-violet-400 dark:border-violet-650 text-violet-800 dark:text-violet-300',
  'bg-amber-100 dark:bg-amber-950/40 border-amber-400 dark:border-amber-650 text-amber-800 dark:text-amber-300',
  'bg-sky-100 dark:bg-sky-950/40 border-sky-400 dark:border-sky-650 text-sky-800 dark:text-sky-300',
  'bg-rose-100 dark:bg-rose-950/40 border-rose-400 dark:border-rose-650 text-rose-800 dark:text-rose-300',
  'bg-teal-100 dark:bg-teal-950/40 border-teal-400 dark:border-teal-650 text-teal-800 dark:text-teal-300',
];

function examColor(index) {
  return PALETTE[index % PALETTE.length];
}

/**
 * Get unique sorted dates from exams (used as columns).
 */
function getDates(exams) {
  const dates = [...new Set(exams.map((e) => e.date))].sort();
  return dates;
}

function formatColumnDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function TimetableView({ exams, rooms, onSelect }) {
  const dates = useMemo(() => getDates(exams), [exams]);

  // Map examId → color index (stable order)
  const colorMap = useMemo(() => {
    const m = {};
    exams.forEach((e, i) => { m[e.id] = i; });
    return m;
  }, [exams]);

  // roomId → room object lookup
  const roomMap = useMemo(() => {
    const m = {};
    rooms.forEach((r) => { m[r.id] = r; });
    return m;
  }, [rooms]);

  const totalHeight = HOURS.length * SLOT_HEIGHT;

  if (exams.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 transition-colors duration-200">
        No exams to display in timetable. Schedule an exam to see it here.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors duration-200">
      <div
        className="min-w-[600px]"
        style={{ display: 'grid', gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(${dates.length}, 1fr)` }}
      >
        {/* Top-left corner */}
        <div
          className="sticky left-0 z-20 border-b border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60"
          style={{ height: HEADER_HEIGHT }}
        />

        {/* Date column headers */}
        {dates.map((date) => (
          <div
            key={date}
            className="border-b border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-2 py-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 last:border-r-0"
            style={{ height: HEADER_HEIGHT }}
          >
            {formatColumnDate(date)}
          </div>
        ))}

        {/* Time gutter */}
        <div
          className="sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          style={{ height: totalHeight, position: 'relative' }}
        >
          {HOURS.map((h, i) => (
            <div
              key={h}
              className="absolute left-0 w-full border-t border-slate-100 dark:border-slate-800/60 pr-2 text-right text-xs text-slate-400 dark:text-slate-500"
              style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT, paddingTop: 4 }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Date columns with events */}
        {dates.map((date) => {
          const dayExams = exams.filter((e) => e.date === date);
          return (
            <div
              key={date}
              className="relative border-r border-slate-200 dark:border-slate-800 last:border-r-0"
              style={{ height: totalHeight }}
            >
              {/* Hour grid lines */}
              {HOURS.map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 w-full border-t border-slate-100 dark:border-slate-800/40"
                  style={{ top: i * SLOT_HEIGHT }}
                />
              ))}

              {/* Exam blocks */}
              {dayExams.map((exam) => {
                const top = timeToPx(exam.time);
                const height = Math.max(durationToPx(exam.duration), 28);
                const color = examColor(colorMap[exam.id]);
                const room = exam.roomId ? roomMap[exam.roomId] : null;

                return (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => onSelect(exam)}
                    title={`${exam.courseCode} — ${exam.courseName}`}
                    className={`absolute left-1 right-1 overflow-hidden rounded border-l-4 px-2 py-1 text-left shadow-sm transition-opacity hover:opacity-90 ${color}`}
                    style={{ top, height }}
                  >
                    <p className="truncate text-xs font-semibold leading-tight">
                      {exam.courseCode}
                    </p>
                    {height > 40 && (
                      <p className="truncate text-[10px] leading-tight opacity-80">
                        {exam.time} · {exam.duration}min
                      </p>
                    )}
                    {height > 54 && room && (
                      <p className="truncate text-[10px] leading-tight opacity-70">
                        {room.building} {room.roomNumber}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 border-t border-slate-150 dark:border-slate-800 px-4 py-3">
        {exams.map((exam, i) => (
          <span
            key={exam.id}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${examColor(i)}`}
          >
            {exam.courseCode}
          </span>
        ))}
      </div>
    </div>
  );
}
