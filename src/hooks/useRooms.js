import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { loadRooms, saveRooms } from '../utils/storage';

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `room_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export const EQUIPMENT_OPTIONS = ['Projector', 'Computers', 'Whiteboard', 'Audio System', 'Smart Board'];

/** Map Supabase row → app shape */
function fromDb(row) {
  return {
    id: row.id,
    building: row.building_name,
    roomNumber: row.room_number,
    capacity: row.capacity,
    equipment: row.equipment ?? [],
    accessible: row.is_accessible ?? false,
  };
}

/** Map app shape → Supabase row */
function toDb(data) {
  return {
    building_name: data.building?.trim(),
    room_number: data.roomNumber?.trim(),
    capacity: Number(data.capacity),
    equipment: Array.isArray(data.equipment) ? data.equipment : [],
    is_accessible: Boolean(data.accessible),
  };
}

export function useRooms() {
  const [rooms, setRooms] = useState(() => loadRooms());
  const [isLoading, setIsLoading] = useState(true);

  // ── Boot: hydrate from Supabase ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function fetchRooms() {
      try {
        const { data, error } = await supabase.from('rooms').select('*');
        if (cancelled) return;
        if (error) throw error;
        const mapped = data.map(fromDb);
        setRooms(mapped);
        saveRooms(mapped);
      } catch (err) {
        console.warn('ExamGrid: Supabase rooms fetch failed, using localStorage.', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchRooms();
    return () => { cancelled = true; };
  }, []);

  const persistRooms = useCallback((updater) => {
    setRooms((prev) => {
      const next = updater(prev);
      saveRooms(next);
      return next;
    });
  }, []);

  // ── CRUD ──────────────────────────────────────────────────────────
  const addRoom = useCallback(
    async (data) => {
      const errors = validateRoom(data);
      if (errors.length > 0) return { success: false, errors };

      const id = makeId();
      const newRoom = {
        id,
        building: data.building.trim(),
        roomNumber: data.roomNumber.trim(),
        capacity: Number(data.capacity),
        equipment: Array.isArray(data.equipment) ? data.equipment : [],
        accessible: Boolean(data.accessible),
      };

      // Optimistic update
      persistRooms((prev) => [...prev, newRoom]);

      // Persist to Supabase
      const { error } = await supabase
        .from('rooms')
        .insert([{ id, ...toDb(newRoom) }]);
      if (error) {
        console.error('ExamGrid: failed to insert room to Supabase.', error);
        // Roll back
        persistRooms((prev) => prev.filter((r) => r.id !== id));
        return { success: false, errors: [error.message] };
      }

      return { success: true, room: newRoom };
    },
    [persistRooms]
  );

  const updateRoom = useCallback(
    async (id, data) => {
      const errors = validateRoom(data);
      if (errors.length > 0) return { success: false, errors };

      const patch = {
        building: data.building.trim(),
        roomNumber: data.roomNumber.trim(),
        capacity: Number(data.capacity),
        equipment: Array.isArray(data.equipment) ? data.equipment : [],
        accessible: Boolean(data.accessible),
      };

      persistRooms((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
      );

      const { error } = await supabase
        .from('rooms')
        .update(toDb(patch))
        .eq('id', id);
      if (error) console.error('ExamGrid: failed to update room in Supabase.', error);

      return { success: true };
    },
    [persistRooms]
  );

  const deleteRoom = useCallback(
    async (id) => {
      persistRooms((prev) => prev.filter((r) => r.id !== id));

      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) console.error('ExamGrid: failed to delete room from Supabase.', error);
    },
    [persistRooms]
  );

  return { rooms, isLoading, addRoom, updateRoom, deleteRoom };
}

function validateRoom(data) {
  const errors = [];
  if (!data.building?.trim()) errors.push('Building name is required.');
  if (!data.roomNumber?.trim()) errors.push('Room number is required.');
  const cap = Number(data.capacity);
  if (!Number.isFinite(cap) || cap <= 0) errors.push('Capacity must be a positive number.');
  // BUG FIX: cap upper bound — prevents absurdly large capacity values being stored
  if (cap > 10000) errors.push('Capacity must be 10,000 or fewer.');
  return errors;
}
