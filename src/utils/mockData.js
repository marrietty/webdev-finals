/**
 * mockData.js
 * Comprehensive mock data for Level 2 of ExamGrid.
 * Aligns perfectly with the database schemas used in useRooms, useInvigilators, and useExams.
 */

export const mockRooms = [
  {
    id: 'room-1',
    building: 'Science Hall',
    roomNumber: '301',
    capacity: 120,
    equipment: ['Projector', 'Audio System', 'Whiteboard'],
    accessible: true,
    grid: {
      rows: 10,
      columns: 12,
      blocked: ['0-5', '0-6', '1-5', '1-6', '2-5', '2-6', '3-5', '3-6', '4-5', '4-6', '5-5', '5-6', '6-5', '6-6', '7-5', '7-6', '8-5', '8-6', '9-5', '9-6'], // center aisle
      accessible: ['0-0', '0-1', '0-10', '0-11'], // front row corners
    },
  },
  {
    id: 'room-2',
    building: 'Engineering Building',
    roomNumber: '402',
    capacity: 30, // Low capacity to test Capacity Conflict
    equipment: ['Projector', 'Computers'],
    accessible: false,
    grid: {
      rows: 5,
      columns: 6,
      blocked: [], 
      accessible: [],
    },
  },
  {
    id: 'room-3',
    building: 'Liberal Arts Center',
    roomNumber: '101',
    capacity: 60,
    equipment: ['Projector', 'Whiteboard'],
    accessible: true,
    grid: {
      rows: 6,
      columns: 10,
      blocked: ['2-4', '2-5', '3-4', '3-5'], // broken seats in middle
      accessible: ['0-0', '0-1'],
    },
  },
  {
    id: 'room-4',
    building: 'Main Auditorium',
    roomNumber: 'Auditorium B',
    capacity: 150,
    equipment: ['Projector', 'Audio System', 'Smart Board'],
    accessible: true,
    grid: {
      rows: 10,
      columns: 15,
      blocked: ['0-7', '1-7', '2-7', '3-7', '4-7', '5-7', '6-7', '7-7', '8-7', '9-7'], // center aisle
      accessible: ['0-0', '0-1', '0-2', '0-12', '0-13', '0-14'],
    },
  },
  {
    id: 'room-5',
    building: 'IT Plaza',
    roomNumber: '205',
    capacity: 45,
    equipment: ['Computers', 'Whiteboard'],
    accessible: false,
    grid: {
      rows: 5,
      columns: 9,
      blocked: [],
      accessible: [],
    },
  },
];

export const mockInvigilators = [
  {
    id: 'inv-1',
    name: 'Prof. Alan Turing',
    maxWeeklyHours: 16,
    assignedHours: 4,
    availabilitySlots: ['Monday', 'Tuesday', 'Wednesday'],
  },
  {
    id: 'inv-2',
    name: 'Dr. Ada Lovelace',
    maxWeeklyHours: 12,
    assignedHours: 3,
    availabilitySlots: ['Wednesday', 'Thursday', 'Friday'],
  },
  {
    id: 'inv-3',
    name: 'Prof. Grace Hopper',
    maxWeeklyHours: 20,
    assignedHours: 6,
    availabilitySlots: ['Monday', 'Wednesday', 'Friday'],
  },
  {
    id: 'inv-4',
    name: 'Dr. Claude Shannon',
    maxWeeklyHours: 8,
    assignedHours: 2,
    availabilitySlots: ['Tuesday', 'Thursday'],
  },
];

// Helper to get a date string in the future relative to current local time (2026-06-17)
// This avoids hardcoding dates that might have already passed.
const getFutureDateStr = (daysAhead) => {
  const baseDate = new Date('2026-06-18'); // day after current local time
  baseDate.setDate(baseDate.getDate() + daysAhead);
  return baseDate.toISOString().split('T')[0];
};

const date1 = getFutureDateStr(1); // e.g. 2026-06-19
const date2 = getFutureDateStr(2); // e.g. 2026-06-20

export const mockExams = [
  // 1. Perfect Schedule Exam (No conflicts, assigned to Room 1 and Invigilator 1)
  {
    id: 'exam-perfect',
    courseCode: 'CS101',
    courseName: 'Introduction to Computer Science',
    date: date1,
    time: '09:00',
    duration: 120, // 2 hours
    studentCount: 80, // Under room-1 capacity (120)
    status: 'Scheduled',
    roomId: 'room-1',
    invigilatorId: 'inv-1',
  },

  // 2. Capacity Conflict Tester
  // To test: Open the resource assignment modal for this exam and try to assign "Engineering Building 402" (Capacity: 30)
  {
    id: 'exam-capacity-clash',
    courseCode: 'MATH201',
    courseName: 'Linear Algebra',
    date: date1,
    time: '14:00',
    duration: 90,
    studentCount: 60, // Exceeds Room 2 capacity of 30
    status: 'Pending',
    roomId: null, // Left unassigned initially so the user can test assigning Room 2 in the UI
    invigilatorId: null,
  },

  // 3. Time & Room Clash Tester (Part A)
  // Assigned to Room 3
  {
    id: 'exam-room-clash-a',
    courseCode: 'PHY102',
    courseName: 'General Physics II',
    date: date2,
    time: '10:00',
    duration: 120, // 10:00 to 12:00
    studentCount: 40,
    status: 'Scheduled',
    roomId: 'room-3',
    invigilatorId: 'inv-2',
  },

  // 4. Time & Room Clash Tester (Part B)
  // To test: Open the assignment modal for this exam and try to assign Room 3.
  // It overlaps in time (10:30 to 12:00) with PHY102 and will trigger the Overlapping Room Assignment block.
  {
    id: 'exam-room-clash-b',
    courseCode: 'CHEM101',
    courseName: 'Introductory Chemistry',
    date: date2,
    time: '10:30', // Overlaps with PHY102 (10:00 - 12:00)
    duration: 90, // 10:30 to 12:00
    studentCount: 35,
    status: 'Pending',
    roomId: null,
    invigilatorId: null,
  },

  // 5. Invigilator Clash Tester (Part A)
  // Assigned to Invigilator 3
  {
    id: 'exam-inv-clash-a',
    courseCode: 'BIO201',
    courseName: 'Molecular Biology',
    date: date1,
    time: '11:00',
    duration: 90, // 11:00 to 12:30
    studentCount: 50,
    status: 'Scheduled',
    roomId: 'room-4',
    invigilatorId: 'inv-3',
  },

  // 6. Invigilator Clash Tester (Part B)
  // To test: Open the assignment modal for this exam and try to assign Invigilator 3.
  // It overlaps in time (11:30 to 13:00) with BIO201 and will trigger the Overlapping Invigilator block.
  {
    id: 'exam-inv-clash-b',
    courseCode: 'ENG202',
    courseName: 'Technical Writing',
    date: date1,
    time: '11:30', // Overlaps with BIO201 (11:00 - 12:30)
    duration: 90, // 11:30 to 13:00
    studentCount: 40,
    status: 'Pending',
    roomId: null,
    invigilatorId: null,
  },
];

export const generateMockStudents = (count) => {
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Charlie', 'Drew', 'Avery'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  return Array.from({ length: count }, (_, i) => {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    return {
      id: `student-${i + 1}`,
      name: `${fn} ${ln}`,
      regNo: `REG2026${String(i + 1).padStart(4, '0')}`,
      needsAccessibility: Math.random() > 0.9, // 10% chance
    };
  });
};
