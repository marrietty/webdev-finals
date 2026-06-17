import { useState, useCallback } from 'react';

// Generates an initial grid based on room configuration
function generateInitialGrid(room) {
  if (!room || !room.grid) return [];
  const { rows, columns, blocked = [], accessible = [] } = room.grid;
  
  const grid = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const id = `${r}-${c}`;
      let status = 'available';
      if (blocked.includes(id)) {
        status = 'blocked';
      } else if (accessible.includes(id)) {
        status = 'accessible';
      }
      grid.push({
        id,
        row: r,
        col: c,
        status,
        student: null,
      });
    }
  }
  return grid;
}

export function useSeatingPlanner(initialRoom) {
  // History stack for Undo/Redo
  const [history, setHistory] = useState([generateInitialGrid(initialRoom)]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentGrid = history[currentIndex] || [];

  const updateGrid = useCallback((newGrid) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndex + 1);
      return [...newHistory, newGrid];
    });
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, history.length]);

  const allocate = useCallback((students, strategy, bufferSize, room) => {
    let grid = generateInitialGrid(room);
    
    // Create a pure copy of students array to sort
    let sortedStudents = [...students];
    if (strategy === 'alphabetical') {
      sortedStudents.sort((a, b) => a.name.localeCompare(b.name));
    } else if (strategy === 'regNo') {
      sortedStudents.sort((a, b) => a.regNo.localeCompare(b.regNo));
    } else if (strategy === 'random') {
      sortedStudents.sort(() => Math.random() - 0.5);
    }

    // Separate accessible and regular students
    const accessibleStudents = sortedStudents.filter(s => s.needsAccessibility);
    const regularStudents = sortedStudents.filter(s => !s.needsAccessibility);

    let newGrid = [...grid];
    
    // Allocate accessible students first
    let accStudentIdx = 0;
    newGrid = newGrid.map(seat => {
      if (seat.status === 'accessible' && accStudentIdx < accessibleStudents.length) {
        return { ...seat, status: 'occupied', student: accessibleStudents[accStudentIdx++] };
      }
      return seat;
    });

    // Combine remaining accessible students with regular students
    const remainingStudents = [...accessibleStudents.slice(accStudentIdx), ...regularStudents];
    
    let regStudentIdx = 0;
    let bufferCounter = 0;

    newGrid = newGrid.map(seat => {
      if ((seat.status === 'available' || seat.status === 'accessible') && regStudentIdx < remainingStudents.length) {
        if (bufferCounter > 0) {
          bufferCounter--;
          return seat; // Skip for buffer
        }
        bufferCounter = bufferSize;
        return { ...seat, status: 'occupied', student: remainingStudents[regStudentIdx++] };
      }
      return seat;
    });

    const unallocated = remainingStudents.slice(regStudentIdx);
    
    updateGrid(newGrid);
    return { success: true, unallocatedCount: unallocated.length, unallocated };
  }, [updateGrid]);

  const moveStudent = useCallback((fromSeatId, toSeatId) => {
    const fromSeat = currentGrid.find(s => s.id === fromSeatId);
    const toSeat = currentGrid.find(s => s.id === toSeatId);

    if (!fromSeat || !toSeat || toSeat.status === 'blocked') return false;

    // Swap students
    const newGrid = currentGrid.map(seat => {
      if (seat.id === fromSeatId) {
        // Assume fromSeat's original status was derived from the room, but we can just use available/accessible based on room default.
        // For simplicity, we just swap the `student` and `status` between the two seats.
        return { ...seat, student: toSeat.student, status: toSeat.student ? 'occupied' : (seat.id.includes('accessible') ? 'accessible' : 'available') };
      }
      if (seat.id === toSeatId) {
        return { ...seat, student: fromSeat.student, status: fromSeat.student ? 'occupied' : (seat.id.includes('accessible') ? 'accessible' : 'available') };
      }
      return seat;
    });

    // We should better restore original status. Let's do a basic fix:
    // If a seat loses a student, it becomes available. If it was originally accessible (from history[0]), make it accessible.
    const initialGrid = history[0];
    const finalGrid = newGrid.map(seat => {
      if (!seat.student) {
        const initialSeat = initialGrid.find(s => s.id === seat.id);
        return { ...seat, status: initialSeat.status };
      }
      return { ...seat, status: 'occupied' };
    });

    updateGrid(finalGrid);
    return true;
  }, [currentGrid, history, updateGrid]);

  return {
    grid: currentGrid,
    allocate,
    moveStudent,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    reset: (room) => updateGrid(generateInitialGrid(room)),
  };
}
