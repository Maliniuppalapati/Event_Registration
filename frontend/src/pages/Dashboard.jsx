import React, { useEffect, useState, useRef } from "react";
import API from "../utils/api";
import EventCard from "../components/EventCard";
import BookingForm from "../components/BookingForm";
import { Html5Qrcode } from "html5-qrcode";

const ScannerModal = ({ onClose, onScan, details }) => {
  const [manualId, setManualId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const qrCodeInstance = useRef(null);
  const isScanningRef = useRef(false);

  const handleDecodedText = async (scannedText) => {
    try {
      // Stop scanning immediately to prevent double scans
      if (qrCodeInstance.current && isScanningRef.current) {
        isScanningRef.current = false;
        try {
          await qrCodeInstance.current.stop();
        } catch (stopErr) {
          console.error("Error stopping scanner after scan:", stopErr);
        }
        setIsScanning(false);
      }

      // Try to parse as JSON
      let bookingId = scannedText;
      try {
        const data = JSON.parse(scannedText);
        if (data.userId && data.eventId) {
          // Look up corresponding booking in details array
          const match = details.find(reg => reg.user?._id === data.userId);
          if (match) {
            bookingId = match._id;
          } else {
            alert("❌ Student is not registered for this event.");
            onClose();
            return;
          }
        }
      } catch (jsonErr) {
        // Not JSON, treat as raw bookingId
      }

      onScan(bookingId);
    } catch (err) {
      console.error("Error processing QR scan:", err);
      alert("Error scanning ticket.");
      onClose();
    }
  };

  useEffect(() => {
    // 1. Initialize the HTML5 QR Code instance
    const qrReaderId = "qr-reader-viewfinder";
    const html5QrCode = new Html5Qrcode(qrReaderId);
    qrCodeInstance.current = html5QrCode;

    // 2. Start the scanner
    html5QrCode.start(
      { facingMode: "environment" }, // Prefer rear camera
      {
        fps: 10,
        qrbox: (width, height) => {
          const size = Math.min(width, height) * 0.7;
          return { width: size, height: size };
        }
      },
      (decodedText) => {
        handleDecodedText(decodedText);
      },
      (errorMessage) => {
        // Silent verbose scan errors
      }
    )
    .then(() => {
      isScanningRef.current = true;
      setIsScanning(true);
    })
    .catch((err) => {
      console.error("Camera start error:", err);
      setErrorMsg("Unable to access camera. Please check permissions or select a different device.");
    });

    // 3. Cleanup on unmount
    return () => {
      if (html5QrCode && isScanningRef.current) {
        isScanningRef.current = false;
        html5QrCode.stop().catch((err) => {
          console.error("Failed to stop scanner on unmount:", err);
        });
      }
    };
  }, []);

  return (
    <div className="modal-backdrop" style={{ zIndex: 1000 }}>
      <div className="modal-content" style={{ maxWidth: 400, textAlign: "center", backgroundColor: "#111", color: "white" }}>
        <h3 style={{ color: "white", borderBottom: "1px solid #333" }}>📷 Scan QR Code</h3>
        
        {/* Real Camera Feed Viewfinder */}
        <div style={{ position: "relative", width: "100%", height: 250, backgroundColor: "#000", border: "2px solid #333", borderRadius: 8, overflow: "hidden", margin: "20px 0" }}>
          <div id="qr-reader-viewfinder" style={{ width: "100%", height: "100%" }}></div>

          {/* Scanning Laser Animation */}
          {isScanning && (
            <div style={{ width: "100%", height: "2px", backgroundColor: "#00ff00", position: "absolute", top: "50%", boxShadow: "0 0 10px #00ff00", animation: "scan 2s infinite linear", pointerEvents: "none" }}></div>
          )}
          <style>{`
            #qr-reader-viewfinder video {
              width: 100% !important;
              height: 100% !important;
              object-fit: cover !important;
            }
            @keyframes scan { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
          `}</style>
          
          {!isScanning && !errorMsg && (
            <p style={{ position: "absolute", bottom: 10, width: "100%", color: "#888", fontSize: "0.8rem" }}>Initializing camera...</p>
          )}
          {errorMsg && (
            <p style={{ position: "absolute", top: "40%", width: "100%", color: "#ff4d4d", fontSize: "0.9rem", padding: "0 20px" }}>{errorMsg}</p>
          )}
        </div>

        <p style={{ fontSize: "0.9rem", color: "#888", marginBottom: 10 }}>Or enter Booking ID manually (for testing):</p>
        <input 
          type="text" 
          placeholder="Paste Booking ID here" 
          value={manualId} 
          onChange={(e) => setManualId(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 5, border: "none", marginBottom: 15, color: "black" }} 
        />
        <button 
          className="btn" 
          style={{ width: "100%", backgroundColor: "#007bff", marginBottom: 10 }}
          onClick={() => { if(manualId) onScan(manualId); }}
        >
          Verify ID
        </button>
        <button className="btn btn-secondary" style={{ width: "100%", backgroundColor: "#333", color: "white", border: "none" }} onClick={onClose}>
          Close Scanner
        </button>
      </div>
    </div>
  );
};

// NEW COMPONENT: Displays detailed student list for organizer
const RegistrationDetailModal = ({ eventId, onClose, eventTitle }) => {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ borderBottom: "none" }}>Registered Students for: {eventTitle}</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn" 
              style={{ padding: '8px 15px', fontSize: '0.9rem', backgroundColor: '#007bff' }}
              onClick={() => setIsScannerOpen(true)}
            >
              📷 Open Scanner
            </button>
            <button 
              className="btn" 
              style={{ padding: '8px 15px', fontSize: '0.9rem', backgroundColor: '#28a745' }}
            onClick={async () => {
              try {
                const res = await API.get(`/events/export/${eventId}`, { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `event_${eventId}_students.csv`);
                document.body.appendChild(link);
                link.click();
              } catch (err) {
                alert("Error downloading CSV. Make sure you are authorized.");
              }
            }}
          >
            Export to CSV
          </button>
          </div>
        </div>
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
                  <th style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "left" }}>Booking ID (For Scanner)</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "left" }}>Name</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "left" }}>Email</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "left" }}>Action</th>

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
                    <td style={{ padding: "10px", fontFamily: "monospace", color: "#555", fontSize: "0.8rem" }}>{reg._id}</td>
                    <td style={{ padding: "10px" }}>
                      {reg.user?.name || "N/A"}
                    </td>
                    <td style={{ padding: "10px" }}>{reg.user?.email || "N/A"}</td>
                    <td style={{ padding: "10px" }}>
                      {reg.paymentStatus === 'completed' ? 'Paid' : 'Pending'} 
                      {reg.attended ? ' (Attended)' : ''}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {!reg.attended && (
                        <button 
                          style={{ padding: '5px 10px', fontSize: '0.8rem', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                          onClick={async () => {
                            try {
                              await API.post(`/bookings/scan/${reg._id}`);
                              alert('Ticket scanned! Marked as attended.');
                              reg.attended = true;
                              setDetails([...details]);
                            } catch (err) { alert(err.response?.data?.msg || 'Error scanning'); }
                          }}
                        >
                          Verify Ticket
                        </button>
                      )}
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

        {isScannerOpen && (
          <ScannerModal 
            details={details}
            onClose={() => setIsScannerOpen(false)} 
            onScan={async (scannedId) => {
              try {
                await API.post(`/bookings/scan/${scannedId}`);
                alert('✅ Valid Ticket! Marked as attended.');
                
                // Update UI instantly
                setDetails(prev => prev.map(reg => reg._id === scannedId ? { ...reg, attended: true } : reg));
                setIsScannerOpen(false);
              } catch (err) {
                alert(err.response?.data?.msg || '❌ Invalid Ticket or Already Scanned.');
              }
            }} 
          />
        )}
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

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await API.delete(`/bookings/cancel/${bookingId}`);
      alert("Booking cancelled successfully.");
      fetchEvents();
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.msg || "Error cancelling");
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
              {b.paymentStatus === 'pending' && <p style={{color: 'orange'}}>Payment Pending</p>}
              
              {b.qrCode ? (
                <div style={{ marginTop: 15, padding: 10, border: '1px dashed #ccc', borderRadius: 8, display: 'inline-block' }}>
                  <p style={{ margin: "0 0 5px 0", fontSize: "0.85rem", fontWeight: "bold" }}>Your Digital Ticket:</p>
                  <img src={b.qrCode} alt="Ticket QR" style={{ width: 120, height: 120, borderRadius: 8, display: 'block' }} />
                </div>
              ) : (
                <p style={{ color: "#999", fontSize: "0.8rem", marginTop: 10 }}>No QR Code for old tickets.</p>
              )}
              
              <div style={{ marginTop: 10, padding: "5px 10px", backgroundColor: "#f8f9fa", borderRadius: 4, display: "inline-block" }}>
                <p style={{ margin: 0, fontSize: "0.85rem", fontFamily: "monospace", color: "#333", fontWeight: "bold" }}>Booking ID: {b._id}</p>
              </div>

              <div style={{ marginTop: 15 }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ backgroundColor: '#ffebe6', color: '#d93025', border: 'none' }}
                  onClick={() => cancelBooking(b._id)}
                >
                  Cancel Ticket
                </button>
              </div>
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
