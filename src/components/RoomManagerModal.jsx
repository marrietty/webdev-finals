import { useState, useEffect, useRef } from 'react';
import { EQUIPMENT_OPTIONS } from '../hooks/useRooms';

const EMPTY = {
  building: '',
  roomNumber: '',
  capacity: '',
  equipment: [],
  accessible: false,
};

const inputClass =
  'block w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm ' +
  'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors duration-200';

export default function RoomManagerModal({ open, rooms, onAdd, onUpdate, onDelete, onClose }) {
  const [mode, setMode] = useState('list'); // 'list' | 'form'
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

  function openEdit(room) {
    setEditing(room);
    setForm({
      building: room.building,
      roomNumber: room.roomNumber,
      capacity: String(room.capacity),
      equipment: [...room.equipment],
      accessible: room.accessible,
    });
    setErrors([]);
    setSaving(false);
    busyRef.current = false;
    setMode('form');
  }

  function handleChange(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  function toggleEquipment(item) {
    setForm((p) => ({
      ...p,
      equipment: p.equipment.includes(item)
        ? p.equipment.filter((e) => e !== item)
        : [...p.equipment, item],
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
      <div className="relative w-full max-w-xl rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {mode === 'list' ? 'Manage Rooms' : editing ? 'Edit Room' : 'Add Room'}
          </h3>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">✕</button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {mode === 'list' ? (
            <>
              <button
                type="button"
                onClick={openCreate}
                className="mb-4 rounded-md bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200"
              >
                + Add Room
              </button>
              {rooms.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">No rooms yet. Add one above.</p>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {rooms.map((room) => (
                    <li key={room.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {room.building} {room.roomNumber}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Cap: {room.capacity}
                          {room.accessible ? ' · ♿ Accessible' : ''}
                          {room.equipment.length > 0 ? ` · ${room.equipment.join(', ')}` : ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(room)}
                          className="rounded-md px-3 py-1 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(room.id)}
                          className="rounded-md px-3 py-1 text-sm text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
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
                <div className="rounded-md border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 p-3 text-sm text-rose-700 dark:text-rose-350">
                  <ul className="list-inside list-disc space-y-1">
                    {errors.map((e) => <li key={e}>{e}</li>)}
                  </ul>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Building</span>
                  <input type="text" value={form.building} onChange={(e) => handleChange('building', e.target.value)} className={inputClass} placeholder="Science Hall" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Room Number</span>
                  <input type="text" value={form.roomNumber} onChange={(e) => handleChange('roomNumber', e.target.value)} className={inputClass} placeholder="402" />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Capacity</span>
                <input type="number" min="1" value={form.capacity} onChange={(e) => handleChange('capacity', e.target.value)} className={inputClass} placeholder="80" />
              </label>

              <div>
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Equipment</span>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_OPTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleEquipment(item)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        form.equipment.includes(item)
                          ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-500'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.accessible}
                  onChange={(e) => handleChange('accessible', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 transition-colors"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Wheelchair accessible</span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setMode('list')} className="rounded-md px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Back
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Saving…' : editing ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
