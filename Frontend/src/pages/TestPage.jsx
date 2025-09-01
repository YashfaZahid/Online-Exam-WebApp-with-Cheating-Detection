import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Webcam from "react-webcam";
import { getQuestions } from "../api.js";
import Button from "../components/button.jsx";
import * as faceMesh from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";

function TestPage() {
  const blurStartRef = useRef(null);
  const webcamRef = useRef(null);
  const { testId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [camera, setCamera] = useState(null);

  // ------------------- Fetch Questions -------------------
  useEffect(() => {
    (async () => {
      const data = await getQuestions(testId);
      setQuestions(data);
    })();
  }, [testId]);

  // ------------------- Helper: Save Cheating Log -------------------
  const saveCheatingLog = (eventType, details = "") => {
    fetch("http://127.0.0.1:5000/cheating-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: 1, // TODO: replace with logged-in student ID
        test_id: testId,
        event_type: eventType,
        event_details: details,
        timestamp: new Date().toISOString(),
      }),
    }).catch((err) => console.error("Error logging:", err));
  };

  // ------------------- Window Blur/Focus -------------------
  useEffect(() => {
    const handleblur = () => {
      blurStartRef.current = Date.now();
      saveCheatingLog("window_blur", "Window lost focus");
    };
    const handlefocus = () => {
      if (blurStartRef.current) {
        const duration = Math.floor((Date.now() - blurStartRef.current) / 1000);
        saveCheatingLog("window_focus", `Returned after ${duration} seconds`);
        blurStartRef.current = null;
      }
    };
    window.addEventListener("blur", handleblur);
    window.addEventListener("focus", handlefocus);
    return () => {
      window.removeEventListener("blur", handleblur);
      window.removeEventListener("focus", handlefocus);
    };
  }, []);

  // ------------------- Copy/Paste Detection -------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "c") {
        saveCheatingLog("copy", "Ctrl+C used");
      }
      if (e.ctrlKey && e.key === "v") {
        saveCheatingLog("paste", "Ctrl+V used");
      }
    };
    const handleCopy = () => saveCheatingLog("copy", "Right-click copy");
    const handlePaste = () => saveCheatingLog("paste", "Right-click paste");

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("copy", handleCopy);
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("copy", handleCopy);
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  // ------------------- Gaze Detection with Mediapipe -------------------
  useEffect(() => {
    let lastDirection = "Center";
    let startTime = Date.now();

    const face = new faceMesh.FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });
    face.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    face.onResults((results) => {
      if (!results.multiFaceLandmarks?.length) return;

      const landmarks = results.multiFaceLandmarks[0];
      const leftEye = [landmarks[33], landmarks[133]];
      const leftIris = [landmarks[468], landmarks[469], landmarks[470], landmarks[471]];

      const irisX = leftIris.reduce((sum, p) => sum + p.x, 0) / 4;
      const irisY = leftIris.reduce((sum, p) => sum + p.y, 0) / 4;

      const horizRatio = (irisX - leftEye[0].x) / (leftEye[1].x - leftEye[0].x);
      let direction = "Center";
      if (horizRatio < 0.35) direction = "Left";
      else if (horizRatio > 0.65) direction = "Right";
      else if (irisY < leftEye[0].y - 0.02) direction = "Up";
      else if (irisY > leftEye[0].y + 0.02) direction = "Down";

      // If direction changed, log with duration
      if (direction !== lastDirection) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        saveCheatingLog("gaze", `${lastDirection} for ${duration} sec`);
        lastDirection = direction;
        startTime = Date.now();
      }
    });

    if (webcamRef.current) {
      const camInstance = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await face.send({ image: webcamRef.current.video });
        },
        width: 200,
        height: 150,
      });
      camInstance.start();
      setCamera(camInstance);
    }

    return () => {
      if (camera) camera.stop();
    };
  }, []);

  // ------------------- Answer Handlers -------------------
  const handleChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = () => {
    console.log("Submitted answers:", answers);
    // TODO: save answers in database
  };

  // ------------------- UI -------------------
  return (
    <div className="container" style={{ position: "relative" }}>
      {/* Questions Section */}
      <div className="test-box">
        {questions.map((q) => (
          <div key={q.id} className="question-box">
            <h2>{q.question_text}</h2>
            <textarea
              rows={10}
              cols={60}
              placeholder="Write your answer here..."
              value={answers[q.id] || ""}
              onChange={(e) => handleChange(q.id, e.target.value)}
            />
          </div>
        ))}
        <Button txt={"Submit Test"} myFucntion={handleSubmit} />
      </div>

      {/* Camera in top-right corner */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          width: "200px",
          height: "150px",
          border: "2px solid #333",
          borderRadius: "8px",
          overflow: "hidden",
          background: "#000",
        }}
      >
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored={false}
          videoConstraints={{ facingMode: "user" }}
          style={{ width: "100%", height: "100%", transform: "scaleX(-1)" }}
        />
      </div>
    </div>
  );
}

export default TestPage;
