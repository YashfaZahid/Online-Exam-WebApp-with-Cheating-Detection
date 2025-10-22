// api.js
import axios from "axios";

const BASE_URL = "http://localhost:5000";

export async function addTeacher(username, email, password) {
  const res = await fetch(`${BASE_URL}/add-teacher`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  return await res.json();
}

export async function addStudent(username, email, password) {
  const res = await fetch(`${BASE_URL}/add-student`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  return await res.json();
}

export async function addTest(title, teacher_id) {
  const response = await fetch("http://127.0.0.1:5000/add-test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, teacher_id }),
  });
  const data = await response.json();
  return data;
}

export async function addQuestion(test_id, question_text) {
  const res = await fetch(`${BASE_URL}/add-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ test_id, question_text }),
  });
  return await res.json();
}
export async function addAnswer(test_id, question_id, student_id, answer_text) {
  const res = await fetch(`${BASE_URL}/add-answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ test_id, question_id, student_id, answer_text }),
  });
  return await res.json();
}

export const getQuestions = async (testId) => {
  const response = await fetch(`${BASE_URL}/get-questions/${testId}`);
  const data = await response.json();
  return data;
};

export async function getTests() {
  const res = await fetch(`${BASE_URL}/get-tests`);
  return await res.json();
}
export async function addCheatingLog(
  test_id,
  student_id,
  event_type,
  event_details,
  event_duration,
  gaze_direction,
  mouse_movement
) {
  const res = await fetch(`${BASE_URL}/cheating-log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      test_id,
      student_id,
      event_type,
      event_details,
      event_duration,
      gaze_direction,
      mouse_movement,
    }),
  });
  return await res.json();
}
export async function submitTest(student_id, test_id) {
  try {
    const res = await fetch("http://localhost:5000/submit-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id, test_id }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error submitting test:", error);
    return { success: false, error: error.message };
  }
}

export const getReports = async (teacherId) => {
  try {
    const res = await axios.get(`${BASE_URL}/reports/${teacherId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching reports:", err);
    throw err;
  }
};


// Error saving cheating log: TypeError: Failed to fetch
//     at addCheatingLog (api.js:60:21)
//     at saveCheatingLog (TestPage.jsx:34:25)
//     at TestPage.jsx:153:13
//     at @mediapipe_face_mesh.js?v=423d85f3:1861:17
