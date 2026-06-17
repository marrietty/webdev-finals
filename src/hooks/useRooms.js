import { useState, useEffect, useCallback } from 'react';
import { loadRooms, saveRooms } from '../utils/storage';

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `room_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const EQUIPMENT_OPTIONS = ['Projector', 'Computers', 'Whiteboard', 'Audio System', 'Smart Board'];

export { EQUIPMENT_OPTIONS };

export function useRooms() {
  const [rooms, setRooms] = useState(() => loadRooms());

  useEffect(() => {
    saveRooms(rooms);
  }, [rooms]);

  const addRoom = useCallback((data) => {
    const errors = validateRoom(data);
    if (errors.length > 0) return { success: false, errors };

    const newRoom = {
      id: makeId(),
      building: data.building.trim(),
      roomNumber: data.roomNumber.trim(),
      capacity: Number(data.capacity),
      equipment: Array.isArray(data.equipment) ? data.equipment : [],
      accessible: Boolean(data.accessible),
    };
    setRooms((prev) => [...prev, newRoom]);
    return { success: true, room: newRoom };
  }, []);

  const updateRoom = useCallback((id, data) => {
    const errors = validateRoom(data);
    if (errors.length > 0) return { success: false, errors };

    setRooms((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              building: data.building.trim(),
              roomNumber: data.roomNumber.trim(),
              capacity: Number(data.capacity),
              equipment: Array.isArray(data.equipment) ? data.equipment : [],
              accessible: Boolean(data.accessible),
            }
          : r
      )
    );
    return { success: true };
  }, []);

  const deleteRoom = useCallback((id) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { rooms, addRoom, updateRoom, deleteRoom };
}

function validateRoom(data) {
  const errors = [];
  if (!data.building?.trim()) errors.push('Building name is required.');
  if (!data.roomNumber?.trim()) errors.push('Room number is required.');
  const cap = Number(data.capacity);
  if (!Number.isFinite(cap) || cap <= 0) errors.push('Capacity must be a positive number.');
  return errors;
}
