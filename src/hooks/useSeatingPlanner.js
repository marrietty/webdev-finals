import { useState, useCallback } from 'react';

// Generates an initial grid dynamically based on room capacity
function generateInitialGrid(room) {
  if (!room) return { grid: [], dimensions: { rows: 0, columns: 0 } };
  
  const capacity = room.capacity || 30;
  
  // Calculate optimal dimensions (typically wider than tall)
  let columns = Math.ceil(Math.sqrt(capacity * 1.2));
  let rows = Math.ceil(capacity / columns);
  
  const grid = [];
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const id = `${r}-${c}`;
      let status = 'available';
      
      // The cells exceeding capacity are blocked
      const cellIndex = r * columns + c;
      if (cellIndex >= capacity) {
        status = 'blocked';
      } else {
        // Randomly pre-designate blocked and accessible seats
        const rand = Math.random();
        if (rand < 0.05) {
          status = 'blocked'; // 5% chance
        } else if (rand < 0.15) {
          status = 'accessible'; // 10% chance
        }
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
  
  return { grid, dimensions: { rows, columns } };
}

export function useSeatingPlanner(initialRoom) {
  // History stack for Undo/Redo
  const [history, setHistory] = useState([generateInitialGrid(initialRoom)]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentSnapshot = history[currentIndex] || { grid: [], dimensions: { rows: 0, columns: 0 } };
  const currentGrid = currentSnapshot.grid;
  const dimensions = currentSnapshot.dimensions;

  const updateGrid = useCallback((newGrid) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndex + 1);
      return [...newHistory, { grid: newGrid, dimensions }];
    });
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex, dimensions]);

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
    // Generate a fresh base grid for the allocation
    let { grid: baseGrid } = generateInitialGrid(room);
    
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

    let newGrid = [...baseGrid];
    
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
        return { ...seat, student: toSeat.student, status: toSeat.student ? 'occupied' : (seat.id.includes('accessible') ? 'accessible' : 'available') };
      }
      if (seat.id === toSeatId) {
        return { ...seat, student: fromSeat.student, status: fromSeat.student ? 'occupied' : (seat.id.includes('accessible') ? 'accessible' : 'available') };
      }
      return seat;
    });

    // Restore original status properly
    const initialGrid = history[0].grid;
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
    dimensions,
    allocate,
    moveStudent,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    reset: (room) => {
      setHistory([generateInitialGrid(room)]);
      setCurrentIndex(0);
    },
  };
}
