import React from "react";
import UsernameField from "../components/username";
import PasswordField from "../components/password";
import Button from "../components/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function StudentLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const respone = await fetch("http://127.0.0.1:5000/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await respone.json();
      
      if (data.success) {
        localStorage.setItem("student_id", data.id);
        setError("");
        alert("Login successful!");
        navigate("/StudentPage");
      } else {
        setError(data.message || "Invalid username or password");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="box">
        <h1>Student Login</h1>
        <UsernameField onChange={setUsername} />
        <PasswordField onChange={setPassword} />
        <Button txt={"Login"} myFucntion={handleLogin} />
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}
export default StudentLogin;
