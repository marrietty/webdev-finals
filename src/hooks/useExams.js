import { useState, useEffect, useCallback, useMemo } from 'react';
import { loadExams, saveExams } from '../utils/storage';
import { validateExam } from '../utils/validation';
import { checkRoomConflict, checkInvigilatorConflict } from '../utils/conflictEngine';

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `exam_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function useExams() {
  const [exams, setExams] = useState(() => loadExams());

  useEffect(() => {
    saveExams(exams);
  }, [exams]);

  const addExam = useCallback(
    (data) => {
      const errors = validateExam(data, exams);
      if (errors.length > 0) return { success: false, errors };

      const newExam = {
        id: makeId(),
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

      setExams((prev) => [...prev, newExam]);
      return { success: true, exam: newExam };
    },
    [exams]
  );

  const updateExam = useCallback(
    (id, data) => {
      const errors = validateExam(data, exams, id);
      if (errors.length > 0) return { success: false, errors };

      setExams((prev) =>
        prev.map((exam) =>
          exam.id === id
            ? {
                ...exam,
                courseCode: data.courseCode.trim(),
                courseName: data.courseName.trim(),
                date: data.date,
                time: data.time,
                duration: Number(data.duration),
                studentCount: Number(data.studentCount),
                status: data.status,
              }
            : exam
        )
      );
      return { success: true };
    },
    [exams]
  );

  const deleteExam = useCallback((id) => {
    setExams((prev) => prev.filter((exam) => exam.id !== id));
  }, []);

  /**
   * Assign a room to an exam after conflict validation.
   * Returns { success, error? }
   */
  const assignRoom = useCallback(
    (examId, room) => {
      const targetExam = exams.find((e) => e.id === examId);
      if (!targetExam) return { success: false, error: 'Exam not found.' };

      // Allow clearing a room assignment
      if (room === null) {
        setExams((prev) => prev.map((e) => (e.id === examId ? { ...e, roomId: null } : e)));
        return { success: true };
      }

      const conflict = checkRoomConflict(targetExam, room, exams);
      if (conflict) return { success: false, error: conflict };

      setExams((prev) =>
        prev.map((e) => (e.id === examId ? { ...e, roomId: room.id } : e))
      );
      return { success: true };
    },
    [exams]
  );

  /**
   * Assign an invigilator to an exam after conflict validation.
   * Returns { success, error? }
   */
  const assignInvigilator = useCallback(
    (examId, invigilator, onSynced) => {
      const targetExam = exams.find((e) => e.id === examId);
      if (!targetExam) return { success: false, error: 'Exam not found.' };

      // Allow clearing an invigilator assignment
      if (invigilator === null) {
        const prevInvId = targetExam.invigilatorId;
        setExams((prev) => {
          const next = prev.map((e) => (e.id === examId ? { ...e, invigilatorId: null } : e));
          if (prevInvId && onSynced) onSynced(prevInvId, next);
          return next;
        });
        return { success: true };
      }

      const conflict = checkInvigilatorConflict(targetExam, invigilator, exams);
      if (conflict) return { success: false, error: conflict };

      setExams((prev) => {
        const next = prev.map((e) =>
          e.id === examId ? { ...e, invigilatorId: invigilator.id } : e
        );
        if (onSynced) onSynced(invigilator.id, next);
        return next;
      });
      return { success: true };
    },
    [exams]
  );

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

  return { exams: sortedExams, addExam, updateExam, deleteExam, assignRoom, assignInvigilator, kpis };
}
