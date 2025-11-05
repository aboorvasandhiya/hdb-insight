import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaSearch } from "react-icons/fa";

export default function DataManagement() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("Data Management");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">HDB Resale Market Analyzer</h1>
        <button
          onClick={() => navigate("/account")}
          className="flex items-center space-x-2 text-red-600 font-medium hover:text-red-700 transition"
        >
          <FaUserCircle className="text-xl" />
          <span>Logged in as: {localStorage.getItem("username") || "Guest"}</span>
        </button>
      </div>
      
      <div className="flex space-x-6 border-b bg-white px-6">
        <button
          onClick={() => {
            setSelectedTab("Dashboard");
            navigate("/dashboard");
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
            navigate("/data");
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
            navigate("/insights");
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

      <div className="p-6">

        <div className="bg-[#f0f0ec] mb-6 p-4 rounded-md">
          <div className="flex items-center bg-white rounded-md px-4 py-2 border border-gray-200">
            <FaSearch className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search by Transaction ID"
              className="flex-1 outline-none bg-transparent text-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-700 border-b">
                <th className="py-3 px-6 font-semibold">Transaction ID</th>
                <th className="py-3 px-6 font-semibold">Month</th>
                <th className="py-3 px-6 font-semibold">Town</th>
                <th className="py-3 px-6 font-semibold">Price</th>
                <th className="py-3 px-6 font-semibold">Floor Area</th>
                <th className="py-3 px-6 font-semibold">Price per sqm</th>
                <th className="py-3 px-6 font-semibold">Floor Range</th>
                <th className="py-3 px-6 font-semibold">Flat Type</th>
                <th className="py-3 px-6 font-semibold">Lease left</th>
              </tr>
            </thead>

            <tbody>
              {[...Array(10)].map((_, i) => (
                <tr
                  key={i}
                  className={`${
                    i % 2 === 0 ? "bg-[#f8faee]" : "bg-white"
                  } border-b`}
                >
                  <td className="py-2 px-6 text-gray-600">—</td>
                  <td className="py-2 px-6 text-gray-600">—</td>
                  <td className="py-2 px-6 text-gray-600">—</td>
                  <td className="py-2 px-6 text-gray-600">—</td>
                  <td className="py-2 px-6 text-gray-600">—</td>
                  <td className="py-2 px-6 text-gray-600">—</td>
                  <td className="py-2 px-6 text-gray-600">—</td>
                  <td className="py-2 px-6 text-gray-600">—</td>
                  <td className="py-2 px-6 text-gray-600">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
