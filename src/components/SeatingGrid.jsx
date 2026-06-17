import React from 'react';

const statusColors = {
  available: 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600',
  occupied: 'bg-indigo-100 dark:bg-indigo-900 border-indigo-400 dark:border-indigo-500',
  accessible: 'bg-emerald-100 dark:bg-emerald-900 border-emerald-400 dark:border-emerald-500',
  blocked: 'bg-slate-200 dark:bg-slate-900 border-slate-400 dark:border-slate-700 opacity-50 cursor-not-allowed',
  conflicting: 'bg-rose-100 dark:bg-rose-900 border-rose-400 dark:border-rose-500',
};

export default function SeatingGrid({ room, grid, onSeatClick, selectedSeatId }) {
  if (!room || !room.grid) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
        No grid layout defined for this room.
      </div>
    );
  }

  const { columns } = room.grid;

  return (
    <div className="overflow-auto bg-slate-100 dark:bg-slate-950 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
      <div 
        className="grid gap-2 mx-auto" 
        style={{ 
          gridTemplateColumns: `repeat(${columns}, minmax(3rem, 4rem))`,
          width: 'max-content'
        }}
      >
        {grid.map(seat => {
          const isSelected = selectedSeatId === seat.id;
          const colorClasses = statusColors[seat.status] || statusColors.available;
          
          return (
            <div
              key={seat.id}
              onClick={() => onSeatClick(seat.id)}
              className={`
                relative flex flex-col items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-md border-2 transition-all cursor-pointer
                ${colorClasses}
                ${isSelected ? 'ring-4 ring-amber-400 dark:ring-amber-500 z-10 scale-110 shadow-lg' : 'hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md'}
              `}
              title={seat.student ? `${seat.student.name} (${seat.student.regNo})` : `Seat ${seat.row}-${seat.col}`}
            >
              <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                {seat.row}-{seat.col}
              </span>
              
              {seat.student && (
                <span className="absolute bottom-1 w-full text-center truncate px-1 text-[10px] sm:text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  {seat.student.name.split(' ')[0]}
                </span>
              )}

              {/* Indicator for accessibility needs */}
              {seat.student && seat.student.needsAccessibility && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-white dark:border-slate-900" title="Needs Accessibility" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
