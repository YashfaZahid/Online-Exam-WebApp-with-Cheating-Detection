import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

export default function SessionDetails({ testId }) {
  const [logs, setLogs] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");

  useEffect(() => {
    if (!testId) return;
    load();
  }, [testId]);

  async function load() {
    // logs
    const { data: logsData, error: logsErr } = await supabase
      .from("Cheating_Logs")
      .select("*")
      .eq("test_id", testId)
      .order("created_at", { ascending: true })
      .limit(500);
    if (logsErr) console.error(logsErr);
    else setLogs(logsData || []);

    // students who appear in logs
    const sids = [...new Set((logsData || []).map((r) => r.student_id).filter(Boolean))];
    if (sids.length > 0) {
      const { data: studentRows } = await supabase.from("Students").select("id, username").in("id", sids);
      setStudents(studentRows || []);
    } else {
      setStudents([]);
    }
  }

  const visibleLogs = selectedStudent ? logs.filter((l) => String(l.student_id) === String(selectedStudent)) : logs;

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">📝 Session Details</h3>
        <div className="text-sm text-gray-500">Raw event logs (select a student to filter)</div>
      </div>

      <div className="flex gap-4 mb-4">
        <select
          className="border p-2 rounded"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">All students</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.username}</option>
          ))}
        </select>
      </div>

      <div className="overflow-auto max-h-80 border rounded">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-xs text-gray-600">Time</th>
              <th className="p-2 text-xs text-gray-600">Student</th>
              <th className="p-2 text-xs text-gray-600">Event</th>
              <th className="p-2 text-xs text-gray-600">Details</th>
            </tr>
          </thead>
          <tbody>
            {visibleLogs.map((l) => (
              <tr key={l.id} className="border-b hover:bg-gray-50">
                <td className="p-2 text-sm">{new Date(l.created_at).toLocaleString()}</td>
                <td className="p-2 text-sm">{l.student_id}</td>
                <td className="p-2 text-sm">{l.event_type}</td>
                <td className="p-2 text-sm">{typeof l.event_details === "object" ? JSON.stringify(l.event_details) : l.event_details}</td>
              </tr>
            ))}
            {visibleLogs.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">No logs found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
