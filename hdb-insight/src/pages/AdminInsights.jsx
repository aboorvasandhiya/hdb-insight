import React, { useState } from "react";
import { FaUserCircle, FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminInsights = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("Insights");

  const [posts, setPosts] = useState([
    { 
      id: 1,
      town: "Bedok", 
      date: "16/10/23", 
      rating: 3,
      review: "tooo big mrt tooooooo farrrrrr",
      status: "pending"
    },
    { 
      id: 2,
      town: "Macpherson", 
      date: "16/10/23", 
      rating: 2,
      review: "got ntg veryyy boringgggg",
      status: "pending"
    },
    { 
      id: 3,
      town: "Tampines", 
      date: "15/10/23", 
      rating: 4,
      review: "Great location, near MRT and shopping mall",
      status: "pending"
    },
    { 
      id: 4,
      town: "Jurong West", 
      date: "15/10/23", 
      rating: 1,
      review: "Too noisy, construction everywhere",
      status: "pending"
    },
    { 
      id: 5,
      town: "Ang Mo Kio", 
      date: "14/10/23", 
      rating: 5,
      review: "Perfect neighborhood, very family-friendly",
      status: "pending"
    },
  ]);

  const handleApprove = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, status: "approved" } : post
    ));
  };

  const handleCancel = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, status: "rejected" } : post
    ));
  };

  const pendingPosts = posts.filter(post => post.status === "pending");

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
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6">
            Community Insights and Neighborhood Commentary
          </h3>

          <div className="mb-4">
            <input
              type="text"
              placeholder='Search by keywords (e.g., "noisy", "travel")'
              className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50"
            />
          </div>

          <div className="space-y-4">
            {pendingPosts.map((post) => (
              <div key={post.id} className="bg-gray-50 shadow-sm p-4 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">Town: {post.town}</p>
                    <p className="text-sm text-gray-500">Date: {post.date}</p>
                    <p className="text-sm text-gray-500">Rating: {post.rating}/5</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(post.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition text-sm"
                    >
                      <FaCheck className="text-xs" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleCancel(post.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition text-sm"
                    >
                      <FaTimes className="text-xs" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
                <p className="text-gray-700">{post.review}</p>
              </div>
            ))}
          </div>

          {pendingPosts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No pending reviews to moderate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInsights;
