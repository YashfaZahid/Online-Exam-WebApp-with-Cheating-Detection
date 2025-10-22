import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/button.jsx";
import "./TeacherPage.css";

function TeacherPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="box">
        <h1>Teacher Dashboard</h1>
        <Button txt="Reports" myFucntion={() => navigate("/reports")} />
        <Button txt="Create Test" myFucntion={() => navigate("/create-test")} />
      </div>
    </div>
  );
}

export default TeacherPage;
