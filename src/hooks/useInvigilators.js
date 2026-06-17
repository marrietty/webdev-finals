import { useState, useEffect, useCallback } from 'react';
import { loadInvigilators, saveInvigilators } from '../utils/storage';

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `inv_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function useInvigilators() {
  const [invigilators, setInvigilators] = useState(() => loadInvigilators());

  useEffect(() => {
    saveInvigilators(invigilators);
  }, [invigilators]);

  const addInvigilator = useCallback((data) => {
    const errors = validateInvigilator(data);
    if (errors.length > 0) return { success: false, errors };

    const newInv = {
      id: makeId(),
      name: data.name.trim(),
      maxWeeklyHours: Number(data.maxWeeklyHours),
      assignedHours: 0,
      availabilitySlots: Array.isArray(data.availabilitySlots) ? data.availabilitySlots : [],
    };
    setInvigilators((prev) => [...prev, newInv]);
    return { success: true, invigilator: newInv };
  }, []);

  const updateInvigilator = useCallback((id, data) => {
    const errors = validateInvigilator(data);
    if (errors.length > 0) return { success: false, errors };

    setInvigilators((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              name: data.name.trim(),
              maxWeeklyHours: Number(data.maxWeeklyHours),
              availabilitySlots: Array.isArray(data.availabilitySlots) ? data.availabilitySlots : [],
            }
          : inv
      )
    );
    return { success: true };
  }, []);

  /**
   * Recalculate assignedHours for an invigilator based on actual exam assignments.
   * Called from the exams hook after any assign/unassign operation.
   */
  const syncAssignedHours = useCallback((invigilatorId, allExams) => {
    const totalHours = allExams
      .filter((e) => e.invigilatorId === invigilatorId)
      .reduce((sum, e) => sum + Number(e.duration) / 60, 0);

    setInvigilators((prev) =>
      prev.map((inv) =>
        inv.id === invigilatorId ? { ...inv, assignedHours: Math.round(totalHours * 100) / 100 } : inv
      )
    );
  }, []);

  const deleteInvigilator = useCallback((id) => {
    setInvigilators((prev) => prev.filter((inv) => inv.id !== id));
  }, []);

  return { invigilators, addInvigilator, updateInvigilator, deleteInvigilator, syncAssignedHours };
}

function validateInvigilator(data) {
  const errors = [];
  if (!data.name?.trim()) errors.push('Name is required.');
  const hours = Number(data.maxWeeklyHours);
  if (!Number.isFinite(hours) || hours <= 0) errors.push('Max weekly hours must be a positive number.');
  return errors;
}
