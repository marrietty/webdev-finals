import { useMemo } from 'react';
import { roomUtilization } from '../utils/conflictEngine';

function UtilBar({ pct, color }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function utilizationColor(pct) {
  if (pct >= 80) return 'bg-rose-500';
  if (pct >= 50) return 'bg-amber-400';
  return 'bg-emerald-500';
}

export default function WorkloadPanel({ rooms, invigilators, exams }) {
  const roomStats = useMemo(
    () =>
      rooms.map((room) => {
        const pct = roomUtilization(room, exams);
        const bookedCount = exams.filter((e) => e.roomId === room.id).length;
        return { room, pct, bookedCount };
      }),
    [rooms, exams]
  );

  const invStats = useMemo(
    () =>
      invigilators.map((inv) => {
        const pct =
          inv.maxWeeklyHours > 0
            ? Math.min(100, Math.round((inv.assignedHours / inv.maxWeeklyHours) * 100))
            : 0;
        return { inv, pct };
      }),
    [invigilators]
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Room utilization */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Room Utilization
        </h3>
        {roomStats.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No rooms added yet.</p>
        ) : (
          <ul className="space-y-3">
            {roomStats.map(({ room, pct, bookedCount }) => (
              <li key={room.id}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    {room.building} {room.roomNumber}
                  </span>
                  <span className="text-xs text-slate-500">
                    {bookedCount} exam{bookedCount !== 1 ? 's' : ''} · {pct}%
                  </span>
                </div>
                <UtilBar pct={pct} color={utilizationColor(pct)} />
                <div className="mt-0.5 flex justify-between text-xs text-slate-400">
                  <span>Cap: {room.capacity}</span>
                  {room.accessible && <span>♿ Accessible</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Invigilator hours */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Invigilator Workload
        </h3>
        {invStats.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No invigilators added yet.</p>
        ) : (
          <ul className="space-y-3">
            {invStats.map(({ inv, pct }) => (
              <li key={inv.id}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{inv.name}</span>
                  <span className="text-xs text-slate-500">
                    {inv.assignedHours}h / {inv.maxWeeklyHours}h · {pct}%
                  </span>
                </div>
                <UtilBar pct={pct} color={utilizationColor(pct)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
