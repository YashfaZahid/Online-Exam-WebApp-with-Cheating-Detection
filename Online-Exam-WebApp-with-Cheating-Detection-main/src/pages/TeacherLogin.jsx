import React from "react";
import UsernameField from "../components/username";
import PasswordField from "../components/password";
import Button from "../components/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function TeacherLogin() {
  const teacher_username = "admin";
  const teacher_password = "admin123";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === teacher_username && password === teacher_password) {
      setError("");
      navigate("/TeacherPage");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="container">
      <div className="box">
        <h1>Teacher Login</h1>
        <UsernameField onChange={setUsername} />
        <PasswordField onChange={setPassword} />
        <Button txt={"Login"} myFucntion={handleLogin} />
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}
export default TeacherLogin;
