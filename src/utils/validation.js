export function validateExam(data, existingExams = [], excludeId = null) {
  const errors = [];

  if (!data.courseCode?.trim()) errors.push('Course code is required.');
  if (!data.courseName?.trim()) errors.push('Course name is required.');
  if (!data.date) errors.push('Date is required.');
  if (!data.time) errors.push('Time is required.');
  if (data.duration === '' || data.duration === undefined || data.duration === null) {
    errors.push('Duration is required.');
  }
  if (data.studentCount === '' || data.studentCount === undefined || data.studentCount === null) {
    errors.push('Student count is required.');
  }

  // Required-field checks must pass before the rest make sense.
  if (errors.length > 0) return errors;

  const examDateTime = new Date(`${data.date}T${data.time}`);
  if (Number.isNaN(examDateTime.getTime())) {
    errors.push('Date/time is invalid.');
  } else if (examDateTime <= new Date()) {
    errors.push('Date/time must be in the future.');
  }

  const studentCount = Number(data.studentCount);
  if (!Number.isFinite(studentCount) || studentCount <= 0) {
    errors.push('Student count must be a positive number.');
  }

  const duration = Number(data.duration);
  if (!Number.isFinite(duration) || duration <= 0) {
    errors.push('Duration must be a positive number of minutes.');
  }

  const isDuplicate = existingExams.some(
    (exam) =>
      exam.id !== excludeId &&
      exam.courseCode.trim().toLowerCase() === data.courseCode.trim().toLowerCase() &&
      exam.date === data.date &&
      exam.time === data.time
  );
  if (isDuplicate) {
    errors.push('An exam for this course at the same date and time already exists.');
  }

  return errors;
}
