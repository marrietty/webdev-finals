import { useState, useCallback, useRef, useEffect } from 'react';
import { useExams } from './hooks/useExams';
import { useRooms } from './hooks/useRooms';
import { useInvigilators } from './hooks/useInvigilators';
import { useToasts } from './hooks/useToasts';
import { Sun, Moon } from 'lucide-react';

import KpiCards from './components/KpiCards';
import ViewToggle from './components/ViewToggle';
import ExamTable from './components/ExamTable';
import ExamCardGrid from './components/ExamCardGrid';
import TimetableView from './components/TimetableView';
import ExamDrawer from './components/ExamDrawer';
import ConfirmDialog from './components/ConfirmDialog';
import ExamFormModal from './components/ExamFormModal';
import ToastStack from './components/ToastStack';
import SearchFilterBar from './components/SearchFilterBar';
import ConflictCenter from './components/ConflictCenter';
import WorkloadPanel from './components/WorkloadPanel';
import AssignModal from './components/AssignModal';
import RoomManagerModal from './components/RoomManagerModal';
import InvigilatorManagerModal from './components/InvigilatorManagerModal';
import SeatingPlannerModal from './components/SeatingPlannerModal';

function getInitialView() {
  if (typeof window === 'undefined') return 'table';
  return window.matchMedia('(min-width: 768px)').matches ? 'table' : 'cards';
}

