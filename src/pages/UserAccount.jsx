import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaEdit, FaSave, FaTimes } from "react-icons/fa";

export default function UserAccount() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    username: "Cust1",
    email: "cust1@example.com",
    phone: "+65 9123 4567",
    joinDate: "January 2024",
    totalTransactions: "47",
    favoriteTown: "Bedok",
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    //backend take care pls
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="flex justify-between items-center px-8 py-5 bg-white border-b shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          HDB Resale Market Analyzer
        </h1>

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
          onClickme="py-3 border-b-2 border-transparent text-gray-400 hover:text-red-500 transition"
        >={() => navigate("/dashboard")}
          classNa
          Dashboard
        </button>

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
                  className="flex items-center space-x-2 px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  <FaSave className="text-sm" />
                  <span>Save</span>
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
                  <p className="text-gray-800 font-medium">{userInfo.email}</p>
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
                  <p className="text-gray-800 font-medium">{userInfo.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Member Since
                </label>
                <p className="text-gray-800 font-medium">{userInfo.joinDate}</p>
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
                  {/* I JUST ADD THIS IDK CAN MAKE USE OF THE DB OR SMTH */}
                </div>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => navigate("/")}
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