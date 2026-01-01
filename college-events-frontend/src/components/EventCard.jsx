// C:\Users\U GEYA MALINI\OneDrive\文件\Event_Registration\college-events-frontend\src\components\EventCard.jsx

import React from "react";

// Added onViewDetails prop
export default function EventCard({
  ev,
  onBook,
  onDelete,
  onViewDetails,
  userRole,
}) {
  const isStudent = userRole === "student";
  const isOrganizer = userRole === "organizer";
  const seatsLeft = ev.availableSeats;
  const isAvailable = seatsLeft > 0;

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the event: ${ev.title}? This will also delete all registrations!`
      )
    ) {
      onDelete(ev._id);
    }
  };

  return (
    <div className="card event-card">
      {ev.image && <img src={ev.image} alt={ev.title} />}
      <div className="event-card-content">
        <h3>{ev.title}</h3>
        <p>{ev.description.substring(0, 80)}...</p>
        <p>
          <strong>Location:</strong> {ev.location}
        </p>
        <p>
          <strong>Price:</strong> ₹{ev.price}
        </p>

        <div className="meta">
          <p>
            Date: {new Date(ev.date).toLocaleDateString()} at {ev.time}
          </p>
          <p style={{ color: isAvailable ? "green" : "red", fontWeight: 600 }}>
            Seats Left: {seatsLeft} / {ev.totalSeats}
          </p>
        </div>

        {isStudent && (
          <button
            className="btn"
            onClick={() => onBook(ev)}
            disabled={!isAvailable}
          >
            {isAvailable ? "Register" : "Sold Out"}
          </button>
        )}

        {isOrganizer && (
          <div style={{ display: "flex", gap: "10px", marginTop: 15 }}>
            <button
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => onViewDetails(ev)} // NEW ACTION: Opens the modal
            >
              View Registrations
            </button>
            <button
              className="btn"
              style={{ backgroundColor: "#e53e3e", flex: 1 }}
              onClick={handleDelete}
            >
              Delete Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
