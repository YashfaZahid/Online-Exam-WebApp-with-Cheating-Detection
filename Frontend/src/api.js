// api.js
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
};

export async function addQuestion(test_id, question_text) {
  const res = await fetch(`${BASE_URL}/add-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ test_id, question_text }),
  });
  return await res.json();
}
export async function addAnswer(test_id, question_text) {
  const res = await fetch(`${BASE_URL}/add-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ test_id, question_text }),
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

