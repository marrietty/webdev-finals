import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { loadInvigilators, saveInvigilators } from '../utils/storage';

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `inv_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/** Map Supabase row → app shape */
function fromDb(row) {
  return {
    id: row.id,
    name: row.name,
    maxWeeklyHours: row.max_weekly_hours,
    assignedHours: row.assigned_hours ?? 0,
    availabilitySlots: row.availability_slots ?? [],
  };
}

/** Map app shape → Supabase row */
function toDb(data) {
  return {
    name: data.name?.trim(),
    max_weekly_hours: Number(data.maxWeeklyHours),
    assigned_hours: Number(data.assignedHours ?? 0),
    availability_slots: Array.isArray(data.availabilitySlots) ? data.availabilitySlots : [],
  };
}

export function useInvigilators() {
  const [invigilators, setInvigilators] = useState(() => loadInvigilators());
  const [isLoading, setIsLoading] = useState(true);

  // ── Boot: hydrate from Supabase ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function fetchInvigilators() {
      try {
        const { data, error } = await supabase.from('invigilators').select('*');
        if (cancelled) return;
        if (error) throw error;
        const mapped = data.map(fromDb);
        setInvigilators(mapped);
        saveInvigilators(mapped);
      } catch (err) {
        console.warn('ExamGrid: Supabase invigilators fetch failed, using localStorage.', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchInvigilators();
    return () => { cancelled = true; };
  }, []);

  const persistInvigilators = useCallback((updater) => {
    setInvigilators((prev) => {
      const next = updater(prev);
      saveInvigilators(next);
      return next;
    });
  }, []);

  // ── CRUD ──────────────────────────────────────────────────────────
  const addInvigilator = useCallback(
    async (data) => {
      const errors = validateInvigilator(data);
      if (errors.length > 0) return { success: false, errors };

      const id = makeId();
      const newInv = {
        id,
        name: data.name.trim(),
        maxWeeklyHours: Number(data.maxWeeklyHours),
        assignedHours: 0,
        availabilitySlots: Array.isArray(data.availabilitySlots) ? data.availabilitySlots : [],
      };

      persistInvigilators((prev) => [...prev, newInv]);

      const { error } = await supabase
        .from('invigilators')
        .insert([{ id, ...toDb(newInv) }]);
      if (error) {
        console.error('ExamGrid: failed to insert invigilator to Supabase.', error);
        persistInvigilators((prev) => prev.filter((i) => i.id !== id));
        return { success: false, errors: [error.message] };
      }

      return { success: true, invigilator: newInv };
    },
    [persistInvigilators]
  );

  const updateInvigilator = useCallback(
    async (id, data) => {
      const errors = validateInvigilator(data);
      if (errors.length > 0) return { success: false, errors };

      const patch = {
        name: data.name.trim(),
        maxWeeklyHours: Number(data.maxWeeklyHours),
        availabilitySlots: Array.isArray(data.availabilitySlots) ? data.availabilitySlots : [],
      };

      persistInvigilators((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, ...patch } : inv))
      );

      const { error } = await supabase
        .from('invigilators')
        .update(toDb(patch))
        .eq('id', id);
      if (error) console.error('ExamGrid: failed to update invigilator in Supabase.', error);

      return { success: true };
    },
    [persistInvigilators]
  );

  /**
   * Recalculate assignedHours for an invigilator based on actual exam assignments.
   * Called from the exams hook after any assign/unassign operation.
   */
  const syncAssignedHours = useCallback(
    (invigilatorId, allExams) => {
      const totalHours = allExams
        .filter((e) => e.invigilatorId === invigilatorId)
        .reduce((sum, e) => sum + Number(e.duration) / 60, 0);

      const rounded = Math.round(totalHours * 100) / 100;

      persistInvigilators((prev) =>
        prev.map((inv) =>
          inv.id === invigilatorId ? { ...inv, assignedHours: rounded } : inv
        )
      );

      // Persist assigned_hours to Supabase in the background
      supabase
        .from('invigilators')
        .update({ assigned_hours: rounded })
        .eq('id', invigilatorId)
        .then(({ error }) => {
          if (error)
            console.error('ExamGrid: failed to sync assigned_hours to Supabase.', error);
        });
    },
    [persistInvigilators]
  );

  const deleteInvigilator = useCallback(
    async (id) => {
      persistInvigilators((prev) => prev.filter((inv) => inv.id !== id));

      const { error } = await supabase.from('invigilators').delete().eq('id', id);
      if (error) console.error('ExamGrid: failed to delete invigilator from Supabase.', error);
    },
    [persistInvigilators]
  );

  return { invigilators, isLoading, addInvigilator, updateInvigilator, deleteInvigilator, syncAssignedHours };
}

function validateInvigilator(data) {
  const errors = [];
  if (!data.name?.trim()) errors.push('Name is required.');
  const hours = Number(data.maxWeeklyHours);
  if (!Number.isFinite(hours) || hours <= 0) errors.push('Max weekly hours must be a positive number.');
  // BUG FIX: Prevent extreme values
  if (hours > 168) errors.push('Max weekly hours cannot exceed 168 (hours in a week).');
  return errors;
}
