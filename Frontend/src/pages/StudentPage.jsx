import React, { useEffect } from "react";
import "./TeacherPage.css";
import Button from "../components/button.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTests, getQuestions } from "../api.js";

function StudentPage() {
  const [view, setView] = useState("dashboard");
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    if (view === "tests") {
      (async () => {
        const data = await getTests();
        setTests(data);
      })();
    }
  }, [view]);

  const handleTestClick = async (testId) => {
    console.log("Clicked test:", testId);
    navigate(`/test/${testId}`);
    // later: fetch questions and navigate to test page
  };

  return (
    <div className="container">
      <div className="box">
        <h1>Student Dashboard</h1>
        {view === "dashboard" && (
          <>
            <Button txt={"Take Test"} myFucntion={() => setView("tests")} />
            <Button
              txt={"MyProfile"}
              myFucntion={() => setView("profile")}
            />{" "}
          </>
        )}
        {view === "tests" && (
          <div>
            <h2>Available Tests</h2>
            {tests.length > 0 ? (
              tests.map((test) => (
                <Button
                  key={test.id}
                  txt={test.title}
                  myFucntion={() => handleTestClick(test.id)}
                ></Button>
              ))
            ) : (
              <p>No tests available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentPage;
