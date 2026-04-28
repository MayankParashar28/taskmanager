# Task Manager 

A production-ready, full-stack Task Management application built with Node.js, Express, and EJS. This application serves as a robust system for tracking tasks, featuring a highly polished, responsive, and professional dashboard interface with comprehensive dark mode support.

## Architecture & Technology Stack

* **Backend Environment:** Node.js
* **Framework:** Express.js
* **Template Engine:** EJS (Embedded JavaScript templating)
* **Styling:** Tailwind CSS (via CDN)
* **Data Persistence:** Local JSON-based Database (RESTful architecture)
* **Notifications:** Toastify JS
* **Typography:** Inter / Outfit Web Fonts

## Core Features

* **Complete CRUD Capabilities:** Create, read, update, and permanently delete tasks.
* **Intelligent Status Tracking:** Toggle tasks between "Pending" and "Completed" states.
* **Advanced Search & Filtering:** Server-side search logic to filter tasks by completion status and query strings across titles and details.
* **Deadline Management:** Integrated due date parser that automatically flags tasks as "Overdue", "Due Today", or "Upcoming" based on system time.
* **Premium User Interface:** A highly refined, glassmorphism-inspired UI featuring subtle background animations, high-contrast text, and responsive scaling.
* **Persistent Theming:** Automatic Light and Dark mode handling that reads user OS preferences and saves manual overrides to local storage to prevent Flash of Unstyled Content (FOUC).
* **Robust Error Handling:** Input sanitization for URL parameters and graceful fallbacks for missing data.

## Installation & Setup

Ensure you have Node.js (version 14.x or higher) installed on your system.

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/MayankParashar28/taskmanager.git
   cd task-manager-api-takehome
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```
   *Note: If you wish to run the application in development mode with hot-reloading, run `npm run dev` (requires `nodemon`).*

4. Access the dashboard:
   Open your preferred web browser and navigate to `http://localhost:3000`.

## Directory Structure

* `/views` - Contains all EJS templates (index, show, edit, delete).
* `/data` - Houses the `tasks.json` file serving as the application database.
* `/files` - Legacy text file directory (retained for backward compatibility).
* `index.js` - The primary Express application server and route controller.

## Design Decisions

The application was intentionally transitioned from a fragmented, file-based `.txt` storage system to a centralized JSON data store. This architectural change allowed for the implementation of complex, multi-field data objects (incorporating due dates, creation timestamps, and toggleable statuses) which significantly improved data integrity and simplified the RESTful routing design. All destructive or state-changing actions (creating, editing, toggling, deleting) are strictly handled via POST requests to ensure robustness against accidental navigation.

## License

This project is intended for demonstration and portfolio purposes.
