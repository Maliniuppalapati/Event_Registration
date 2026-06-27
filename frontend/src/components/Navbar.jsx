// C:\Users\U GEYA MALINI\OneDrive\文件\Event_Registration\college-events-frontend\src\components\Navbar.jsx

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { setAuthToken } from "../utils/api";

export default function Navbar({ user, setUser }) {
  const nav = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthToken(null);
    setUser(null);
    nav("/login");
  };

  return (
    <div className="nav">
      <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#333" }}>
        ✨ College Events
      </div>
      <div>
        <Link to="/">Home</Link>
        {user?.role === "organizer" && (
          <Link to="/create" style={{ marginLeft: 12 }}>
            Add Event
          </Link>
        )}
        {user?.role === "student" && (
          <Link to="/my-bookings" style={{ marginLeft: 12 }}>
            My Bookings
          </Link>
        )}
        {user ? (
          <>
            <span style={{ marginLeft: 12, fontWeight: 600 }}>
              Hi, {user.name}
            </span>
            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ marginLeft: 12 }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login?role=student" style={{ marginLeft: 8 }}>
              Login as Student
            </Link>
            <Link to="/login?role=organizer" style={{ marginLeft: 8 }}>
              Login as Organizer
            </Link>
            <Link to="/register" style={{ marginLeft: 8 }}>
              Register (Student)
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
