// C:\Users\U GEYA MALINI\OneDrive\文件\Event_Registration\college-events-frontend\src\components\BookingForm.jsx

import React, { useState } from "react";
import API from "../utils/api";

export default function BookingForm({ ev, onClose, refresh }) {
  const [department, setDepartment] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(""); // UI feedback state
  const tickets = 1;

  const submit = async () => {
    try {
      if (!department || !phoneNumber) {
        alert("Please enter your Department and Phone Number.");
        return;
      }

      // If event costs money, run the fake payment simulation
      if (ev.price > 0 && ev.availableSeats >= 1) {
          setIsProcessing(true);
          setPaymentStatus("Connecting to Secure Payment Gateway...");
          
          await new Promise(r => setTimeout(r, 1200));
          setPaymentStatus("Processing Credit Card...");
          
          await new Promise(r => setTimeout(r, 1500));
          setPaymentStatus("Payment Successful! Securing ticket...");
          
          await new Promise(r => setTimeout(r, 800));
      } else {
          setIsProcessing(true);
          setPaymentStatus("Securing your ticket...");
      }

      const res = await API.post("/bookings/book", {
        eventId: ev._id,
        department,
        phoneNumber,
      });

      alert(res.data.msg || "Successfully registered!");
      refresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.msg || "Error booking");
    } finally {
      setIsProcessing(false);
      setPaymentStatus("");
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

      {isProcessing ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #007bff", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 15px" }}></div>
            <p style={{ fontWeight: "bold", color: "#007bff" }}>{paymentStatus}</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 12, marginTop: 15 }}>
          <button
            className="btn"
            onClick={submit}
          >
            {ev.availableSeats < 1 ? "Join Waitlist" : "Confirm & Pay"}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      )}
    </>
  );
}
