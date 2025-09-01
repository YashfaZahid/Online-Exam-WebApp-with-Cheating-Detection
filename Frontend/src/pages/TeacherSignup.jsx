import React, { useState } from "react";
import UsernameField from "../components/username";
import PasswordField from "../components/password";
import EmailField from "../components/email";
import Button from "../components/button";
import { useNavigate } from "react-router-dom";
import { addTeacher } from "../api";

function TeacherSignup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (username.length > 5 && password.length > 5) {
      try {
        setError("");
        const res = await addTeacher(username, email, password);
        navigate("/TeacherLogin");
      } catch (err) {
        setError("Failed to sign up. Try again.");
        console.error(err);
      }
    } else {
      setError(
        "Length of username and password must be greater than 5 characters"
      );
    }
  };

  return (
    <div className="container">
      <div className="box">
        <h1>Teacher SignUp</h1>

        <form onSubmit={handleSignup}>
          <UsernameField onChange={setUsername} />
          <PasswordField onChange={setPassword} />
          <EmailField onChange={setEmail} />
          <Button txt={"SignUp"} type="submit" />
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

export default TeacherSignup;
