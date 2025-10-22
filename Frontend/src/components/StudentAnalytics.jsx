import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { pickField } from "./_helpers.jsx";

export default function StudentAnalytics({ testId }) {
  const [rows, setRows] = useState([]);
  const [studentsMap, setStudentsMap] = useState({});
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    if (!testId) return;
    load();
  }, [testId]);

  async function load() {
    // fetch ml-training-data rows for test
    const { data, error } = await supabase
      .from("ml-training-data")
      .select("*")
      .eq("test_id", testId);
    if (error) {
      console.error(error);
      return;
    }
    setRows(data || []);

    // fetch student info for unique IDs
    const studentIds = [...new Set((data || []).map((r) => r.student_id).filter(Boolean))];
    if (studentIds.length > 0) {
      const { data: students } = await supabase.from("Students").select("id, username").in("id", studentIds);
      const map = {};
      (students || []).forEach((s) => (map[s.id] = s));
      setStudentsMap(map);
    } else {
      setStudentsMap({});
    }
    setSelectedStudentId(null);
  }

  // prepare chart data per student (aggregate if multiple rows per student)
  const agg = {};
  rows.forEach((r) => {
    const sid = r.student_id;
    if (!agg[sid]) agg[sid] = { student_id: sid, attempts: 0, total_events: 0, focus_loss: 0, copy_count: 0, paste_count: 0, flagged: 0 };
    agg[sid].attempts += 1;
    agg[sid].total_events += pickField(r, "total_events", "total_events_count") || 0;
    agg[sid].focus_loss += pickField(r, "focus_loss_count", "focuses_loss_count", "focus_loss") || 0;
    agg[sid].copy_count += pickField(r, "copy_count") || 0;
    agg[sid].paste_count += pickField(r, "paste_count") || 0;
    const cheated = pickField(r, "cheating_label", "cheating") === 1 || pickField(r, "cheating_label", "cheating") === true;
    if (cheated) agg[sid].flagged += 1;
  });

  const studentList = Object.values(agg).sort((a, b) => b.total_events - a.total_events);

  // selected student details
  const selectedStudent = selectedStudentId ? studentList.find((s) => String(s.student_id) === String(selectedStudentId)) : null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">👨‍🎓 Student Analytics</h3>
        <div className="text-sm text-gray-500">Click a student to see details</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2">
          <div className="h-64 bg-white">
            {studentList.length === 0 ? (
              <div className="text-gray-500 py-16 text-center">No students yet for this test</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentList}>
                  <XAxis dataKey="student_id" tickFormatter={(id) => (studentsMap[id]?.username ?? `#${id}`)} />
                  <YAxis />
                  <Tooltip formatter={(v, name) => [v, name]} labelFormatter={(l) => `Student: ${studentsMap[l]?.username ?? l}`} />
                  <Bar dataKey="total_events" name="Events" fill="#3b82f6" />
                  <Bar dataKey="flagged" name="Flagged attempts" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">Students (sorted by activity)</div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {studentList.map((s) => (
              <button
                key={s.student_id}
                onClick={() => setSelectedStudentId(String(s.student_id))}
                className={`w-full text-left px-3 py-2 rounded-md ${selectedStudentId === String(s.student_id) ? "bg-blue-50" : "hover:bg-gray-100"}`}
              >
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm font-medium">{studentsMap[s.student_id]?.username ?? `Student ${s.student_id}`}</div>
                    <div className="text-xs text-gray-500">{s.attempts} attempt(s)</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{s.total_events}</div>
                    <div className="text-xs text-gray-500">{s.flagged} flagged</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedStudent ? (
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold mb-2">{studentsMap[selectedStudent.student_id]?.username ?? `Student ${selectedStudent.student_id}`}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-xs text-gray-500">Total events recorded</div>
              <div className="text-xl font-bold">{selectedStudent.total_events}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-xs text-gray-500">Focus loss (sum)</div>
              <div className="text-xl font-bold">{selectedStudent.focus_loss}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-xs text-gray-500">Copy actions</div>
              <div className="text-xl font-bold">{selectedStudent.copy_count}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-xs text-gray-500">Flagged attempts</div>
              <div className="text-xl font-bold text-red-600">{selectedStudent.flagged}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500 text-sm">Click any student on the right to view their performance summary.</div>
      )}
    </div>
  );
}
