import React from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Button from "../components/button";

function StudentChoice() {
  const navigate = useNavigate();
  const goToStudentSignup = () => {
    navigate("/StudentSignup");
  };
  const goToStudentLogin = () => {
    navigate("/StudentLogin");
  };
  return (
    <div className="container">
      <div className="box">
        <h1>Proctor Eye</h1>
        <h2>LogIn or SignUp as a Student</h2>
        <Button txt={"SignUp"} myFucntion={goToStudentSignup} />
        <Button txt={"Login"} myFucntion={goToStudentLogin} />
      </div>
    </div>
  );
}
export default StudentChoice;
