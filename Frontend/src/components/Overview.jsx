import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { pickField } from "./_helpers.jsx";

export default function Overview({ testId }) {
  const [trainingRows, setTrainingRows] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);

  useEffect(() => {
    if (!testId) return;
    fetchOverview();
  }, [testId]);

  async function fetchOverview() {
    // fetch ml-training-data for this test
    const { data, error } = await supabase
      .from("ml-training-data")
      .select("*")
      .eq("test_id", testId);
    if (error) {
      console.error("Error:", error);
      return;
    }
    setTrainingRows(data || []);

    // count unique students who attempted this test
    const studentIds = [...new Set((data || []).map((r) => r.student_id))];
    setStudentsCount(studentIds.length);
  }

  // KPI calculations
  const totalAttempts = trainingRows.length;
  const flagged = trainingRows.filter((r) => {
    const v = pickField(r, "cheating_label", "cheating_label_int", "cheating");
    return v === 1 || v === true || v === "1" || v === "true";
  }).length;
  const flaggedPct = totalAttempts === 0 ? 0 : Math.round((flagged / totalAttempts) * 100);

  // Prepare small trend data (group by time)
  const trend = trainingRows.slice(-20).map((r) => ({
    time: new Date(r.created_at).toLocaleTimeString(),
    total_events: pickField(r, "total_events", "total_events_count") || 0,
    flagged: (pickField(r, "cheating_label", "cheating_label_int", "cheating") === 1) ? 1 : 0,
  }));

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">📊 Test Overview</h2>
          <p className="text-sm text-gray-500 mt-1">High-level summary for this test</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Students Attempted</div>
          <div className="text-2xl font-bold">{studentsCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-sm text-gray-600">Total Attempts</div>
          <div className="text-xl font-semibold">{totalAttempts}</div>
          <div className="text-xs text-gray-500 mt-1">All recorded attempts for the selected test</div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-sm text-gray-600">Flagged Sessions</div>
          <div className="text-xl font-semibold text-red-600">{flagged}</div>
          <div className="text-xs text-gray-500 mt-1">{flaggedPct}% of attempts flagged</div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-sm text-gray-600">Avg Events / Attempt</div>
          <div className="text-xl font-semibold">
            {totalAttempts === 0 ? "0" : Math.round(trainingRows.reduce((a, b) => a + (pickField(b, "total_events", "total_events_count") || 0), 0) / totalAttempts)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Higher = more recorded activity (may indicate suspicious behaviour)</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-2">
        <div className="text-sm text-gray-600 mb-2">Event trend (last attempts)</div>
        {trend.length === 0 ? (
          <div className="text-gray-500 py-12 text-center">No data yet for this test</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip formatter={(v) => [v, "value"]} />
              <Line type="monotone" dataKey="total_events" stroke="#3b82f6" name="Events" strokeWidth={2} />
              <Line type="monotone" dataKey="flagged" stroke="#ef4444" name="Flagged (1=yes)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
