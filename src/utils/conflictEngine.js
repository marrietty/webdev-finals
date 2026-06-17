/**
 * conflictEngine.js
 * Pure functions for clash detection. No React imports — safe to call anywhere.
 */

/**
 * Returns the start (ms) and end (ms) of an exam.
 */
export function examWindow(exam) {
  const start = new Date(`${exam.date}T${exam.time}`).getTime();
  const end = start + Number(exam.duration) * 60_000;
  return { start, end };
}

/**
 * Returns true if two exam windows overlap (strictly).
 */
export function doExamsOverlap(a, b) {
  const wa = examWindow(a);
  const wb = examWindow(b);
  return wa.start < wb.end && wb.start < wa.end;
}

/**
 * Check if assigning `room` to `targetExam` causes a conflict.
 * Returns null if OK, or a descriptive error string.
 */
export function checkRoomConflict(targetExam, room, allExams) {
  // Capacity check
  if (room.capacity < Number(targetExam.studentCount)) {
    return `Capacity conflict: Room ${room.building} ${room.roomNumber} holds ${room.capacity} students but the exam has ${targetExam.studentCount} students.`;
  }

  // Overlap check — find any other exam already using this room that overlaps
  const clash = allExams.find(
    (exam) =>
      exam.id !== targetExam.id &&
      exam.roomId === room.id &&
      doExamsOverlap(exam, targetExam)
  );

  if (clash) {
    return `Overlap conflict: Room ${room.building} ${room.roomNumber} is already assigned to ${clash.courseCode} on ${clash.date} at ${clash.time}.`;
  }

  return null;
}

/**
 * Check if assigning `invigilator` to `targetExam` causes a conflict.
 * Returns null if OK, or a descriptive error string.
 */
export function checkInvigilatorConflict(targetExam, invigilator, allExams) {
  // Overlap check — find another exam this invigilator is assigned to that overlaps
  const clash = allExams.find(
    (exam) =>
      exam.id !== targetExam.id &&
      exam.invigilatorId === invigilator.id &&
      doExamsOverlap(exam, targetExam)
  );

  if (clash) {
    return `Overlap conflict: ${invigilator.name} is already assigned to ${clash.courseCode} on ${clash.date} at ${clash.time}.`;
  }

  // Workload check
  const examHours = Number(targetExam.duration) / 60;
  if (invigilator.assignedHours + examHours > invigilator.maxWeeklyHours) {
    const remaining = (invigilator.maxWeeklyHours - invigilator.assignedHours).toFixed(1);
    return `Workload limit: ${invigilator.name} only has ${remaining}h of workload remaining (max ${invigilator.maxWeeklyHours}h/week).`;
  }

  return null;
}

/**
 * Returns the utilization percentage of a room across all exams (0–100).
 * "Utilization" = fraction of working hours (8 AM–8 PM × 5 days) that are booked.
 */
export function roomUtilization(room, allExams) {
  const bookedExams = allExams.filter((e) => e.roomId === room.id);
  const bookedMinutes = bookedExams.reduce((sum, e) => sum + Number(e.duration), 0);
  // 12 hours × 5 days × 60 min = 3600 min per week
  const weeklyCapacityMinutes = 3600;
  return Math.min(100, Math.round((bookedMinutes / weeklyCapacityMinutes) * 100));
}
