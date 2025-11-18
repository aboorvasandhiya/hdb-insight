import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaSearch, FaPlus, FaTimes } from "react-icons/fa";

export default function AdminDataManagement() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("Data Management");
  const [showModal, setShowModal] = useState(false);

  // real rows from backend
  const [tableData, setTableData] = useState([]);

  const [formData, setFormData] = useState({
    town: "",
    block: "",
    streetName: "",
    price: "",
    floorArea: "",
    floorRange: "",
    flatType: "",
    leaseLeft: "",
  });

  // search term
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    fetchTableData(); // loads latest 200 on first render
  }, []);

  const handleSearch = () => {
    fetchTableData(searchTerm); // ask backend to search whole table
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/resales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert("Failed to save: " + (errData.error || "unknown error"));
        return;
      }

      // 1) inserted
      await res.json();

      // 2) refresh table
      const refreshed = await fetch(
        "http://localhost:3001/api/resales/table"
      ).then((r) => r.json());
      setTableData(refreshed);

      // 3) close + reset
      setShowModal(false);
      setFormData({
        town: "",
        block: "",
        streetName: "",
        price: "",
        floorArea: "",
        floorRange: "",
        flatType: "",
        leaseLeft: "",
      });
    } catch (err) {
      console.error(err);
      alert("Network / server error");
    }
  };


  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      town: "",
      block: "",
      streetName: "",
      price: "",
      floorArea: "",
      floorRange: "",
      flatType: "",
      leaseLeft: "",
    });
  };


  // Filter rows by searchTerm across all columns
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


  function useLogout() {
    const navigate = useNavigate();
    return () => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      navigate("/", { replace: true }); // back to Login
    };
  }

  const logout = useLogout();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          HDB Resale Market Analyzer
        </h1>
        <button
          onClick={logout}
          className="flex items-center space-x-2 text-red-600 font-medium hover:text-red-700 transition"
          title="Logout"
        >
          <FaUserCircle className="text-xl" />
          <span>Logged in as: Admin</span>
        </button>
      </div>

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

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-md transition"
            style={{ backgroundColor: "#EFF2DD", color: "#333" }}
          >
            <FaPlus className="text-sm" />
            <span>Add New Transaction</span>
          </button>

          <div className="flex items-center bg-white rounded-md px-4 py-2 border border-gray-200 w-80">
            <FaSearch
              className="text-gray-400 mr-3 cursor-pointer"
              onClick={handleSearch}
            />
            <input
              type="text"
              placeholder="Search by Transaction ID, Town, etc."
              className="flex-1 outline-none bg-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
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
                <th className="py-3 px-6 font-semibold">Block</th>
                <th className="py-3 px-6 font-semibold">Street Name</th>
                <th className="py-3 px-6 font-semibold">Flat Type</th>
                <th className="py-3 px-6 font-semibold">Area SqM</th>
                <th className="py-3 px-6 font-semibold">Floor Range</th>
                <th className="py-3 px-6 font-semibold">Pricing</th>
                <th className="py-3 px-6 font-semibold">Remaining Lease</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((row, i) => (
                <tr
                  key={row.resale_id}
                  className={`${
                    i === 0
                      ? "bg-blue-50"
                      : i % 2 === 0
                      ? "bg-[#f8faee]"
                      : "bg-white"
                  } border-b hover:bg-gray-50 cursor-pointer`}
                >
                  <td className="py-2 px-6 text-gray-600">{row.resale_id}</td>
                  <td className="py-2 px-6 text-gray-600">{row.month}</td>
                  <td className="py-2 px-6 text-gray-600">{row.town_name}</td>
                  <td className="py-2 px-6 text-gray-600">{row.block}</td>
                  <td className="py-2 px-6 text-gray-600">{row.street_name}</td>
                  <td className="py-2 px-6 text-gray-600">{row.flat_type_name}</td>
                  <td className="py-2 px-6 text-gray-600">{row.floor_area_sqm}</td>
                  <td className="py-2 px-6 text-gray-600">
                    {row.storey_min && row.storey_max
                      ? `${row.storey_min}-${row.storey_max}`
                      : "—"}
                  </td>
                  <td className="py-2 px-6 text-gray-600">
                    {row.resale_price
                      ? row.resale_price.toLocaleString()
                      : "—"}
                  </td>
                  <td className="py-2 px-6 text-gray-600">
                    {row.remaining_lease_years
                      ? row.remaining_lease_years
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 border border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Add New Transaction
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Town */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600 w-24">
                  Town
                </label>
                <select
                  value={formData.town}
                  onChange={(e) => handleInputChange("town", e.target.value)}
                  className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Town</option>
                  <option value="Ang Mo Kio">Ang Mo Kio</option>
                  <option value="Bedok">Bedok</option>
                  <option value="Bishan">Bishan</option>
                  <option value="Bukit Merah">Bukit Merah</option>
                  <option value="Bukit Timah">Bukit Timah</option>
                  <option value="Central">Central</option>
                  <option value="Clementi">Clementi</option>
                  <option value="Geylang">Geylang</option>
                  <option value="Jurong West">Jurong West</option>
                  <option value="Tampines">Tampines</option>
                  <option value="Toa Payoh">Toa Payoh</option>
                </select>
              </div>

              {/* Block */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600 w-24">
                  Block
                </label>
                <input
                  type="text"
                  value={formData.block}
                  onChange={(e) => handleInputChange("block", e.target.value)}
                  placeholder="e.g. 123"
                  className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Street Name */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600 w-24">
                  Street
                </label>
                <input
                  type="text"
                  value={formData.streetName}
                  onChange={(e) =>
                    handleInputChange("streetName", e.target.value)
                  }
                  placeholder="Street name"
                  className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600 w-24">
                  Price
                </label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) =>
                    handleInputChange("price", e.target.value)
                  }
                  placeholder="Price"
                  className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Floor Area */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600 w-24">
                  Floor Area(sqm)
                </label>
                <input
                  type="text"
                  value={formData.floorArea}
                  onChange={(e) =>
                    handleInputChange("floorArea", e.target.value)
                  }
                  placeholder="sqm"
                  className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Floor Range */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600 w-24">
                  Floor Range
                </label>
                <select
                  value={formData.floorRange}
                  onChange={(e) =>
                    handleInputChange("floorRange", e.target.value)
                  }
                  className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">storey</option>
                  <option value="01-05">01-05</option>
                  <option value="06-10">06-10</option>
                  <option value="11-15">11-15</option>
                  <option value="16-20">16-20</option>
                  <option value="21-25">21-25</option>
                  <option value="26-30">26-30</option>
                </select>
              </div>

              {/* Flat Type */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600 w-24">
                  Flat Type
                </label>
                <select
                  value={formData.flatType}
                  onChange={(e) =>
                    handleInputChange("flatType", e.target.value)
                  }
                  className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">type</option>
                  <option value="2-Room">2-Room</option>
                  <option value="3-Room">3-Room</option>
                  <option value="4-Room">4-Room</option>
                  <option value="5-Room">5-Room</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>

              {/* Lease Left */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600 w-24">
                  Lease left
                </label>
                <input
                  type="text"
                  value={formData.leaseLeft}
                  onChange={(e) =>
                    handleInputChange("leaseLeft", e.target.value)
                  }
                  placeholder="years"
                  className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-md transition"
                style={{ backgroundColor: "#EFF2DD", color: "#333" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
