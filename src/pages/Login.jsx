import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin"); 
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() === "admin" && password === "admin") {
      setError("");
      navigate("/admin-dashboard");
    } else if (username.trim() === "cust1" && password === "cust1") {
      setError("");
      navigate("/dashboard");
    } else {
      setError("Invalid credentials — try admin/admin or cust1/cust1");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center auth-bg">
      <div className="max-w-2xl w-full bg-white/95 shadow-md rounded-md p-10 sm:p-16" style={{ boxShadow: "0 6px 0 rgba(0,0,0,0.06)" }}>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-8">-HDBInsight-</h1>

        <form onSubmit={handleSubmit} className="max-w-xs mx-auto">
          <input
            className="w-full mb-3 px-3 py-2 text-sm rounded border border-gray-200 bg-gray-50 placeholder-gray-400"
            placeholder="Username/ Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="w-full mb-4 px-3 py-2 text-sm rounded border border-gray-200 bg-gray-50 placeholder-gray-400"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full block text-center py-2 text-sm rounded shadow-sm"
            style={{ backgroundColor: "#9fb7b0", color: "#082018" }}
          >
            Login
          </button>

          {error && <p className="text-xs text-red-600 mt-2 text-center">{error}</p>}

          <p className="text-xs text-center text-gray-500 mt-6">User roles and permissions are enforced</p>

          <div className="mt-4 text-center space-y-2">
            <Link to="/signup" className="block text-xs text-gray-700 hover:underline">Create Account</Link>
            <button type="button" className="text-xs text-gray-700">Forget Password</button>
          </div>
        </form>                
{/* this is the password */}
        <p className="mt-6 text-xs text-center text-gray-400">Demo accounts: <span className="font-semibold">admin/admin</span> or <span className="font-semibold">cust1/cust1</span></p>
      </div>
    </div>
  );
}
