import { useMemo, useState, useEffect } from 'react';

const STATUS_OPTIONS = ['All', 'Pending', 'Scheduled'];
const SORT_OPTIONS = [
  { value: 'date-asc', label: 'Date ↑' },
  { value: 'date-desc', label: 'Date ↓' },
  { value: 'course-asc', label: 'Course A–Z' },
  { value: 'students-desc', label: 'Students ↓' },
];

export default function SearchFilterBar({ exams, rooms, onFiltered }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roomFilter, setRoomFilter] = useState('all'); // 'all' | 'assigned' | 'unassigned'
  const [sort, setSort] = useState('date-asc');

  const result = useMemo(() => {
    let list = [...exams];

    // Search by course code or name
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.courseCode.toLowerCase().includes(q) ||
          e.courseName.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      list = list.filter((e) => e.status === statusFilter);
    }

    // Room availability filter
    if (roomFilter === 'assigned') list = list.filter((e) => e.roomId);
    if (roomFilter === 'unassigned') list = list.filter((e) => !e.roomId);

    // Sort — always creates a shallow copy, never mutates
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'date-asc':
          return new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`);
        case 'date-desc':
          return new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`);
        case 'course-asc':
          return a.courseCode.localeCompare(b.courseCode);
        case 'students-desc':
          return Number(b.studentCount) - Number(a.studentCount);
        default:
          return 0;
      }
    });

    return list;
  }, [exams, query, statusFilter, roomFilter, sort]);

  // Notify parent of filtered result whenever it changes
  useEffect(() => {
    onFiltered(result);
  }, [result]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx={11} cy={11} r={8} />
            <path strokeLinecap="round" d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          id="search-bar"
          type="text"
          placeholder="Search by course code or name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
      </div>

      {/* Status filter */}
      <select
        id="status-filter"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s === 'All' ? 'All statuses' : s}
          </option>
        ))}
      </select>

      {/* Room filter */}
      <select
        id="room-filter"
        value={roomFilter}
        onChange={(e) => setRoomFilter(e.target.value)}
        className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
      >
        <option value="all">All rooms</option>
        <option value="assigned">Room assigned</option>
        <option value="unassigned">No room</option>
      </select>

      {/* Sort */}
      <select
        id="sort-select"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            Sort: {o.label}
          </option>
        ))}
      </select>

      <span className="ml-auto text-xs text-slate-400">
        {result.length} result{result.length !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
