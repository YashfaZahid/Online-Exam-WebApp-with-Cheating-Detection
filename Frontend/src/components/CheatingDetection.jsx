import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { pickField } from "./_helpers.jsx";

export default function CheatingDetection({ testId }) {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    if (!testId) return;
    load();
  }, [testId]);

  async function load() {
    const { data, error } = await supabase
      .from("ml-training-data")
      .select("*")
      .eq("test_id", testId);

    if (error) {
      console.error(error);
      return;
    }
    setRows(data || []);

    // aggregate suspicious event counts
    const agg = { copy: 0, paste: 0, mouse_leave: 0, focus_loss: 0, flagged: 0 };
    (data || []).forEach((r) => {
      agg.copy += Number(pickField(r, "copy_count") || 0);
      agg.paste += Number(pickField(r, "paste_count") || 0);
      agg.mouse_leave += Number(pickField(r, "mouse_leave_count") || 0);
      agg.focus_loss += Number(pickField(r, "focus_loss_count", "focuses_loss_count") || 0);
      const cheated = pickField(r, "cheating_label", "cheating") === 1 || pickField(r, "cheating_label", "cheating") === true;
      if (cheated) agg.flagged += 1;
    });

    setSummary([
      { name: "Copy actions", value: agg.copy },
      { name: "Paste actions", value: agg.paste },
      { name: "Mouse leaves", value: agg.mouse_leave },
      { name: "Focus loss", value: agg.focus_loss },
      { name: "Flagged attempts", value: agg.flagged },
    ]);
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">🔍 Cheating Detection</h3>
        <div className="text-sm text-gray-500">Top suspicious activities</div>
      </div>

      {summary.length === 0 ? (
        <div className="text-gray-500 py-12 text-center">No cheating data yet</div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(v) => [v, "count"]} />
              <Bar dataKey="value" fill="#ef4444" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <strong>Note:</strong> A higher number of copy/paste or frequent mouse leaves suggests suspicious behavior — review these students' session logs to confirm.
      </div>
    </div>
  );
}
