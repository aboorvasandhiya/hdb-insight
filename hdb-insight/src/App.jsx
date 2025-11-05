import { Routes, Route } from "react-router-dom";
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
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/data" element={<UserDataManagement />} />
      <Route path="/insights" element={<UserInsights />} />
      <Route path="/account" element={<UserAccount />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin-data" element={<AdminDataManagement />} />
      <Route path="/admin-insights" element={<AdminInsights />} />
    </Routes>
  );
}
