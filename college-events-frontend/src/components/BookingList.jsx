import React from "react";
export default function BookingList({ list = [] }) {
  return (
    <div className="card">
      <h3>My Bookings</h3>
      {list.length === 0 ? (
        <div>No bookings yet</div>
      ) : (
        list.map((b) => (
          <div
            key={b._id}
            style={{ borderBottom: "1px solid #eee", padding: "8px 0" }}
          >
            <div style={{ fontWeight: 600 }}>{b.event.title}</div>
            <div>
              {b.tickets} ticket(s) • ₹{b.totalPrice} •{" "}
              {new Date(b.createdAt).toLocaleString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
