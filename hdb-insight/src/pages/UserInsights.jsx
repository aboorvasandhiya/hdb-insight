import React, { useState } from "react";
import { FaUserCircle, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Insights = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("Insights");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [town, setTown] = useState("");
  const [factor, setFactor] = useState("");

  const [posts, setPosts] = useState([
    { town: "Bedok", date: "14/10/25", review: "tooo big mrt tooooooo farrrrrr" },
    { town: "Macpherson", date: "14/10/25", review: "got ntg veryyy boringgggg" },
  ]);

  const handlePost = () => {
    if (town && review) {
      const newPost = {
        town,
        date: new Date().toLocaleDateString("en-GB"),
        review,
      };
      setPosts([newPost, ...posts]);
      setTown("");
      setFactor("");
      setReview("");
      setRating(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">HDB Resale Market Analyzer</h1>
        <button
          onClick={() => navigate("/account")}
          className="flex items-center space-x-2 text-red-600 font-medium hover:text-red-700 transition"
        >
          <FaUserCircle className="text-xl" />
          <span>Logged in as: Cust1</span>
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

      <div className="p-6 grid grid-cols-12 gap-6">
        {/* Left - Post Form */}
        <div className="col-span-4 bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-4">Share your insights on your selected town</h3>

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

        {/* Right - Review List */}
        <div className="col-span-8 flex flex-col gap-4">
          <h3 className="text-lg font-semibold mb-2">
            Community Insights and Neighborhood Commentary
          </h3>

          <div className="mb-3">
            <input
              type="text"
              placeholder='Search by keywords (e.g., "noisy", "travel")'
              className="w-full border rounded-md px-3 py-2 text-sm bg-lime-50"
            />
          </div>

          {posts.map((post, index) => (
            <div key={index} className="bg-white shadow-sm p-4 rounded-lg border">
              <p className="font-semibold">Town: {post.town}</p>
              <p className="text-sm text-gray-500 mb-2">Date: {post.date}</p>
              <p>{post.review}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Insights;
