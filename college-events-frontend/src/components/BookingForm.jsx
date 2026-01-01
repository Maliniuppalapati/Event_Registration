// C:\Users\U GEYA MALINI\OneDrive\文件\Event_Registration\college-events-frontend\src\components\BookingForm.jsx

import React, { useState } from "react";
import API from "../utils/api";

export default function BookingForm({ ev, onClose, refresh }) {
  const [department, setDepartment] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  // We don't need name/email state here, as the user is already logged in,
  // but we must enforce Dept/Phone input for the booking payload.
  const tickets = 1;

  const submit = async () => {
    try {
      if (!department || !phoneNumber) {
        alert("Please enter your Department and Phone Number.");
        return;
      }
      if (ev.availableSeats < 1) {
        alert("This event is sold out.");
        return;
      }

      // Sending eventId and NEW FIELDS
      await API.post("/bookings/book", {
        eventId: ev._id,
        department,
        phoneNumber,
      });

      alert("Successfully registered!");
      refresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.msg || "Error booking");
    }
  };

  const totalPrice = ev.price || 0;

  return (
    <>
      <h3>Register for: {ev.title}</h3>
      <p style={{ marginBottom: 10 }}>Price per ticket: ₹{totalPrice}</p>
      <p style={{ marginBottom: 15, color: "green", fontWeight: 600 }}>
        Available Seats: {ev.availableSeats}
      </p>

      {/* NEW INPUTS */}
      {/* Name and Email are implicitly linked via the User model */}
      <input
        className="input"
        placeholder="Your Department (e.g., CSE, ECE)"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        required
      />
      <input
        className="input"
        placeholder="Your Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />
      {/* END NEW INPUTS */}

      <p style={{ marginBottom: 20, fontStyle: "italic" }}>
        You are booking 1 seat.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 15 }}>
        <button
          className="btn"
          onClick={submit}
          disabled={ev.availableSeats < 1}
        >
          Confirm Registration
        </button>
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </>
  );
}
