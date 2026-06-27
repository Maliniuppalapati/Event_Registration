// C:\Users\U GEYA MALINI\OneDrive\文件\Event_Registration\college-events-frontend\src\pages\Login.jsx

import React, { useState } from "react";
import API from "../utils/api";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");
  const nav = useNavigate();

  const isOrganizerLogin = role === "organizer";

  const submit = async () => {
    try {
      const loginPayload = { email, password, role };

      const res = await API.post("/auth/login", loginPayload);
      onLogin(res.data);
      nav("/");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="container-centered">
           {" "}
      <div className="card">
               {" "}
        <h3>Login as {isOrganizerLogin ? "Event Organizer" : "Student"}</h3>   
           {" "}
        {isOrganizerLogin && (
          <p style={{ marginBottom: 15, color: "#666", fontSize: "0.9rem" }}>
                        🔑 Use shared organizer credentials.          {" "}
          </p>
        )}
               {" "}
        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
               {" "}
        <input
          className="input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
               {" "}
        <button className="btn" onClick={submit}>
                    Login        {" "}
        </button>
             {" "}
      </div>
         {" "}
    </div>
  );
}
