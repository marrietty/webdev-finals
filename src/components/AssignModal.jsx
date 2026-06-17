import { useState, useEffect, useCallback, useRef } from 'react';

const EMPTY = {
  roomId: '',
  invigilatorId: '',
};

/**
 * AssignModal — lets the user assign a room and/or invigilator to a single exam.
 * Debounces the save button to prevent duplicate submissions.
 */
export default function AssignModal({
  open,
  exam,
  rooms,
  invigilators,
  onSave,  // fn(examId, roomId|null, invigilatorId|null) => { success, errors }
  onClose,
}) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const busyRef = useRef(false); // prevents double-fire on rapid clicks

  useEffect(() => {
    if (open && exam) {
      setForm({
        roomId: exam.roomId ?? '',
        invigilatorId: exam.invigilatorId ?? '',
      });
      setErrors([]);
      setSaving(false);
      busyRef.current = false;
    }
  }, [open, exam]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      // Debounce guard — prevents race condition on rapid double-click
      if (busyRef.current) return;
      busyRef.current = true;
      setSaving(true);

      const roomId = form.roomId || null;
      const invigilatorId = form.invigilatorId || null;
      const result = onSave(exam.id, roomId, invigilatorId);

      if (result.success) {
        onClose();
      } else {
        setErrors(result.errors ?? [result.error]);
        setSaving(false);
        busyRef.current = false;
      }
    },
    [exam, form, onSave, onClose]
  );

  if (!open || !exam) return null;

  const selClass =
    'block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 ' +
    'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-lg font-semibold text-slate-900">
          Assign Resources
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {exam.courseCode} — {exam.date} at {exam.time}
        </p>

        {errors.length > 0 && (
          <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3">
            <ul className="space-y-1 text-sm text-rose-700 list-disc list-inside">
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        <div className="mt-5 space-y-4">
          {/* Room selector */}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Room
            </span>
            <select
              id="assign-room"
              value={form.roomId}
              onChange={(e) => setForm((p) => ({ ...p, roomId: e.target.value }))}
              className={selClass}
            >
              <option value="">— No room assigned —</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.building} {r.roomNumber} (cap. {r.capacity}
                  {r.accessible ? ', ♿' : ''})
                </option>
              ))}
            </select>
          </label>

          {/* Invigilator selector */}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Invigilator
            </span>
            <select
              id="assign-invigilator"
              value={form.invigilatorId}
              onChange={(e) => setForm((p) => ({ ...p, invigilatorId: e.target.value }))}
              className={selClass}
            >
              <option value="">— No invigilator assigned —</option>
              {invigilators.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.name} ({inv.assignedHours}h / {inv.maxWeeklyHours}h)
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            id="assign-save-btn"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save assignment'}
          </button>
        </div>
      </form>
    </div>
  );
}
