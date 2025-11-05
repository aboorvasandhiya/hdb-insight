import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [message, setMessage] = useState("");

  const onChange = (k) => (e) => {
    setForm((s) => ({ ...s, [k]: e.target.value }));
  };

  /*const handleCreate = (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.confirm) {
      setMessage("Please fill the required");
      return;
    }
    if (form.password !== form.confirm) {
      setMessage("Passwords do not match.");
      return;
    }
  };*/

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");             // clear any old message
    try {
      const res = await fetch("http://localhost:3001/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          email: null,
          phone: form.phone
        })
      });
  
      // Always try to parse once
      const data = await res.json().catch(() => null);
  
      if (!res.ok) {
        setMessage((data && data.error) || "Signup failed");
        return;
      }
  
      // success
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("role", data.user.role || "user");
      setMessage("Account created!");
      // optionally navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setMessage("Network error");
    }
  };
    

  return (
    <div className="min-h-screen flex items-center justify-center auth-bg">
      <div className="max-w-2xl w-full bg-white/95 shadow-md rounded-md p-10 sm:p-16">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-8">-HDBInsight-</h1>

        <form onSubmit={handleCreate} className="max-w-xs mx-auto">
          <input
            className="w-full mb-3 px-3 py-2 text-sm rounded border border-gray-200 bg-gray-50 placeholder-gray-400"
            placeholder="Username/ Email"
            value={form.username}
            onChange={onChange("username")}
          />
          <input
            className="w-full mb-3 px-3 py-2 text-sm rounded border border-gray-200 bg-gray-50 placeholder-gray-400"
            placeholder="Phone number"
            value={form.phone}
            onChange={onChange("phone")}
          />
          <input
            className="w-full mb-3 px-3 py-2 text-sm rounded border border-gray-200 bg-gray-50 placeholder-gray-400"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={onChange("password")}
          />
          <input
            className="w-full mb-4 px-3 py-2 text-sm rounded border border-gray-200 bg-gray-50 placeholder-gray-400"
            placeholder="Confirm Password"
            type="password"
            value={form.confirm}
            onChange={onChange("confirm")}
          />

          <button
            type="submit"
            className="w-full block text-center py-2 text-sm rounded shadow-sm"
            style={{ backgroundColor: "#9fb7b0", color: "#082018" }}
          >
            Create account
          </button>

          {message && <p className="text-xs mt-3 text-center text-gray-700">{message}</p>}

          <p className="mt-6 text-xs text-center text-gray-500">User roles and permissions are enforced</p>

          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-gray-700 hover:underline">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
