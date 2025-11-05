// src/pages/UserInsights.jsx (or wherever you keep it)

import React, { useEffect, useState } from "react";
import { FaUserCircle, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3001";

export default function Insights() {
  const navigate = useNavigate();

  // top nav state
  const [selectedTab, setSelectedTab] = useState("Insights");

  // post form state
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [town, setTown] = useState("");
  const [factor, setFactor] = useState("");

  // lists
  const [posts, setPosts] = useState([]);      // Community (approved)
  const [myPosts, setMyPosts] = useState([]);  // Mine (pending+approved)
  const [listTab, setListTab] = useState("community"); // 'community' | 'mine'

  const username = localStorage.getItem("username") || "Guest";

  // helper: DB -> UI mapping
  const mapDoc = (d) => ({
    town: d.town,
    review: d.comment,
    date:
      d.date || d.createdAt
        ? new Date(d.date || d.createdAt).toLocaleDateString("en-SG")
        : "",
    status: d.status || "approved",
  });

  // Load community (approved) posts
  useEffect(() => {
    fetch(`${API}/api/insights`)
      .then((r) => r.json())
      .then((docs) => setPosts((docs || []).map(mapDoc)))
      .catch(() => setPosts([]));
  }, []);

  // Load my posts (requires token)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API}/api/insights/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((docs) => setMyPosts((docs || []).map(mapDoc)))
      .catch(() => setMyPosts([]));
  }, []);

  // Submit a post
  const handlePost = async () => {
    if (!town || !review) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      const res = await fetch(`${API}/api/insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          town,
          comment: review,
          rating,
          tags: factor ? [factor] : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to submit");
        return;
      }

      // optimistic card in "My Posts"
      const optimistic = {
        town,
        review,
        date: new Date().toLocaleDateString("en-SG"),
        status: "pending",
      };
      setMyPosts((prev) => [optimistic, ...prev]);

      // clear form
      setTown("");
      setFactor("");
      setReview("");
      setRating(0);

      // refresh from server (just in case)
      const freshToken = localStorage.getItem("token");
      fetch(`${API}/api/insights/mine`, {
        headers: { Authorization: `Bearer ${freshToken}` },
      })
        .then((r) => r.json())
        .then((docs) => setMyPosts((docs || []).map(mapDoc)))
        .catch(() => {}); // keep optimistic if it fails

      alert("Submitted! Your insight is pending approval.");
    } catch {
      alert("Network error");
    }
  };

  const RightList = () => {
    const list = listTab === "community" ? posts : myPosts;

    return (
      <div className="col-span-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {listTab === "community"
              ? "Community Insights and Neighborhood Commentary"
              : "My Insights"}
          </h3>

          <div className="inline-flex rounded-md overflow-hidden border">
            <button
              onClick={() => setListTab("community")}
              className={`px-3 py-1 text-sm ${
                listTab === "community"
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              Community
            </button>
            <button
              onClick={() => setListTab("mine")}
              className={`px-3 py-1 text-sm ${
                listTab === "mine"
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              My Posts
            </button>
          </div>
        </div>

        {listTab === "community" && (
          <div className="mb-1">
            <input
              type="text"
              placeholder='Search by keywords (e.g., "noisy", "travel")'
              className="w-full border rounded-md px-3 py-2 text-sm bg-lime-50"
              // You can wire this to filter "posts" if you want
            />
          </div>
        )}

        {list.map((post, i) => (
          <div key={i} className="bg-white shadow-sm p-4 rounded-lg border">
            <p className="font-semibold">Town: {post.town}</p>
            <p className="text-sm text-gray-500 mb-2">
              Date: {post.date}{" "}
              {post.status === "pending" && (
                <span className="ml-2 text-amber-600">(pending)</span>
              )}
            </p>
            <p>{post.review}</p>
          </div>
        ))}

        {list.length === 0 && (
          <p className="text-sm text-gray-500">
            {listTab === "community"
              ? "No approved insights yet."
              : "You haven’t posted any insights yet."}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          HDB Resale Market Analyzer
        </h1>
        <button
          onClick={() => navigate("/account")}
          className="flex items-center space-x-2 text-red-600 font-medium hover:text-red-700 transition"
        >
          <FaUserCircle className="text-xl" />
          <span>Logged in as: {username}</span>
        </button>
      </div>

      {/* Top tabs */}
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

      {/* Content */}
      <div className="p-6 grid grid-cols-12 gap-6">
        {/* Left: Post form */}
        <div className="col-span-4 bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-4">
            Share your insights on your selected town
          </h3>

          <label className="block text-sm font-semibold mb-1">Town</label>
          <select
            value={town}
            onChange={(e) => setTown(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm text-gray-600 mb-3"
          >
            <option value="">Select a Town</option>
            {[
              "Ang Mo Kio",
              "Bedok",
              "Bishan",
              "Bukit Merah",
              "Bukit Timah",
              "Jurong West",
              "Macpherson",
              "Yishun",
            ].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label className="block text-sm font-semibold mb-1">Town Rating</label>
          <div className="flex items-center mb-3">
            {[1, 2, 3, 4, 5].map((num) => (
              <FaStar
                key={num}
                onClick={() => setRating(num)}
                className={`cursor-pointer text-lg ${
                  num <= rating ? "text-red-400" : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-500">
              {rating ? `${rating}/5` : "Not rated"}
            </span>
          </div>

          <label className="block text-sm font-semibold mb-1">Key Factor</label>
          <input
            value={factor}
            onChange={(e) => setFactor(e.target.value)}
            placeholder="e.g., noisy, near MRT"
            className="w-full border rounded-md px-3 py-2 text-sm text-gray-600 mb-3"
          />

          <label className="block text-sm font-semibold mb-1">Review</label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your review..."
            maxLength={400}
            className="w-full border rounded-md px-3 py-2 text-sm text-gray-600 h-32 mb-3"
          />

          <button
            onClick={handlePost}
            className="w-full bg-lime-50 text-gray-700 py-2 rounded-md hover:bg-lime-100"
          >
            Post
          </button>
        </div>

        {/* Right: Lists */}
        <RightList />
      </div>
    </div>
  );
}
