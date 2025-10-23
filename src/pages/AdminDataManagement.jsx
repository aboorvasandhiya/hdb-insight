import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaSearch, FaPlus, FaTimes } from "react-icons/fa";

export default function AdminDataManagement() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("Data Management");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    town: "",
    price: "",
    floorArea: "",
    floorRange: "",
    flatType: "",
    leaseLeft: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log("Saving transaction:", formData);
    setShowModal(false);
    setFormData({
      town: "",
      price: "",
      floorArea: "",
      floorRange: "",
      flatType: "",
      leaseLeft: ""
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      town: "",
      price: "",
      floorArea: "",
      floorRange: "",
      flatType: "",
      leaseLeft: ""
    });
  };

  const tableData = [
    { id: "TXN001", month: "Oct 2023", town: "Jurong West", www: "123", foo: "456", price: "520,000", floor: "10-15", type: "4-Room", sentiment: "Neutral" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">HDB Resale Market Analyzer</h1>
        <button
          onClick={() => navigate("/account")}
          className="flex items-center space-x-2 text-red-600 font-medium hover:text-red-700 transition"
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
            <FaSearch className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search by Transaction ID, Town, etc."
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
                <th className="py-3 px-6 font-semibold">WWW</th>
                <th className="py-3 px-6 font-semibold">FOO ATM</th>
                <th className="py-3 px-6 font-semibold">Price per SQM</th>
                <th className="py-3 px-6 font-semibold">Floor Range</th>
                <th className="py-3 px-6 font-semibold">HDB Type</th>
                <th className="py-3 px-6 font-semibold">Sentiment</th>
              </tr>
            </thead>

            <tbody>
              {tableData.map((row, i) => (
                <tr
                  key={i}
                  className={`${
                    i === 0 ? "bg-blue-50" : i % 2 === 0 ? "bg-[#f8faee]" : "bg-white"
                  } border-b hover:bg-gray-50 cursor-pointer`}
                >
                  <td className="py-2 px-6 text-gray-600">{row.id}</td>
                  <td className="py-2 px-6 text-gray-600">{row.month}</td>
                  <td className="py-2 px-6 text-gray-600">{row.town}</td>
                  <td className="py-2 px-6 text-gray-600">{row.www}</td>
                  <td className="py-2 px-6 text-gray-600">{row.foo}</td>
                  <td className="py-2 px-6 text-gray-600">{row.price}</td>
                  <td className="py-2 px-6 text-gray-600">{row.floor}</td>
                  <td className="py-2 px-6 text-gray-600">{row.type}</td>
                  <td className="py-2 px-6 text-gray-600">{row.sentiment}</td>
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
              <h2 className="text-lg font-semibold text-gray-800">Add New Transaction</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600 w-24">Town</label>
                <select
                  value={formData.town}
                  onChange={(e) => handleInputChange('town', e.target.value)}
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

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600 w-24">Price</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Price"
                  className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600 w-24">Floor Area(sqm)</label>
                <input
                  type="text"
                  value={formData.floorArea}
                  onChange={(e) => handleInputChange('floorArea', e.target.value)}
                  placeholder="sqm"
                  className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600 w-24">Floor Range</label>
                <select
                  value={formData.floorRange}
                  onChange={(e) => handleInputChange('floorRange', e.target.value)}
                  className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">sqm</option>
                  <option value="01-05">01-05</option>
                  <option value="06-10">06-10</option>
                  <option value="11-15">11-15</option>
                  <option value="16-20">16-20</option>
                  <option value="21-25">21-25</option>
                  <option value="26-30">26-30</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600 w-24">Flat Type</label>
                <select
                  value={formData.flatType}
                  onChange={(e) => handleInputChange('flatType', e.target.value)}
                  className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">sqm</option>
                  <option value="2-Room">2-Room</option>
                  <option value="3-Room">3-Room</option>
                  <option value="4-Room">4-Room</option>
                  <option value="5-Room">5-Room</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600 w-24">Lease left</label>
                <input
                  type="text"
                  value={formData.leaseLeft}
                  onChange={(e) => handleInputChange('leaseLeft', e.target.value)}
                  placeholder="sqm"
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
