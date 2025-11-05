import React, { useEffect, useState } from "react";
import { FaUserCircle, FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3001";

export default function AdminInsights() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("Insights");

  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("pending"); // pending | approved | rejected
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "Admin";

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const url = `${API}/api/admin/insights?status=${encodeURIComponent(
        status
      )}&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Load failed (${res.status})`);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(String(e.message || e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]); // load when status tab changes

  const handleSearch = async (e) => {
    e.preventDefault();
    load();
  };

  function useLogout() {
    const navigate = useNavigate();
    return () => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      navigate("/", { replace: true }); // back to Login
    };
  }

  const moderate = async (id, next) => {
    try {
      const res = await fetch(`${API}/api/admin/insights/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Action failed");
        return;
      }
      // refresh list
      load();
    } catch {
      alert("Network error");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this insight?")) return;
    try {
      const res = await fetch(`${API}/api/admin/insights/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Delete failed");
        return;
      }
      load();
    } catch {
      alert("Network error");
    }
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-SG") : "";

  const logout = useLogout();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">HDB Resale Market Analyzer</h1>
        <button
        onClick={logout}
        className="flex items-center space-x-2 text-red-600 font-medium hover:text-red-700 transition"
        title="Logout"
        >
          <FaUserCircle className="text-xl" />
          <span>Logged in as: Admin</span>
        </button>
      </div>

      {/* Top tabs */}
      <div className="flex space-x-6 border-b bg-white px-6">
        <button
          onClick={() => {
            setSelectedTab("Dashboard");
            navigate("/admin-dashboard");
          }}
          className={`py-2 border-b-2 ${
            selectedTab === "Dashboard"
              ? "border-red-400 text-red-500 font-medium"
              : "border-transparent text-gray-400"
          }`}
        >
          Dashboard
        </button>

        <button
          onClick={() => {
            setSelectedTab("Data Management");
            navigate("/admin-data");
          }}
          className={`py-2 border-b-2 ${
            selectedTab === "Data Management"
              ? "border-red-400 text-red-500 font-medium"
              : "border-transparent text-gray-400"
          }`}
        >
          Data Management
        </button>

        <button
          onClick={() => {
            setSelectedTab("Insights");
            navigate("/admin-insights");
          }}
          className={`py-2 border-b-2 ${
            selectedTab === "Insights"
              ? "border-red-400 text-red-500 font-medium"
              : "border-transparent text-gray-400"
          }`}
        >
          Insights
        </button>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Insights Moderation</h3>

            <div className="flex items-center gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder='Search town or comment…'
                  className="w-64 border rounded-md px-3 py-2 text-sm bg-gray-50"
                />
                <button className="px-3 py-2 text-sm bg-gray-800 text-white rounded-md">
                  Search
                </button>
              </form>
            </div>
          </div>

          {err && (
            <div className="mb-4 text-sm text-red-600">{err}</div>
          )}

          <div className="space-y-4">
            {loading && <div className="text-gray-500">Loading…</div>}

            {!loading &&
              rows.map((r) => (
                <div key={r._id} className="bg-gray-50 shadow-sm p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">Town: {r.town}</p>
                      <p className="text-sm text-gray-500">
                        By: {r.username} • Date: {fmtDate(r.date || r.createdAt)} • Rating: {r.rating ?? "-"}
                      </p>
                      <p className="mt-1 text-gray-700">{r.comment}</p>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      <span className={
                        r.status === "pending" ? "text-amber-600 text-sm" :
                        r.status === "approved" ? "text-green-600 text-sm" :
                        "text-red-600 text-sm"
                      }>
                        {r.status}
                      </span>
                      <div className="flex gap-2">
                        {r.status !== "approved" && (
                          <button
                            onClick={() => moderate(r._id, "approved")}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            <FaCheck className="text-xs" />
                            Approve
                          </button>
                        )}
                        {r.status !== "rejected" && (
                          <button
                            onClick={() => moderate(r._id, "rejected")}
                            className="flex items-center gap-1 px-3 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm"
                          >
                            <FaTimes className="text-xs" />
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => remove(r._id)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                          <FaTrash className="text-xs" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {!loading && rows.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No records</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
