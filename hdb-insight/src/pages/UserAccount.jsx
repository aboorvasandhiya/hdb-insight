import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaEdit, FaSave, FaTimes } from "react-icons/fa";

export default function UserAccount() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [userInfo, setUserInfo] = useState({
    username: localStorage.getItem("username") || "",
    email: "",
    phone: "",
    joinDate: "",
    totalTransactions: "-", // placeholder (wire later if you track searches)
  });

  // Load current user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    (async () => {
      try {
        setError("");
        const res = await fetch("http://localhost:3001/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load profile");
          return;
        }
        setUserInfo((prev) => ({
          ...prev,
          username: data.username || prev.username,
          email: data.email ?? "",
          phone: data.phone ?? "",
          joinDate: data.createdAt
            ? new Date(data.createdAt).toLocaleString("en-SG", {
                month: "long",
                year: "numeric",
              })
            : "",
        }));
      } catch {
        setError("Network error");
      }
    })();
  }, [navigate]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setError("");
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");
    try {
      setSaving(true);
      setError("");
      const res = await fetch("http://localhost:3001/api/account", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: userInfo.username,
          email: userInfo.email,
          phone: userInfo.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      // reflect updated username in localStorage (and header)
      if (data.username) localStorage.setItem("username", data.username);
      setIsEditing(false);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) =>
    setUserInfo((prev) => ({ ...prev, [field]: value }));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="flex justify-between items-center px-8 py-5 bg-white border-b shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">HDB Resale Market Analyzer</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center space-x-2 text-red-600 font-medium hover:text-red-700 transition"
        >
          <FaUserCircle className="text-xl" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="flex space-x-6 border-b bg-white px-8">
        <button
          onClick={() => navigate("/data")}
          className="py-3 border-b-2 border-transparent text-gray-400 hover:text-red-500 transition"
        >
          Data Management
        </button>
        <button
          onClick={() => navigate("/insights")}
          className="py-3 border-b-2 border-transparent text-gray-400 hover:text-red-500 transition"
        >
          Insights
        </button>
      </div>

      <div className="p-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">My Account</h2>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <FaEdit className="text-sm" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-60"
                >
                  <FaSave className="text-sm" />
                  <span>{saving ? "Saving..." : "Save"}</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  <FaTimes className="text-sm" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-4">{error}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                Profile Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={userInfo.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{userInfo.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{userInfo.email || "—"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={userInfo.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{userInfo.phone || "—"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Member Since
                </label>
                <p className="text-gray-800 font-medium">{userInfo.joinDate || "—"}</p>
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                Account Statistics
              </h3>

              <div className="bg-gray-50 rounded-lg p-5 grid grid-cols-2 gap-5">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-500">
                    {userInfo.totalTransactions}
                  </p>
                  <p className="text-sm text-gray-600">Total Searches</p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={logout}
                  className="w-full py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
