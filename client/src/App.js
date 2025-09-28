import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import ParentDashboard from './components/ParentDashboard';

// Import all management components
import StudentManagement from './components/StudentManagement';
import TeacherManagement from './components/TeacherManagement';
import ClassManagement from './components/ClassManagementPage';
import ExamManagement from './components/ExamManagement';
import UserProfile from './components/UserProfile'; 
import DashboardHome from './components/DashboardHome';


import AttendanceManagement from './components/AttendanceManagement';
import AttendanceReport from './components/AttendanceReport';
import ResultSubmission from './components/ResultSubmission'; // Should be correct
//import UnitTestCreation from './components/UnitTestCreation'; // Should be correct
import ResultDashboard from './components/ResultDashboard';
import PublishResults from './components/PublishResults';
import FeesManagement from './components/FeesManagement';
import FeesDashboard from './components/FeesDashboard';
import AnnouncementSender from './components/AnnouncementSender';
import AnnouncementList from './components/AnnouncementList';
import ParentChat from './components/ParentChat';
import TeacherChat from './components/TeacherChat';
import AdminManageParents from './components/AdminManageParents';
import SubjectManagement from './components/SubjectManagement';
import MyTimetable from './components/MyTimetable';
import TimetableAndSchedule from './components/TimetableAndSchedule';
import ClassAndStudentView from './components/ClassAndStudentView';
import AdminChat from './components/AdminChat';
import HomeworkAndMaterials from './components/HomeworkAndMaterials';
// PrivateRoute component for access control
const PrivateRoute = ({ children, roles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) return <Navigate to="/" />;
  if (roles && !roles.includes(userRole)) return <Navigate to="/unauthorized" />;
  return children;
};



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/unauthorized" element={<h2>Access Denied</h2>} />

        {/* Admin Dashboard Routes */}
        <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>}>
          <Route index element={<h2>Welcome to the Admin Dashboard!</h2>} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="parents" element={<AdminManageParents />} />
          <Route path="results/view" element={<ExamManagement />} /> 
          <Route path="myclasses" element={<ClassManagement />} />
          <Route path="subjects" element={<SubjectManagement />} />
          <Route path="exams" element={<ExamManagement />} />
          <Route index element={<DashboardHome />} /> 
          <Route path="results/publish" element={<PublishResults />} />
          <Route path="results/view" element={<ResultDashboard />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="fees" element={<FeesManagement />} />
          <Route path="chat" element={<AdminChat />} />
          <Route path="announcements" element={<AnnouncementSender />} />
          <Route path="timetables-and-schedule" element={<TimetableAndSchedule />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Teacher Dashboard Routes */}
        <Route path="/teacher/dashboard" element={<PrivateRoute roles={['teacher']}><TeacherDashboard /></PrivateRoute>}>
          <Route index element={<h2>Welcome, Teacher!</h2>} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="homework-and-materials" element={<HomeworkAndMaterials />} />
          <Route path="results" element={<ResultSubmission />} />
          <Route path="announcements" element={<AnnouncementSender />} />
          <Route path="chat" element={<TeacherChat />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="timetable" element={<MyTimetable />} />
          <Route path="myclass" element={<ClassAndStudentView />} />
        </Route>

        {/* Student Dashboard Routes */}
        <Route path="/student/dashboard" element={<PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>}>
          <Route index element={<h2>Welcome, Student!</h2>} />
          <Route path="attendance" element={<AttendanceReport />} />
          <Route path="results" element={<ResultDashboard />} />
          <Route path="announcements" element={<AnnouncementList />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="timetable" element={<MyTimetable />} />
          <Route path="homework-and-materials" element={<HomeworkAndMaterials />} />
          <Route path="timetables-and-schedule" element={<TimetableAndSchedule />} /> {/* FIX: Ensure path is correct */}
          <Route path="myclass" element={<ClassAndStudentView />} />
        </Route>

        {/* Parent Dashboard Routes */}
        <Route path="/parent/dashboard" element={<PrivateRoute roles={['parent']}><ParentDashboard /></PrivateRoute>}>
          <Route index element={<h2>Welcome, Parent!</h2>} />
          <Route path="attendance" element={<AttendanceReport />} />
          <Route path="results" element={<ResultDashboard />} />
          <Route path="fees" element={<FeesDashboard />} />
          <Route path="homework-and-materials" element={<HomeworkAndMaterials />} />
          <Route path="announcements" element={<AnnouncementList />} />
          <Route path="chat" element={<ParentChat />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="timetable" element={<MyTimetable />} />
          <Route path="myclass" element={<ClassAndStudentView />} />
        </Route>
      </Routes>
    </Router>
  );
}


export default App;
