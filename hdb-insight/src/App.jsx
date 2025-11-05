// src/App.jsx
import { Routes, Route } from "react-router-dom";
import RequireRole from "./RequireRole";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import UserDashboard from "./pages/UserDashboard";
import UserDataManagement from "./pages/UserDataManagement";
import UserInsights from "./pages/UserInsights";
import UserAccount from "./pages/UserAccount";

import AdminDashboard from "./pages/AdminDashboard";
import AdminDataManagement from "./pages/AdminDataManagement";
import AdminInsights from "./pages/AdminInsights";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* user-only */}
      <Route
        path="/dashboard"
        element={
          <RequireRole role="user">
            <UserDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/data"
        element={
          <RequireRole role="user">
            <UserDataManagement />
          </RequireRole>
        }
      />
      <Route
        path="/insights"
        element={
          <RequireRole role="user">
            <UserInsights />
          </RequireRole>
        }
      />
      <Route
        path="/account"
        element={
          <RequireRole role="user">
            <UserAccount />
          </RequireRole>
        }
      />

      {/* admin-only */}
      <Route
        path="/admin-dashboard"
        element={
          <RequireRole role="admin">
            <AdminDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/admin-data"
        element={
          <RequireRole role="admin">
            <AdminDataManagement />
          </RequireRole>
        }
      />
      <Route
        path="/admin-insights"
        element={
          <RequireRole role="admin">
            <AdminInsights />
          </RequireRole>
        }
      />
    </Routes>
  );
}
