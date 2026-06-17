import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Undo, Redo, RefreshCcw, Play, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSeatingPlanner } from '../hooks/useSeatingPlanner';
import SeatingGrid from './SeatingGrid';
import { generateMockStudents } from '../utils/mockData';

export default function SeatingPlannerModal({ open, exam, room, onClose }) {
  const [strategy, setStrategy] = useState('alphabetical');
  const [buffer, setBuffer] = useState(0);
  const [selectedSeatId, setSelectedSeatId] = useState(null);
  
  // Memoize students so they don't regenerate on every render
  const students = useMemo(() => {
    if (!exam) return [];
    return generateMockStudents(exam.studentCount);
  }, [exam]);

  const { grid, allocate, moveStudent, undo, redo, canUndo, canRedo, reset } = useSeatingPlanner(room);
  
  const [allocationResult, setAllocationResult] = useState(null);
  const busyRef = useRef(false);

  // Reset local state when modal opens/closes
  useEffect(() => {
    if (open) {
      setSelectedSeatId(null);
      setAllocationResult(null);
      reset(room);
    }
  }, [open, room, reset]);

  if (!open || !exam) return null;

  const handleGenerate = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    
    // Slight delay to allow UI to show loading if needed
    setTimeout(() => {
      const result = allocate(students, strategy, buffer, room);
      setAllocationResult(result);
      setSelectedSeatId(null);
      busyRef.current = false;
    }, 50);
  };

  const handleSeatClick = (seatId) => {
    if (busyRef.current) return;
    
    if (selectedSeatId === null) {
      setSelectedSeatId(seatId);
    } else {
      if (selectedSeatId === seatId) {
        setSelectedSeatId(null); // deselect
      } else {
        moveStudent(selectedSeatId, seatId);
        setSelectedSeatId(null);
      }
    }
  };

  const hasRoom = !!room;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm transition-opacity">
      <div className="flex h-full max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Smart Seating Planner
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {exam.courseCode} - {exam.courseName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          
          {/* Left Panel: Controls */}
          <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 p-6 overflow-y-auto bg-white dark:bg-slate-900 flex flex-col gap-6">
            
            {!hasRoom ? (
              <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800/30">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Room not assigned</h3>
                    <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                      <p>Please assign a room to this exam first before planning seating.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Generation Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Algorithm Settings</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Allocation Strategy
                    </label>
                    <select
                      value={strategy}
                      onChange={(e) => setStrategy(e.target.value)}
                      className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="alphabetical">Alphabetical (A-Z)</option>
                      <option value="regNo">Registration Number</option>
                      <option value="random">Randomize</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Buffer Seats (Gap)
                    </label>
                    <select
                      value={buffer}
                      onChange={(e) => setBuffer(Number(e.target.value))}
                      className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value={0}>0 (No Gap)</option>
                      <option value={1}>1 Seat Gap</option>
                      <option value={2}>2 Seat Gap</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerate}
                    className="w-full flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Generate Plan
                  </button>
                </div>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Overrides & History */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Manual Overrides</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click a student to select, then click another seat to swap or move them.
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={undo}
                      disabled={!canUndo}
                      className="flex-1 flex items-center justify-center gap-2 rounded border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Undo className="w-4 h-4" />
                      Undo
                    </button>
                    <button
                      onClick={redo}
                      disabled={!canRedo}
                      className="flex-1 flex items-center justify-center gap-2 rounded border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Redo className="w-4 h-4" />
                      Redo
                    </button>
                  </div>
                  <button
                    onClick={() => reset(room)}
                    className="w-full flex items-center justify-center gap-2 rounded border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Clear Grid
                  </button>
                </div>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Health Checks */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Health Checks</h3>
                  
                  {allocationResult && allocationResult.unallocatedCount > 0 ? (
                    <div className="flex items-start gap-2 text-sm text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <span>Capacity exceeded! {allocationResult.unallocatedCount} students could not be seated in this room. Consider multi-room splitting.</span>
                    </div>
                  ) : allocationResult ? (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>All {students.length} students seated successfully.</span>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Run generation to check capacity.
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Pure array immutability maintained.</span>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Right Panel: The Grid */}
          <div className="flex-1 p-6 overflow-hidden flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
            {hasRoom && (
              <div className="flex-1 overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col items-center">
                <div className="mb-4 text-center">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Front of Room ({room.roomNumber})</h3>
                  <div className="h-1 w-32 bg-slate-300 dark:bg-slate-700 mx-auto mt-2 rounded"></div>
                </div>
                
                <SeatingGrid
                  room={room}
                  grid={grid}
                  onSeatClick={handleSeatClick}
                  selectedSeatId={selectedSeatId}
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
