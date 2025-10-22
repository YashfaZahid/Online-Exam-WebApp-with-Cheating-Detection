import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import TeacherLogin from "./pages/TeacherLogin";
import StudentLogin from "./pages/StudentLogin";
import TeacherPage from "./pages/TeacherPage";
import StudentPage from "./pages/StudentPage";
import Testform from "./pages/Testform.jsx";
import TeacherChoice from "./pages/TeacherChoice.jsx";
import TeacherSignup from "./pages/TeacherSignup.jsx";
import StudentSignup from "./pages/StudentSignup.jsx";
import StudentChoice from "./pages/StudentChoice.jsx";
import TestPage from "./pages/TestPage.jsx";
import CreateTest from "./pages/CreateTest.jsx";
import ReportsDashboard from "./pages/TeacherDashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/TeacherLogin" element={<TeacherLogin />} />
        <Route path="/TeacherPage" element={<TeacherPage />} />
        <Route path="/StudentLogin" element={<StudentLogin />} />
        <Route path="/StudentPage" element={<StudentPage />} />
        <Route path="/Testform" element={<Testform />} />
        <Route path="/TeacherChoice" element={<TeacherChoice />} />
        <Route path="/TeacherSignup" element={<TeacherSignup />} />
        <Route path="/StudentSignup" element={<StudentSignup />} />
        <Route path="/StudentChoice" element={<StudentChoice />} />
        <Route path="/test/:testId" element={<TestPage />} />
        <Route path="/create-test" element={<CreateTest />} />
        <Route path="/reports" element={<ReportsDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
