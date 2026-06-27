// C:\Users\U GEYA MALINI\OneDrive\文件\Event_Registration\college-events-frontend\src\pages\Register.jsx

import React, { useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";
export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const nav = useNavigate();

  const submit = async () => {
    try {
      const res = await API.post("/auth/register", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      API.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      nav("/");
    } catch (err) {
      alert(err.response?.data?.msg || "Register failed");
    }
  };

  return (
    <div className="container-centered">
           {" "}
      <div className="card">
                <h3>Student Registration 🧑‍🎓</h3>       {" "}
        <p style={{ marginBottom: 15, color: "#666", fontSize: "0.9rem" }}>
                    Organizers use the specific login link.        {" "}
        </p>
               {" "}
        <input
          className="input"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
               {" "}
        <input
          className="input"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
               {" "}
        <input
          className="input"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
               {" "}
        <button className="btn" onClick={submit}>
                    Register        {" "}
        </button>
             {" "}
      </div>
         {" "}
    </div>
  );
}
