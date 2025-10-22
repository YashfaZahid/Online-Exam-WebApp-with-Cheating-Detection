import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/button.jsx";
import "./TeacherPage.css";

function CreateTest() {
  const [numQuestion, setNumQuestion] = useState(0);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="box">
        <h2>Create Test</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <h3>Title</h3>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <h3>No. Of Questions</h3>
          <input
            type="number"
            value={numQuestion}
            onChange={(e) => setNumQuestion(Number(e.target.value))}
          />
          <Button
            txt="Generate Form"
            myFucntion={() =>
              navigate("/testform", { state: { numQuestion, title } })
            }
          />
        </form>

        <Button txt="Back" myFucntion={() => navigate("/teacher")} />
      </div>
    </div>
  );
}

export default CreateTest;
