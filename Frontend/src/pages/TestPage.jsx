import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { addAnswer, getQuestions } from "../api.js";
import Button from "../components/button.jsx";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { addCheatingLog, submitTest } from "../api.js";

function TestPage() {
  const blurStartRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { testId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [gaze, setGaze] = useState("Center");

  // Fetch questions on mount
  useEffect(() => {
    (async () => {
      const data = await getQuestions(testId);
      setQuestions(data);
    })();
  }, [testId]);

  // --- Helper: Save logs ---
  const saveCheatingLog = async (
    eventType,
    details = "",
    event_duration = null,
    gaze_direction = null,
    mouse_movement = null
  ) => {
    const student_id = localStorage.getItem("student_id");
    if (!student_id) {
      console.error("Student ID not found in localStorage!");
      return;
    }

    try {
      const res = await addCheatingLog(
        testId,
        student_id,
        eventType,
        details,
        event_duration,
        gaze_direction,
        mouse_movement
      );
      if (!res.success) {
        console.error("Failed to log cheating event:", res);
      } else {
        console.log("Cheating log saved:", eventType, details);
      }
    } catch (err) {
      console.error("Error saving cheating log:", err);
    }
  };

  // --- Focus tracking (blur removed, focus duration kept) ---
  useEffect(() => {
    const handleBlurStart = () => {
      blurStartRef.current = Date.now();
    };

    const handleFocus = () => {
      if (blurStartRef.current) {
        const duration = Math.floor((Date.now() - blurStartRef.current) / 1000);
        console.log(`Returned after ${duration} seconds`);
        saveCheatingLog(
          "window_focus",
          `Returned after ${duration} seconds`,
          duration
        );
        blurStartRef.current = null;
      }
    };

    window.addEventListener("blur", handleBlurStart);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlurStart);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // --- Copy/Paste Detection ---
  useEffect(() => {
    let lastPasteTime = 0;

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "c") saveCheatingLog("copy", "Ctrl+C used");
      if (e.ctrlKey && e.key === "v") {
        const now = Date.now();
        // Prevent double logging if paste event also triggers soon after
        if (now - lastPasteTime > 500) {
          saveCheatingLog("paste", "Ctrl+V used");
        }
        lastPasteTime = now;
      }
    };

    const handleCopy = (e) => {
      // Trigger only if it's not from keyboard
      if (!e.clipboardData) saveCheatingLog("copy", "Right-click copy");
    };

    const handlePaste = (e) => {
      const now = Date.now();
      // Skip if it’s already logged by Ctrl+V recently
      if (now - lastPasteTime > 500) {
        saveCheatingLog("paste", "Right-click paste");
      }
      lastPasteTime = now;
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

  // --- Mouse Movement Detection ---
  useEffect(() => {
    const handleMouseLeave = () => {
      saveCheatingLog(
        "mouse_leave",
        "Mouse left the test window",
        null,
        null,
        "left"
      );
    };

    const handleMouseEnter = () => {
      saveCheatingLog(
        "mouse_enter",
        "Mouse returned to the test window",
        null,
        null,
        "entered"
      );
    };

    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  // --- Initial Focus on Page Load ---
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
    const lastGazeRef = { current: null };
    const emaOffsetRef = { current: 0 };
    const lastLogTimeRef = { current: 0 };
    const gazeStartTimeRef = { current: null };

    const LEFT_THRESHOLD = 0.04;
    const RIGHT_THRESHOLD = -0.04;
    const NEUTRAL_ZONE = 0.03;
    const EMA_ALPHA = 0.25;
    const LOG_COOLDOWN_MS = 2000;

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

    function computeGazeFromOffset(smoothedOffset) {
      if (smoothedOffset > LEFT_THRESHOLD) return "Left";
      if (smoothedOffset < RIGHT_THRESHOLD) return "Right";
      if (Math.abs(smoothedOffset) <= NEUTRAL_ZONE) return "Center";
      return "Center";
    }

    function maybeLogGaze(newGaze) {
      const now = Date.now();

      if (newGaze !== lastGazeRef.current) {
        // Calculate gaze duration when returning to center
        if (
          (lastGazeRef.current === "Left" || lastGazeRef.current === "Right") &&
          newGaze === "Center" &&
          gazeStartTimeRef.current
        ) {
          const durationSec = Math.floor(
            (now - gazeStartTimeRef.current) / 1000
          );
          console.log(
            `👁️ Gaze ${lastGazeRef.current} lasted ${durationSec} seconds`
          );

          saveCheatingLog(
            "gaze_return_center",
            `Looked ${lastGazeRef.current} for ${durationSec} sec`,
            durationSec,
            lastGazeRef.current
          );
          gazeStartTimeRef.current = null;
        }

        // Start new gaze timing
        if (newGaze === "Left" || newGaze === "Right") {
          gazeStartTimeRef.current = now;
        }

        lastGazeRef.current = newGaze;
        setGaze(newGaze);
      }

      // Throttle excessive logs
      if (now - lastLogTimeRef.current < LOG_COOLDOWN_MS) return;
      lastLogTimeRef.current = now;
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

        if (
          !results.multiFaceLandmarks ||
          results.multiFaceLandmarks.length === 0
        ) {
          maybeLogGaze("Center");
          ctx.restore();
          return;
        }

        const landmarks = results.multiFaceLandmarks[0];
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        const noseTip = landmarks[1];

        const eyeCenterX = (leftEye.x + rightEye.x) / 2;
        const offset = eyeCenterX - noseTip.x;
        const prev = emaOffsetRef.current;
        const smoothed = prev + EMA_ALPHA * (offset - prev);
        emaOffsetRef.current = smoothed;

        const detectedGaze = computeGazeFromOffset(smoothed);
        maybeLogGaze(detectedGaze);
      } catch (err) {
        console.error("FaceMesh onResults error:", err);
      } finally {
        ctx.restore();
      }
    });

    if (videoRef.current) {
      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          try {
            await faceMesh.send({ image: videoRef.current });
          } catch {}
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

    return () => {
      try {
        if (camera) camera.stop();
      } catch (err) {
        console.warn("Error stopping camera/faceMesh:", err);
      }
    };
  }, [testId]);

  // --- Answer Handling ---
  const handleChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async () => {
    const student_id = localStorage.getItem("student_id");

    try {
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

      const summaryRes = await submitTest(student_id, testId);
      console.log("ML summary result:", summaryRes);

      alert("Test submitted successfully!");
    } catch (err) {
      console.error("Error submitting answers:", err);
      alert("Failed to submit answers. Try again.");
    }
  };

  // --- UI ---
  return (
    <div className="container" style={{ position: "relative" }}>
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

      {/* Camera feed in corner */}
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
