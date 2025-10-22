import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import Overview from "../components/Overview";
import StudentAnalytics from "../components/StudentAnalytics";
import CheatingDetection from "../components/CheatingDetection";
import SessionDetails from "../components/SessionDetails";

export default function TeacherDashboard() {
  const [teacherId, setTeacherId] = useState(null);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("teacher_id");
    if (!id) {
      // fallback: you can show a message or redirect to login
      console.warn("teacher_id not found in localStorage");
    }
    setTeacherId(id ? Number(id) : null);
  }, []);

  useEffect(() => {
    if (teacherId) fetchTestsForTeacher(teacherId);
  }, [teacherId]);

  async function fetchTestsForTeacher(tid) {
    const { data, error } = await supabase
      .from("Tests")
      .select("*")
      .eq("teacher_id", tid)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching tests:", error);
      return;
    }
    setTests(data || []);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4">
      <div className="w-full max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold">Exam Monitoring Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, yashu 👋</p>
        </header>

        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="bg-white shadow rounded-2xl p-6 w-64 text-center">
            <div className="text-sm text-gray-500">Total Tests</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {tests.length}
            </div>
          </div>

          <div className="bg-white shadow rounded-2xl p-4 flex items-center gap-4">
            <label className="text-sm text-gray-600">Select Test</label>
            <select
              className="border rounded-lg p-2 shadow-sm"
              value={selectedTest?.id ?? ""}
              onChange={(e) => {
                const id = e.target.value;
                const test = tests.find((t) => String(t.id) === String(id));
                setSelectedTest(test || null);
              }}
            >
              <option value="">-- Choose a Test --</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} · {new Date(t.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!selectedTest ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-600">
            Select a test above to load analytics and reports for that test.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <Overview testId={selectedTest.id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <StudentAnalytics testId={selectedTest.id} />
              <CheatingDetection testId={selectedTest.id} />
            </div>
            <SessionDetails testId={selectedTest.id} />
          </div>
        )}
      </div>
    </div>
  );
}
