import React from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Button from "../components/button";
function TeacherChoice() {
  const navigate = useNavigate();
  const goToTeacherSignup = () => {
    navigate("/TeacherSignup");
  };
  const goToTeacherLogin = () => {
    navigate("/TeacherLogin");
  };
  return (
    <div className="container">
      <div className="box">
        <h1>Proctor Eye</h1>
        <h2>Teacher Portal</h2>
        <Button txt={"SignUp"} myFucntion={goToTeacherSignup} />
        <Button txt={"Login"} myFucntion={goToTeacherLogin} />
      </div>
    </div>
  );
}
export default TeacherChoice;
