import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { addAnswer, getQuestions } from "../api.js";
import Button from "../components/button.jsx";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { addCheatingLog } from "../api.js";

function TestPage() {
  const blurStartRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { testId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [gaze, setGaze] = useState("Center");

  useEffect(() => {
    (async () => {
      const data = await getQuestions(testId);
      setQuestions(data);
    })();
  }, [testId]);

  const saveCheatingLog = async (eventType, details = "") => {
    const student_id = localStorage.getItem("student_id");

    if (!student_id) {
      console.error("Student ID not found in localStorage!");
      return;
    }

    try {
      const res = await addCheatingLog(testId, student_id, eventType, details);
      if (!res.success) {
        console.error("Failed to log cheating event:", res);
      } else {
        console.log("Cheating log saved:", eventType, details);
      }
    } catch (err) {
      console.error("Error saving cheating log:", err);
    }
  };

useEffect(() => {
  // --- Log focus status only once per session ---
  if (!sessionStorage.getItem("focusLogged")) {
    if (document.hasFocus()) {
      saveCheatingLog("window_focus", "Focused on load");
    } else {
      saveCheatingLog("window_blur", "Not focused on load");
    }
    sessionStorage.setItem("focusLogged", "true");
  }

  // --- Handle blur (window loses focus) ---
  const handleBlur = () => {
    blurStartRef.current = Date.now();
    console.log("Window blurred");
    saveCheatingLog("window_blur", "Window lost focus");
  };

  // --- Handle focus (window regains focus) ---
  const handleFocus = () => {
    if (blurStartRef.current) {
      const duration = Math.floor((Date.now() - blurStartRef.current) / 1000);
      console.log(`Returned after ${duration} seconds`);
      saveCheatingLog("window_focus", `Returned after ${duration} seconds`);
      blurStartRef.current = null;
    }
  };

  // --- Add event listeners ---
  window.addEventListener("blur", handleBlur);
  window.addEventListener("focus", handleFocus);

  // --- Cleanup listeners on unmount ---
  return () => {
    window.removeEventListener("blur", handleBlur);
    window.removeEventListener("focus", handleFocus);
  };
}, []);


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "c") {
        saveCheatingLog("copy", "Ctrl+C used");
      }
      if (e.ctrlKey && e.key === "v") {
        saveCheatingLog("paste", "Ctrl+V used");
      }
    };

    const handleCopy = () => {
      saveCheatingLog("copy", "Right-click copy");
    };
    const handlePaste = () => {
      saveCheatingLog("paste", "Right-click paste");
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("copy", handleCopy);
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("copy", handleCopy);
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  // ------------------- Initial Focus -------------------
  useEffect(() => {
    window.focus();
    if (document.hasFocus()) {
      saveCheatingLog("window_focus", "Focused on load");
    } else {
      saveCheatingLog("window_blur", "Not focused on load");
    }
  }, []);

  // ------------------- MediaPipe FaceMesh (Head Tracking) -------------------
useEffect(() => {
  if (!videoRef.current || !canvasRef.current) return;

  const ctx = canvasRef.current.getContext("2d");

  // refs that persist across frames without causing re-renders
  const lastGazeRef = { current: null };           // stores "Left"/"Right"/"Center"/"Unknown"
  const emaOffsetRef = { current: 0 };             // exponential moving average of offset
  const lastLogTimeRef = { current: 0 };           // unix ms of last saved cheating log

  // tuning parameters (adjust if your camera angle/distance changes)
  const LEFT_THRESHOLD = 0.06;     // offset > LEFT_THRESHOLD => "Left"
  const RIGHT_THRESHOLD = -0.06;   // offset < RIGHT_THRESHOLD => "Right"
  const NEUTRAL_ZONE = 0.03;       // abs(offset) <= NEUTRAL_ZONE => "Center"
  const EMA_ALPHA = 0.25;          // smoothing factor (0 < alpha <= 1). smaller -> smoother
  const LOG_COOLDOWN_MS = 2000;    // minimum ms between logs for the same direction

  let camera = null;
  const faceMesh = new FaceMesh({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  // helper to decide gaze based on smoothed offset and thresholds
  function computeGazeFromOffset(smoothedOffset) {
    if (smoothedOffset > LEFT_THRESHOLD) return "Left";
    if (smoothedOffset < RIGHT_THRESHOLD) return "Right";
    if (Math.abs(smoothedOffset) <= NEUTRAL_ZONE) return "Center";
    return "Center";
  }

  // log to backend only when needed (and rate-limited)
  function maybeLogGaze(newGaze) {
    const now = Date.now();

    // only log on change
    if (newGaze === lastGazeRef.current) return;

    // don't spam logs: ensure a small cooldown
    if (now - lastLogTimeRef.current < LOG_COOLDOWN_MS) {
      // allow transition to center without logging; if required to log center, remove this
      lastGazeRef.current = newGaze;
      setGaze(newGaze);
      return;
    }

    // update last log time and last gaze
    lastLogTimeRef.current = now;
    lastGazeRef.current = newGaze;
    setGaze(newGaze);

    // Only record Left/Right as cheating events (not Center)
    if (newGaze === "Left" || newGaze === "Right") {
      // saveCheatingLog(testId, student_id, eventType, details)
      const student_id = localStorage.getItem("student_id");
      if (student_id) {
        // send a compact detail so DB isn't spammed with huge strings
        saveCheatingLog("gaze", `${newGaze}`);
      }
    }
  }

  faceMesh.onResults((results) => {
    try {
      ctx.save();
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      // If no face detected, treat as Center/Unknown depending on preference
      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        // If face lost, set to "Center" or "Unknown" — we choose Center to avoid false positives.
        maybeLogGaze("Center");
        ctx.restore();
        return;
      }

      const landmarks = results.multiFaceLandmarks[0];
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];
      const noseTip = landmarks[1];

      // compute normalized horizontal offset: how far eyes center is from nose center
      const eyeCenterX = (leftEye.x + rightEye.x) / 2;
      const offset = eyeCenterX - noseTip.x; // can be negative or positive

      // smooth offset with EMA to avoid flicker
      const prev = emaOffsetRef.current;
      const smoothed = prev + EMA_ALPHA * (offset - prev);
      emaOffsetRef.current = smoothed;

      // compute gaze from smoothed offset
      const detectedGaze = computeGazeFromOffset(smoothed);

      // only update/log on change (this will also update UI through state)
      maybeLogGaze(detectedGaze);
    } catch (err) {
      // don't crash the whole loop if one frame errors
      console.error("FaceMesh onResults error:", err);
    } finally {
      ctx.restore();
    }
  });

  // Start camera (only once)
  if (videoRef.current) {
    camera = new Camera(videoRef.current, {
      onFrame: async () => {
        try {
          await faceMesh.send({ image: videoRef.current });
        } catch (err) {
          // ignore transient errors from MediaPipe send
          // but log rare ones to help debugging
          // console.warn("faceMesh.send error:", err);
        }
      },
      width: 640,   // increase resolution for more stable landmarks; can tune down if perf issues
      height: 480,
    });
    camera.start();
  }

  // Cleanup
  return () => {
    try {
      if (camera) camera.stop();
      // MediaPipe objects typically do not expose close in CDN builds,
      // but if they do in your version call faceMesh.close() here.
    } catch (err) {
      console.warn("Error stopping camera/faceMesh:", err);
    }
  };
}, [testId]); // note: uses saveCheatingLog and setGaze from closure (ensure stable or wrapped in refs)


  // ------------------- Answer Handlers -------------------
  const handleChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async () => {
    const student_id = localStorage.getItem("student_id");

    try {
      // loop through all answers
      for (const [question_id, answer_text] of Object.entries(answers)) {
        const res = await addAnswer(
          testId,
          question_id,
          student_id,
          answer_text
        );

        if (!res.success) {
          console.error(`Failed to save answer for question ${question_id}`);
        }
      }

      alert("Test submitted successfully!");
    } catch (err) {
      console.error("Error submitting answers:", err);
      alert("Failed to submit answers. Try again.");
    }
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
              style={{
                fontSize: "16px",
                padding: "8px",
                outline: "none",
              }}
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
        {/* Hidden video feed */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "200px",
            height: "150px",
            opacity: 0,
            position: "absolute",
          }}
        />

        {/* Canvas feed */}
        <canvas
          ref={canvasRef}
          width={200}
          height={150}
          style={{ width: "100%", height: "100%" }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "5px",
            right: "10px",
            background: "rgba(0,0,0,0.6)",
            color: "white",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          {gaze}
        </div>
      </div>
    </div>
  );
}

export default TestPage;
