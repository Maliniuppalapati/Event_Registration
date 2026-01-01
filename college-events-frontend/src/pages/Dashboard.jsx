// C:\Users\U GEYA MALINI\OneDrive\文件\Event_Registration\college-events-frontend\src\pages\Dashboard.jsx

import React, { useEffect, useState } from "react";
import API from "../utils/api";
import EventCard from "../components/EventCard";
import BookingForm from "../components/BookingForm";

// NEW COMPONENT: Displays detailed student list for organizer
const RegistrationDetailModal = ({ eventId, onClose, eventTitle }) => {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Calls the NEW backend route
        const res = await API.get(`/events/registrations/${eventId}`);
        setDetails(res.data.registrations);
      } catch (err) {
        alert(err.response?.data?.msg || "Error fetching details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [eventId]);

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 750 }}>
        <h3 style={{ borderBottom: "none" }}>
          Registered Students for: {eventTitle}
        </h3>
        <div
          style={{
            maxHeight: "450px",
            overflowY: "auto",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          {loading ? (
            <p style={{ padding: 15 }}>Loading registration details...</p>
          ) : details.length === 0 ? (
            <p style={{ padding: 15 }}>No students registered yet.</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #ddd",
                      textAlign: "left",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #ddd",
                      textAlign: "left",
                    }}
                  >
                    Email
                  </th>

                  {/* 🛑 FINAL FIX: Department and Phone No. headings REMOVED */}
                </tr>
              </thead>
              <tbody>
                {details.map((reg, index) => (
                  <tr
                    key={reg._id}
                    style={{
                      borderBottom:
                        index === details.length - 1
                          ? "none"
                          : "1px dashed #eee",
                    }}
                  >
                    {/* Name and Email come from the 'user' sub-object (populated data) */}
                    <td style={{ padding: "10px" }}>
                      {reg.user?.name || "N/A"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {reg.user?.email || "N/A"}
                    </td>

                    {/* 🛑 FINAL FIX: Department and Phone No. DATA COLUMNS REMOVED */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <button className="btn" onClick={onClose} style={{ marginTop: 20 }}>
          Close
        </button>
      </div>
    </div>
  );
};

export default function Dashboard({ user }) {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedEventToBook, setSelectedEventToBook] = useState(null);
  const [selectedEventToView, setSelectedEventToView] = useState(null);
  const [error, setError] = useState("");

  const fetchEvents = async () => {
    try {
      const res = await API.get("/events");
      setEvents(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching events", err);
      setError(err.response?.data?.msg || "Error fetching events");
    }
  };

  const fetchBookings = async () => {
    if (!user) return;
    try {
      if (user.role === "student") {
        const res = await API.get("/bookings/my");
        setBookings(res.data);
      } else if (user.role === "organizer") {
        const res = await API.get("/bookings/event-bookings");
        setBookings(res.data);
      }
      setError("");
    } catch (err) {
      console.error("Error fetching bookings", err);
      setError(err.response?.data?.msg || "Error fetching data");
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await API.delete(`/events/${eventId}`);
      alert("Event successfully deleted!");
      fetchEvents();
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.msg || "Error deleting event");
    }
  };

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchBookings();
    }
  }, [user]);

  if (!user) return <div>Loading...</div>;

  // --- Student View Component (No major changes here) ---
  const StudentDashboard = () => (
    <>
      <h2 className="dashboard-heading">Explore College Events 📢</h2>
      {error && (
        <div className="card" style={{ background: "#fdd", color: "#900" }}>
          {error}
        </div>
      )}

      <div className="event-grid">
        {events.map((e) => (
          <EventCard
            key={e._id}
            ev={e}
            onBook={setSelectedEventToBook}
            userRole={user.role}
          />
        ))}
      </div>

      {/* Modal for Booking Form */}
      {selectedEventToBook && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <BookingForm
              ev={selectedEventToBook}
              onClose={() => setSelectedEventToBook(null)}
              refresh={() => {
                fetchEvents();
                fetchBookings();
              }}
            />
          </div>
        </div>
      )}

      <h2 className="dashboard-heading" style={{ marginTop: 40 }}>
        My Registrations 🎟️
      </h2>
      <div className="bookings-list">
        {bookings.length === 0 ? (
          <div style={{ color: "#666" }}>
            You haven't registered for any events yet.
          </div>
        ) : (
          bookings.map((b) => (
            <div key={b._id} className="booking-item">
              <h4>{b.event?.title || "Unknown Event"}</h4>
              <p>
                Tickets: <strong>{b.tickets}</strong>
              </p>
              <p>
                Total Price: ₹<strong>{b.totalPrice}</strong>
              </p>
              <p className="meta">
                Registered on: {new Date(b.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </>
  );

  // --- Organizer View Component (Updated to show View Registration button) ---
  const OrganizerDashboard = () => (
    <>
      <h2 className="dashboard-heading">Organizer Dashboard 📊</h2>
      {error && (
        <div className="card" style={{ background: "#fdd", color: "#900" }}>
          {error}
        </div>
      )}

      <h3 style={{ marginBottom: 15 }}>Your Created Events</h3>
      <div className="event-grid">
        {events
          .filter((e) => e.createdBy === user.id)
          .map((e) => (
            <EventCard
              key={e._id}
              ev={e}
              userRole={user.role}
              onDelete={deleteEvent}
              onViewDetails={() => setSelectedEventToView(e)}
            />
          ))}
      </div>

      <h3 className="dashboard-heading" style={{ marginTop: 40 }}>
        Registration Summary
      </h3>
      <div className="organizer-summary">
        {bookings.length === 0 ? (
          <div style={{ color: "#666" }}>
            No registrations yet, or you haven't created any events.
          </div>
        ) : (
          bookings.map((b) => {
            const totalRegistered = b.registrations || 0;
            const totalSeats = b.event.totalSeats || 0;
            const availableSeats = totalSeats - totalRegistered;
            return (
              <div
                key={b.event?._id || Math.random()}
                className="organizer-stat-card"
              >
                <div className="event-title">
                  {b.event?.title || "Unknown Event"}
                </div>
                <h4>Total Registered Students</h4>
                <div className="count">{totalRegistered}</div>
                <p>
                  Seats Left: <strong>{availableSeats}</strong> / {totalSeats}
                </p>
                <p style={{ fontSize: "0.9rem", color: "#999" }}>
                  Date: {new Date(b.event.date).toLocaleDateString()}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for Organizer Viewing Details */}
      {selectedEventToView && (
        <RegistrationDetailModal
          eventId={selectedEventToView._id}
          eventTitle={selectedEventToView.title}
          onClose={() => setSelectedEventToView(null)}
        />
      )}
    </>
  );

  return (
    <div>
      {user.role === "student" && <StudentDashboard />}
      {user.role === "organizer" && <OrganizerDashboard />}
    </div>
  );
}
