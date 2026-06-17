# ExamGrid

ExamGrid is a modern, web-based **Examination Scheduling and Seating Planner** designed to streamline academic exam coordination. Built using React, Vite, and Tailwind CSS, ExamGrid combines user-friendly scheduling workflows with smart algorithmic seat assignment to prevent scheduling conflicts and optimize examination room layouts.

---

## Prerequisites

Before running the application, ensure you have the following tools installed on your local system:

* **Node.js** (v18.0.0 or higher recommended)
  * [Download Node.js](https://nodejs.org/)
* **npm** (comes bundled with Node.js)

To verify if you already have these tools installed, run the following commands in your terminal:
```bash
node -v
npm -v
```

---

## Getting Started

Follow these step-by-step instructions to launch the application locally:

### 1. Extract or Clone the Project
If you received the project as a ZIP archive, extract it to a directory of your choice. Alternatively, if checking out via Git, clone the repository and navigate into the project root directory:
```bash
cd Hackathon
```

### 2. Install Dependencies
Run the command below in the project root directory to install all necessary packages:
```bash
npm install
```

### 3. Start the Development Server
Launch the local development server with:
```bash
npm run dev
```

Once started, the terminal will display a local address (usually **`http://localhost:5173`**). Open this URL in any modern web browser to access ExamGrid.

> [!NOTE]
> **Zero Configuration Required:** The application automatically falls back to an offline local storage state system. There is no need to configure external databases or environment variables to review the project's features.

---

## Key Features to Review

ExamGrid is structured around three core operational levels, which you can test directly from the browser:

### 1. Level 1: Core CRUD Operations
* **Manage Exams:** Create, edit, and delete exam records, including course codes, student counts, and durations.
* **Manage Rooms:** Track examination venues, their capacities, accessibility facilities, and built-in equipment.
* **Manage Invigilators:** Maintain lists of invigilators (proctors) with maximum weekly hour caps and real-time workload tracking.

### 2. Level 2: Interactive Scheduling Workspace
* **Conflict & Clash Detection:** Real-time visual alerts identify double-bookings (e.g., an invigilator or room assigned to two exams at the same time).
* **Timetable Grid:** A calendar-style workspace that displays scheduled exams across date and time slots.
* **Filters & Search:** Quick navigation to filter exams by status, course code, or venue.
* **Aesthetic Day/Night Mode:** Toggle between responsive light and dark themes using the theme selector at the top-right of the screen.

### 3. Level 3: Smart Seating Planner
* **Dynamic Grid Generation:** Select any scheduled exam and open the seating planner to view an interactive grid layout dynamically sized according to the room's physical capacity.
* **Interactive Seat Map:** Assign student seats dynamically with specialized statuses indicated by harmonious, theme-responsive colors:
  * **Available:** Standard open seats.
  * **Occupied:** Student assigned.
  * **Accessible:** Specially designated seating for students with physical accommodation needs.
  * **Blocked:** Broken or restricted seats.
  * **Conflicting:** Visual highlighting if spacing rules are violated.
* **Smart Auto-Allocation Algorithm:** Automatically assign student seats using a gap-optimized routing algorithm to maximize social spacing.
* **Manual Swapping:** Interactively swap seats or reconfigure layouts.
* **History Control:** Undo and redo seating adjustments with the click of a button.
