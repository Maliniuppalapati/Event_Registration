// C:\Users\U GEYA MALINI\OneDrive\文件\Event_Registration\college-events-frontend\src\pages\CreateEvent.jsx

import React, { useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function CreateEvent() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    totalSeats: 50,
    price: 0,
    image: "",
  });

  const submit = async () => {
    try {
      if (!form.title || !form.date || form.totalSeats <= 0) {
        alert("Please fill in required fields (Title, Date, Total Seats)");
        return;
      }
      await API.post("/events/add", form);
      alert("Event created successfully!");
      nav("/");
    } catch (err) {
      alert(err.response?.data?.msg || "Error creating event");
    }
  };

  return (
    <div className="container-centered">
           {" "}
      <div
        className="card"
        style={{
          maxWidth: 600,
          // 🛑 FIX: Force card to scroll internally if content is too tall
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
                <h3>Create New Event 📝</h3>
               {" "}
        <input
          className="input"
          placeholder="Title (Required)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
               {" "}
        <input
          className="input"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
               {" "}
        <label style={{ fontSize: "0.9rem", color: "#555", marginBottom: 5 }}>
                    Date (Required)        {" "}
        </label>
               {" "}
        <input
          className="input"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
               {" "}
        <input
          className="input"
          placeholder="Time (e.g., 6:00 PM)"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
        />
               {" "}
        <input
          className="input"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
               {" "}
        <label style={{ fontSize: "0.9rem", color: "#555", marginBottom: 5 }}>
                    Total Seats (Required)        {" "}
        </label>
               {" "}
        <input
          className="input"
          placeholder="Total Seats"
          type="number"
          min="1"
          value={form.totalSeats}
          onChange={(e) =>
            setForm({ ...form, totalSeats: Number(e.target.value) })
          }
        />
               {" "}
        <label style={{ fontSize: "0.9rem", color: "#555", marginBottom: 5 }}>
                    Price (₹)        {" "}
        </label>
               {" "}
        <input
          className="input"
          placeholder="Price"
          type="number"
          min="0"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
               {" "}
        <input
          className="input"
          placeholder="Image URL (Optional)"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />
               {" "}
        <button className="btn" onClick={submit}>
                    Create Event        {" "}
        </button>
             {" "}
      </div>
         {" "}
    </div>
  );
}
