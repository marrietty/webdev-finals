import { useState, useEffect } from 'react';

const EMPTY_FORM = {
  courseCode: '',
  courseName: '',
  date: '',
  time: '',
  duration: '',
  studentCount: '',
  status: 'Pending',
};

const inputClass =
  'block w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm ' +
  'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors duration-200';

export default function ExamFormModal({ open, initialExam, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialExam ? { ...initialExam } : EMPTY_FORM);
      setErrors([]);
      setIsSubmitting(false);
    }
  }, [open, initialExam]);

  if (!open) return null;

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true); // disable immediately, before validation even runs

    const result = onSave(form, initialExam?.id);
    if (!result.success) {
      setErrors(result.errors);
      setIsSubmitting(false);
    }
    // on success the parent closes the modal, so no reset needed here
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl transition-colors duration-200">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{initialExam ? 'Edit exam' : 'New exam'}</h3>

        {errors.length > 0 && (
          <div className="mt-4 rounded-md border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 p-3 text-sm text-rose-700 dark:text-rose-300">
            <ul className="list-inside list-disc space-y-1">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Course code">
            <input
              type="text"
              value={form.courseCode}
              onChange={(e) => handleChange('courseCode', e.target.value)}
              className={inputClass}
              placeholder="CS101"
            />
          </Field>
          <Field label="Course name">
            <input
              type="text"
              value={form.courseName}
              onChange={(e) => handleChange('courseName', e.target.value)}
              className={inputClass}
              placeholder="Intro to Computing"
            />
          </Field>
          <Field label="Date">
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Time">
            <input
              type="time"
              value={form.time}
              onChange={(e) => handleChange('time', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Duration (minutes)">
            <input
              type="number"
              min="1"
              value={form.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              className={inputClass}
              placeholder="90"
            />
          </Field>
          <Field label="Student count">
            <input
              type="number"
              min="1"
              value={form.studentCount}
              onChange={(e) => handleChange('studentCount', e.target.value)}
              className={inputClass}
              placeholder="45"
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className={inputClass}
            >
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
          >
            {isSubmitting ? 'Saving…' : 'Save exam'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}
