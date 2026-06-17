const EXAMS_KEY = 'examgrid:exams:v1';
const ROOMS_KEY = 'examgrid:rooms:v1';
const INVIGILATORS_KEY = 'examgrid:invigilators:v1';

function load(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (err) {
    console.warn(`ExamGrid: could not read "${key}" from storage.`, err);
    return fallback;
  }
}

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`ExamGrid: could not save "${key}" to storage.`, err);
  }
}

export const loadExams = () => load(EXAMS_KEY);
export const saveExams = (v) => save(EXAMS_KEY, v);

export const loadRooms = () => load(ROOMS_KEY);
export const saveRooms = (v) => save(ROOMS_KEY, v);

export const loadInvigilators = () => load(INVIGILATORS_KEY);
export const saveInvigilators = (v) => save(INVIGILATORS_KEY, v);
