// C:\Users\U GEYA MALINI\OneDrive\文件\Event_Registration\college-events-frontend\src\App.jsx

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import HomeLanding from "./pages/HomeLanding"; // <-- Import the new page
import Navbar from "./components/Navbar";
import { setAuthToken } from "./utils/api";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Could not parse user from localStorage", e);
      return null;
    }
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);
  }, []);

  const handleLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setAuthToken(data.token);
    setUser(data.user);
  };

  return (
    <BrowserRouter>
      <Navbar user={user} setUser={setUser} />

      {/* ❌ Removed the .container wrapper */}
      <Routes>
        <Route
          path="/"
          element={user ? <Dashboard user={user} /> : <HomeLanding />}
        />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/create"
          element={
            user?.role === "organizer" ? <CreateEvent /> : <Navigate to="/" />
          }
        />
        <Route
          path="/my-bookings"
          element={
            user?.role === "student" ? (
              <Dashboard user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
