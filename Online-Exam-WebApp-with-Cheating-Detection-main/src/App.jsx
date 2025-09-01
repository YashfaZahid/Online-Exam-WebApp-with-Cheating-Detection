import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import TeacherLogin from './pages/TeacherLogin';
import StudentLogin from './pages/StudentLogin';
import TeacherPage from './pages/TeacherPage';
import StudentPage from './pages/StudentPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path='/TeacherLogin' element={<TeacherLogin />} />
        <Route path='/TeacherPage' element={<TeacherPage />} />
        <Route path='/StudentLogin' element={<StudentLogin />} />
        <Route path='/StudentPage' element={<StudentPage />} />
      </Routes>
    </Router>
  );
}

export default App;