export default function App() {
  // ── Theme state & synchronization ──────────────────────────────
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('examgrid:theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('examgrid:theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // ── Core data hooks ───────────────────────────────────────────────
  const { exams, isLoading: examsLoading, addExam, updateExam, deleteExam, assignRoom, assignInvigilator, saveSeatingPlan, kpis } = useExams();
  const { rooms, isLoading: roomsLoading, addRoom, updateRoom, deleteRoom } = useRooms();
  const {
    invigilators,
    isLoading: invLoading,
    addInvigilator,
    updateInvigilator,
    deleteInvigilator,
    syncAssignedHours,
  } = useInvigilators();
  const { toasts, showToast, dismissToast } = useToasts();

  const isLoading = examsLoading || roomsLoading || invLoading;

  // ── View state ────────────────────────────────────────────────────
  const [view, setView] = useState(getInitialView);
  // SearchFilterBar drives this via its useEffect — initialized empty, populated on first render
  const [filteredExams, setFilteredExams] = useState([]);

  // ── Drawer / modal open state ─────────────────────────────────────
  const [selectedExam, setSelectedExam] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [examPendingDelete, setExamPendingDelete] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);  // exam to assign resources to
  const [roomManagerOpen, setRoomManagerOpen] = useState(false);
  const [invigilatorManagerOpen, setInvigilatorManagerOpen] = useState(false);
  const [seatingPlannerTarget, setSeatingPlannerTarget] = useState(null); // exam for seating planner

  // ── Conflict center state ─────────────────────────────────────────
  const [conflicts, setConflicts] = useState([]);
  const pushConflict = useCallback((msg) => setConflicts((p) => [...p, msg]), []);
  const clearConflicts = useCallback(() => setConflicts([]), []);

  // ── Drawer handlers ───────────────────────────────────────────────
  function openDrawer(exam) {
    setSelectedExam(exam);
    setDrawerOpen(true);
  }

  function openCreateForm() {
    setEditingExam(null);
    setFormOpen(true);
  }

  function openEditForm(exam) {
    setEditingExam(exam);
    setFormOpen(true);
    setDrawerOpen(false);
  }

  function handleSave(formData, examId) {
    const result = examId ? updateExam(examId, formData) : addExam(formData);
    if (result.success) {
      setFormOpen(false);
      showToast(examId ? 'Exam updated.' : 'Exam created.', 'success');
    } else {
      showToast(result.errors[0], 'error');
    }
    return result;
  }

  function confirmDelete() {
    if (!examPendingDelete) return;
    deleteExam(examPendingDelete.id);
    showToast('Exam deleted.', 'success');
    setExamPendingDelete(null);
    setDrawerOpen(false);
  }

  // ── Assignment handler ────────────────────────────────────────────
  /**
   * Called by AssignModal with examId, roomId|null, invigilatorId|null.
   * Validates each assignment independently and accumulates conflicts.
   */
  function handleAssign(examId, roomId, invigilatorId) {
    clearConflicts();
    const errors = [];

    // Assign room
    const room = roomId ? rooms.find((r) => r.id === roomId) : null;
    const roomResult = assignRoom(examId, room);
    if (!roomResult.success) errors.push(roomResult.error);

    // Assign invigilator
    const inv = invigilatorId ? invigilators.find((i) => i.id === invigilatorId) : null;
    const invResult = assignInvigilator(examId, inv, syncAssignedHours);
    if (!invResult.success) errors.push(invResult.error);

    if (errors.length > 0) {
      errors.forEach(pushConflict);
      return { success: false, errors };
    }

    showToast('Resources assigned successfully.', 'success');
    return { success: true };
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">ExamGrid</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Level 2 — Scheduling Workspace</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="btn-theme-toggle"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-amber-500 hover:rotate-45 transition-transform duration-200" />
                ) : (
                  <Moon className="h-5 w-5 text-indigo-600 hover:-rotate-12 transition-transform duration-200" />
                )}
              </button>
              <button
                type="button"
                id="btn-manage-rooms"
                onClick={() => setRoomManagerOpen(true)}
                className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
              >
                Manage Rooms
              </button>
              <button
                type="button"
                id="btn-manage-invigilators"
                onClick={() => setInvigilatorManagerOpen(true)}
                className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
              >
                Manage Invigilators
              </button>
              <button
                type="button"
                id="btn-new-exam"
                onClick={openCreateForm}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors duration-200"
              >
                + New Exam
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {/* Global loading skeleton */}
        {isLoading && (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 shadow-sm text-sm text-slate-500 dark:text-slate-400">
            <svg className="h-4 w-4 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading data from database…
          </div>
        )}
        {/* KPIs */}
        <KpiCards kpis={kpis} />

        {/* Conflict Center */}
        {conflicts.length > 0 && (
          <ConflictCenter conflicts={conflicts} onDismiss={clearConflicts} />
        )}

        {/* Workload Panel */}
        <WorkloadPanel rooms={rooms} invigilators={invigilators} exams={exams} />

        {/* Search / filter bar */}
        <SearchFilterBar exams={exams} rooms={rooms} onFiltered={setFilteredExams} />

        {/* View toggle + New exam */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ViewToggle view={view} onChange={setView} />
          <span className="text-xs text-slate-400">
            Showing {filteredExams.length} of {exams.length} exam{exams.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Main content view */}
        {view === 'table' && (
          <ExamTable
            exams={filteredExams}
            rooms={rooms}
            invigilators={invigilators}
            onSelect={openDrawer}
            onDelete={setExamPendingDelete}
            onAssign={setAssignTarget}
            onPlanSeating={setSeatingPlannerTarget}
          />
        )}
        {view === 'cards' && (
          <ExamCardGrid
            exams={filteredExams}
            rooms={rooms}
            invigilators={invigilators}
            onSelect={openDrawer}
            onDelete={setExamPendingDelete}
            onAssign={setAssignTarget}
            onPlanSeating={setSeatingPlannerTarget}
          />
        )}
        {view === 'timetable' && (
          <TimetableView
            exams={filteredExams}
            rooms={rooms}
            onSelect={openDrawer}
          />
        )}
      </main>

      {/* ── Overlays ───────────────────────────────────────────────── */}
      <ExamDrawer
        exam={selectedExam}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onEdit={openEditForm}
        onDelete={setExamPendingDelete}
      />

      <ExamFormModal
        open={formOpen}
        initialExam={editingExam}
        onSave={handleSave}
        onClose={() => setFormOpen(false)}
      />

      <AssignModal
        open={!!assignTarget}
        exam={assignTarget}
        rooms={rooms}
        invigilators={invigilators}
        onSave={handleAssign}
        onClose={() => setAssignTarget(null)}
      />

      <RoomManagerModal
        open={roomManagerOpen}
        rooms={rooms}
        onAdd={addRoom}
        onUpdate={updateRoom}
        onDelete={deleteRoom}
        onClose={() => setRoomManagerOpen(false)}
      />

      <InvigilatorManagerModal
        open={invigilatorManagerOpen}
        invigilators={invigilators}
        onAdd={addInvigilator}
        onUpdate={updateInvigilator}
        onDelete={deleteInvigilator}
        onClose={() => setInvigilatorManagerOpen(false)}
      />

      <SeatingPlannerModal
        open={!!seatingPlannerTarget}
        exam={seatingPlannerTarget}
        room={seatingPlannerTarget && seatingPlannerTarget.roomId ? rooms.find(r => r.id === seatingPlannerTarget.roomId) : null}
        onClose={() => setSeatingPlannerTarget(null)}
      />

      <ConfirmDialog
        open={!!examPendingDelete}
        title="Delete exam?"
        message={
          examPendingDelete
            ? `This will permanently remove ${examPendingDelete.courseCode} on ${examPendingDelete.date}.`
            : ''
        }
        onConfirm={confirmDelete}
        onCancel={() => setExamPendingDelete(null)}
      />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
