import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Button from "../components/button.jsx";
import { addTest, addQuestion } from "../api.js";

function Testform() {
  const location = useLocation();
  const { numQuestion, title } = location.state || {
    numQuestion: 0,
    title: "",
  };
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState(Array(numQuestion).fill(""));

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async () => {
    const teacher_id = localStorage.getItem("teacher_id");
    try {
      setError("");
      const res = await addTest(title, teacher_id);

      if (res.success) {
        const test_id = res.id;
        console.log("New Test ID:", test_id);

        for (let i = 0; i < questions.length; i++) {
          await addQuestion(test_id, questions[i]);
        }

        alert("Test added successfully!");
      } else {
        setError("Failed to create test.");
      }
    } catch (err) {
      setError("Failed to upload test. Try again.");
      console.error(err);
    }
  };

  return (
    <div className="container">
      <div className="box">
        <h2>Create Test: {title}</h2>
        <div>
          {questions.map((q, index) => (
            <div key={index}>
              <h3>Question {index + 1}</h3>
              <input
                type="text"
                value={q}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
              />
            </div>
          ))}
          <Button txt={"Submit Test"} myFucntion={handleSubmit} />
        </div>
      </div>
    </div>
  );
}

export default Testform;
