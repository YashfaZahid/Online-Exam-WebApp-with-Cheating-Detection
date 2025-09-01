import React from "react";
import "./TeacherPage.css";
import Button from "../components/button.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function TeacherPage() {
  const [numQuestion, setNumQuestion] = useState(0);
  const [title, setTitle] = useState("");
  const [view, setView] = useState("dashboard");
  const navigate = useNavigate();
  return (
    <div className="container">
      <div className="box">
        <h1>Teacher Dashboard</h1>
        {view === "dashboard" && (
          <>
            <Button
              txt={"See Available Tests"}
              myFucntion={() => setView("tests")}
            />
            <Button txt={"Create Test"} myFucntion={() => setView("create")} />{" "}
          </>
        )}
        {view === "create" && (
          <div>
            <h2>Create Test</h2>
            <form action="" onSubmit={(e) => e.preventDefault()}>
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
                txt={"Generate Form"}
                myFucntion={() => {
                  navigate("/Testform", { state: { numQuestion, title } });
                  
                }}
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
export default TeacherPage;
