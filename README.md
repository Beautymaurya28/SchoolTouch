 SchoolTouch: Full-Stack School Management System (MERN Stack)
SchoolTouch is a comprehensive, role-based Enterprise Resource Planning (ERP) system designed to manage all core administrative and academic functions of a modern school in a single platform. It ensures secure, real-time communication and management oversight for Admins, Teachers, Students, and Parents.

Core Features & Module Overview
The application is built on the MERN stack (MongoDB, Express, React, Node.js) with Socket.io for real-time communication.

Module	Key Functionality	Primary Roles
User Management	Login/Logout for Admin, Teacher, Student, Parent; JWT-based security.	All
Class & Subject	Centralized management of classes (with sections) and class-wise subject assignment.	Admin, Teacher
Timetable & Schedule	Unified Page View for weekly periods, exams, and special events (holidays, PTMs).	Admin (Edit), Teacher/Student/Parent (View)
Homework & Materials	Teachers upload files; students submit homework; parents track status.	Teacher, Student, Parent
Exams & Results	Create exams, submit/publish results, enforce security rules (e.g., hiding invigilator name from students).	Admin, Teacher, Student, Parent
Fees Management	Admin sets fee structures; Parent views fees and tracks payment status.	Admin, Parent, Student
Real-time Chat	Private, secure chat between Teachers and Parents of their assigned classes (via Socket.io).	Teacher, Parent
Announcements	Target announcements to specific classes, roles, or the entire school.	Admin, Teacher (Create)
🛠️ Setup Guide: How to Run Locally
Follow these steps to get a copy of the project up and running on your local machine.

Prerequisites
Node.js (Version 18.x or higher)

npm (Node Package Manager)

MongoDB Atlas account (or local MongoDB instance)

Step 1: Clone the Repository
Open your terminal and clone the project:

Bash

git clone https://github.com/Beautymaurya28/SchoolTouch.git
cd SchoolTouch
Step 2: Backend (Server) Setup
Navigate to the server directory:

Bash

cd server
Install all backend dependencies:

Bash

npm install
Configure Environment Variables (.env):
Create a file named .env in the server folder. You must replace the placeholder values with your own secured credentials:

# --- Database Configuration ---
MONGO_URI=mongodb+srv://<your_username>:<your_password>@<cluster-url>/schooltouchDB?retryWrites=true&w=majority

# --- Security Keys ---
JWT_SECRET=YOUR_VERY_STRONG_SECRET_KEY_HERE
Crucial: Ensure your MongoDB Atlas IP Whitelist includes your current public IP address to allow a connection.

Start the Backend Server:

Bash

node index.js
(The server will run on http://localhost:5000)

Step 3: Frontend (Client) Setup
Open a NEW terminal tab/window and navigate to the client directory:

Bash

cd ..
cd client
Install all frontend dependencies:

Bash

npm install
Start the React Application:

Bash

npm start
(The application will open in your browser at http://localhost:3000)

 Accessing the System (Role Credentials)
Initial Access
Upon the first run, the system will redirect you to a First-Time Admin Signup page (if one is not created).

Create your main Admin account.

Testing Workflow
Role	Permissions	Key Routes to Test
Admin	Full management control, creates all data.	/admin/dashboard/teachers, /admin/dashboard/myclasses
Teacher	Views assigned classes, creates unit tests, submits marks.	/teacher/dashboard/results, /teacher/dashboard/chat
Student	View-only: Timetable, Results, Homework.	/student/dashboard/my-timetable, /student/dashboard/results
Parent	View-only: Child's status, Homework, Chat with Teacher.	/parent/dashboard/fees, /parent/dashboard/chat
(Note: For Teacher/Student/Parent access, you must first create those profiles through the Admin dashboard.)




 Project Structure
SchoolTouch-ERP/
├── client/
│   ├── src/
│   │   └── components/     # All React UI components (.js & .css)
├── server/
│   ├── config/             # DB Connection Logic
│   ├── controllers/        # Business Logic (e.g., studentController.js)
│   ├── models/             # Mongoose Schemas (e.g., Exam.js, Message.js)
│   ├── routes/             # API Endpoints (e.g., exams.js, chat.js)
│   ├── middleware/         # Auth, Upload, etc.
│   └── index.js            # Main Server Entry Point
└── README.md
