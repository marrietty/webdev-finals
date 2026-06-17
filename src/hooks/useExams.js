import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { loadExams, saveExams } from '../utils/storage';
import { validateExam } from '../utils/validation';
import { checkRoomConflict, checkInvigilatorConflict } from '../utils/conflictEngine';

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `exam_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/** Map a Supabase row (snake_case) → app shape (camelCase) */
function fromDb(row) {
  return {
    id: row.id,
    courseCode: row.course_code,
    courseName: row.course_name,
    date: row.date,
    time: row.time,
    duration: row.duration,
    studentCount: row.student_count,
    status: row.status,
    roomId: row.room_id ?? null,
    invigilatorId: row.invigilator_id ?? null,
  };
}

/** Map app shape (camelCase) → Supabase row (snake_case) */
function toDb(data) {
  return {
    course_code: data.courseCode?.trim(),
    course_name: data.courseName?.trim(),
    date: data.date,
    time: data.time,
    duration: Number(data.duration),
    student_count: Number(data.studentCount),
    status: data.status || 'Pending',
    room_id: data.roomId ?? null,
    invigilator_id: data.invigilatorId ?? null,
  };
}

export function useExams() {
  const [exams, setExams] = useState(() => loadExams());
  const [isLoading, setIsLoading] = useState(true);

  // ── Boot: hydrate from Supabase, fall back to localStorage ────────
  useEffect(() => {
    let cancelled = false;
    async function fetchExams() {
      try {
        const { data, error } = await supabase.from('exams').select('*');
        if (cancelled) return;
        if (error) throw error;
        const mapped = data.map(fromDb);
        setExams(mapped);
        saveExams(mapped); // keep localStorage warm as an offline cache
      } catch (err) {
        console.warn('ExamGrid: Supabase fetch failed, using localStorage cache.', err);
        // exams already seeded from localStorage via useState initializer
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchExams();
    return () => { cancelled = true; };
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────
  /** Optimistically update state then persist; roll back on failure. */
  const persistExams = useCallback((updater) => {
    setExams((prev) => {
      const next = updater(prev);
      saveExams(next); // always keep localStorage in sync
      return next;
    });
  }, []);

  // ── CRUD ──────────────────────────────────────────────────────────
  const addExam = useCallback(
    (data) => {
      const errors = validateExam(data, exams);
      if (errors.length > 0) return { success: false, errors };

      const id = makeId();
      const newExam = {
        id,
        courseCode: data.courseCode.trim(),
        courseName: data.courseName.trim(),
        date: data.date,
        time: data.time,
        duration: Number(data.duration),
        studentCount: Number(data.studentCount),
        status: data.status || 'Pending',
        roomId: null,
        invigilatorId: null,
      };

      // Optimistic update
      persistExams((prev) => [...prev, newExam]);

      // Background Supabase insert
      supabase
        .from('exams')
        .insert([{ id, ...toDb(newExam) }])
        .then(({ error }) => {
          if (error) console.error('ExamGrid: failed to insert exam to Supabase.', error);
        });

      return { success: true, exam: newExam };
    },
    [exams, persistExams]
  );

  const updateExam = useCallback(
    (id, data) => {
      const errors = validateExam(data, exams, id);
      if (errors.length > 0) return { success: false, errors };

      const patch = {
        courseCode: data.courseCode.trim(),
        courseName: data.courseName.trim(),
        date: data.date,
        time: data.time,
        duration: Number(data.duration),
        studentCount: Number(data.studentCount),
        status: data.status,
      };

      persistExams((prev) =>
        prev.map((exam) => (exam.id === id ? { ...exam, ...patch } : exam))
      );

      supabase
        .from('exams')
        .update(toDb({ ...patch, roomId: data.roomId, invigilatorId: data.invigilatorId }))
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('ExamGrid: failed to update exam in Supabase.', error);
        });

      return { success: true };
    },
    [exams, persistExams]
  );

  const deleteExam = useCallback(
    (id) => {
      persistExams((prev) => prev.filter((exam) => exam.id !== id));

      supabase
        .from('exams')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('ExamGrid: failed to delete exam from Supabase.', error);
        });
    },
    [persistExams]
  );

  // ── Assignments ───────────────────────────────────────────────────
  const assignRoom = useCallback(
    (examId, room) => {
      const targetExam = exams.find((e) => e.id === examId);
      if (!targetExam) return { success: false, error: 'Exam not found.' };

      const roomId = room === null ? null : room.id;

      if (room !== null) {
        const conflict = checkRoomConflict(targetExam, room, exams);
        if (conflict) return { success: false, error: conflict };
      }

      persistExams((prev) =>
        prev.map((e) => (e.id === examId ? { ...e, roomId } : e))
      );

      supabase
        .from('exams')
        .update({ room_id: roomId })
        .eq('id', examId)
        .then(({ error }) => {
          if (error) console.error('ExamGrid: failed to update room_id in Supabase.', error);
        });

      return { success: true };
    },
    [exams, persistExams]
  );

  const assignInvigilator = useCallback(
    (examId, invigilator, onSynced) => {
      const targetExam = exams.find((e) => e.id === examId);
      if (!targetExam) return { success: false, error: 'Exam not found.' };

      const invigilatorId = invigilator === null ? null : invigilator.id;

      if (invigilator !== null) {
        const conflict = checkInvigilatorConflict(targetExam, invigilator, exams);
        if (conflict) return { success: false, error: conflict };
      }

      setExams((prev) => {
        const next = prev.map((e) =>
          e.id === examId ? { ...e, invigilatorId } : e
        );
        saveExams(next);
        // Sync hours with the updated exam list
        const prevInvId = targetExam.invigilatorId;
        if (prevInvId && onSynced) onSynced(prevInvId, next);
        if (invigilatorId && onSynced) onSynced(invigilatorId, next);
        return next;
      });

      supabase
        .from('exams')
        .update({ invigilator_id: invigilatorId })
        .eq('id', examId)
        .then(({ error }) => {
          if (error) console.error('ExamGrid: failed to update invigilator_id in Supabase.', error);
        });

      return { success: true };
    },
    [exams]
  );

  /**
   * Saves a seating plan grid for an exam back to Supabase.
   * Requires a `seating_plan` JSONB column on the exams table.
   */
  const saveSeatingPlan = useCallback(async (examId, gridData) => {
    try {
      const { error } = await supabase
        .from('exams')
        .update({ seating_plan: gridData })
        .eq('id', examId);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('ExamGrid: failed to save seating plan to Supabase.', err);
      return { success: false, error: err.message };
    }
  }, []);

  // ── Derived state ─────────────────────────────────────────────────
  const sortedExams = useMemo(
    () => [...exams].sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)),
    [exams]
  );

  const kpis = useMemo(() => {
    const now = new Date();
    const total = exams.length;
    const upcoming = exams.filter((e) => new Date(`${e.date}T${e.time}`) > now).length;
    const totalStudents = exams.reduce((sum, e) => sum + (Number(e.studentCount) || 0), 0);
    const assigned = exams.filter((e) => e.roomId && e.invigilatorId).length;
    return { total, upcoming, totalStudents, assigned };
  }, [exams]);

  return {
    exams: sortedExams,
    isLoading,
    addExam,
    updateExam,
    deleteExam,
    assignRoom,
    assignInvigilator,
    saveSeatingPlan,
    kpis,
  };
}
