import { useState, useEffect, useRef } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const EMPTY = {
  name: '',
  maxWeeklyHours: '',
  availabilitySlots: [],
};

const inputClass =
  'block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm ' +
  'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export default function InvigilatorManagerModal({
  open,
  invigilators,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}) {
  const [mode, setMode] = useState('list');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    if (open) { setMode('list'); setEditing(null); setErrors([]); }
  }, [open]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setErrors([]);
    setSaving(false);
    busyRef.current = false;
    setMode('form');
  }

  function openEdit(inv) {
    setEditing(inv);
    setForm({
      name: inv.name,
      maxWeeklyHours: String(inv.maxWeeklyHours),
      availabilitySlots: [...(inv.availabilitySlots ?? [])],
    });
    setErrors([]);
    setSaving(false);
    busyRef.current = false;
    setMode('form');
  }

  function toggleSlot(day) {
    setForm((p) => ({
      ...p,
      availabilitySlots: p.availabilitySlots.includes(day)
        ? p.availabilitySlots.filter((d) => d !== day)
        : [...p.availabilitySlots, day],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (busyRef.current) return;
    busyRef.current = true;
    setSaving(true);

    const result = editing ? onUpdate(editing.id, form) : onAdd(form);
    if (result.success) {
      setMode('list');
    } else {
      setErrors(result.errors);
      setSaving(false);
      busyRef.current = false;
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {mode === 'list' ? 'Manage Invigilators' : editing ? 'Edit Invigilator' : 'Add Invigilator'}
          </h3>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">✕</button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {mode === 'list' ? (
            <>
              <button
                type="button"
                onClick={openCreate}
                className="mb-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                + Add Invigilator
              </button>
              {invigilators.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No invigilators yet. Add one above.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {invigilators.map((inv) => (
                    <li key={inv.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-slate-800">{inv.name}</p>
                        <p className="text-xs text-slate-500">
                          {inv.assignedHours}h assigned / {inv.maxWeeklyHours}h max
                          {inv.availabilitySlots?.length > 0
                            ? ` · Available: ${inv.availabilitySlots.join(', ')}`
                            : ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(inv)}
                          className="rounded-md px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(inv.id)}
                          className="rounded-md px-3 py-1 text-sm text-rose-600 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.length > 0 && (
                <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">
                  <ul className="list-inside list-disc space-y-1">
                    {errors.map((e) => <li key={e}>{e}</li>)}
                  </ul>
                </div>
              )}
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Full Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className={inputClass}
                  placeholder="Prof. Jane Smith"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Max Weekly Hours</span>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={form.maxWeeklyHours}
                  onChange={(e) => setForm((p) => ({ ...p, maxWeeklyHours: e.target.value }))}
                  className={inputClass}
                  placeholder="20"
                />
              </label>

              <div>
                <span className="mb-2 block text-sm font-medium text-slate-700">Available Days</span>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleSlot(day)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        form.availabilitySlots.includes(day)
                          ? 'border-indigo-500 bg-indigo-100 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setMode('list')} className="rounded-md px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
                  Back
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : editing ? 'Update' : 'Add Invigilator'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
