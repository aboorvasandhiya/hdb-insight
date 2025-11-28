// UserDataManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaSearch } from "react-icons/fa";

export default function DataManagement() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("Data Management");

  // real rows from backend (same as admin)
  const [tableData, setTableData] = useState([]);

  // search term
  const [searchTerm, setSearchTerm] = useState("");

  // --- fetch table data from backend ---
  const fetchTableData = async (q = "") => {
    try {
      let url = "http://localhost:3001/api/resales/table";
      if (q && q.trim()) {
        url += `?q=${encodeURIComponent(q.trim())}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setTableData(data);
    } catch (err) {
      console.error("error loading table:", err);
    }
  };

  // load latest 200 on first render
  useEffect(() => {
    fetchTableData();
  }, []);

  const handleSearch = () => {
    fetchTableData(searchTerm); // ask backend to search whole table
  };

  // client-side filter (optional – keeps live filtering as user types)
  const filteredData = tableData.filter((row) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();

    const valuesToCheck = [
      row.resale_id,
      row.month,
      row.town_name,
      row.block,
      row.street_name,
      row.flat_type_name,
      row.floor_area_sqm,
      row.storey_min && row.storey_max ? `${row.storey_min}-${row.storey_max}` : "",
      row.resale_price,
      row.remaining_lease_years,
    ];

    return valuesToCheck.some((val) =>
      String(val ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          HDB Resale Market Analyzer
        </h1>
        <button
          onClick={() => navigate("/account")}
          className="flex items-center space-x-2 text-red-600 font-medium hover:text-red-700 transition"
        >
          <FaUserCircle className="text-xl" />
          <span>
            Logged in as: {localStorage.getItem("username") || "Guest"}
          </span>
        </button>
      </div>

      {/* TABS */}
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

      {/* MAIN CONTENT */}
      <div className="p-6">
        {/* SEARCH BAR */}
        <div className="bg-[#f0f0ec] mb-6 p-4 rounded-md">
          <div className="flex items-center bg-white rounded-md px-4 py-2 border border-gray-200 w-full max-w-xl">
            <FaSearch
              className="text-gray-400 mr-3 cursor-pointer"
              onClick={handleSearch}
            />
            <input
              type="text"
              placeholder="Search by Transaction ID, Town, Street, etc."
              className="flex-1 outline-none bg-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-md shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-700 border-b">
                <th className="py-3 px-6 font-semibold">Transaction ID</th>
                <th className="py-3 px-6 font-semibold">Month</th>
                <th className="py-3 px-6 font-semibold">Town</th>
                <th className="py-3 px-6 font-semibold">Block</th>
                <th className="py-3 px-6 font-semibold">Street Name</th>
                <th className="py-3 px-6 font-semibold">Flat Type</th>
                <th className="py-3 px-6 font-semibold">Floor Area (sqm)</th>
                <th className="py-3 px-6 font-semibold">Price</th>
                <th className="py-3 px-6 font-semibold">Price per sqm</th>
                <th className="py-3 px-6 font-semibold">Floor Range</th>
                <th className="py-3 px-6 font-semibold">Lease left (years)</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-4 px-6 text-center text-gray-500"
                  >
                    No transactions found. Try a different search term.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, i) => {
                  const pricePerSqm =
                    row.resale_price && row.floor_area_sqm
                      ? Math.round(row.resale_price / row.floor_area_sqm)
                      : null;

                  return (
                    <tr
                      key={row.resale_id}
                      className={`${
                        i % 2 === 0 ? "bg-[#f8faee]" : "bg-white"
                      } border-b`}
                    >
                      <td className="py-2 px-6 text-gray-600">
                        {row.resale_id}
                      </td>
                      <td className="py-2 px-6 text-gray-600">{row.month}</td>
                      <td className="py-2 px-6 text-gray-600">
                        {row.town_name}
                      </td>
                      <td className="py-2 px-6 text-gray-600">{row.block}</td>
                      <td className="py-2 px-6 text-gray-600">
                        {row.street_name}
                      </td>
                      <td className="py-2 px-6 text-gray-600">
                        {row.flat_type_name}
                      </td>
                      <td className="py-2 px-6 text-gray-600">
                        {row.floor_area_sqm}
                      </td>
                      <td className="py-2 px-6 text-gray-600">
                        {row.resale_price
                          ? `SGD ${row.resale_price.toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="py-2 px-6 text-gray-600">
                        {pricePerSqm
                          ? `SGD ${pricePerSqm.toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="py-2 px-6 text-gray-600">
                        {row.storey_min && row.storey_max
                          ? `${row.storey_min}-${row.storey_max}`
                          : "—"}
                      </td>
                      <td className="py-2 px-6 text-gray-600">
                        {row.remaining_lease_years ?? "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
