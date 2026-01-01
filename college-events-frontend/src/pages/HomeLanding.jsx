// C:\Users\U GEYA MALINI\OneDrive\文件\Event_Registration\college-events-frontend\src\pages\HomeLanding.jsx

import React from "react";
import { Link } from "react-router-dom";

// IMPORTANT: Use a publicly accessible link here (e.g., uploaded to a public folder)
// I will use a functional placeholder for the code structure.
const EVENT_COLLAGE_URL =
  "/collage.png";

// Utility component for a visually distinct section
const FeatureCard = ({ title, icon, description, color }) => (
  <div
    className="card feature-card"
    style={{
      flex: "1 1 250px",
      padding: "30px",
      textAlign: "center",
      borderTop: `4px solid ${color}`,
      borderRadius: "10px",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
      transition: "all 0.3s ease-in-out",
    }}
  >
    <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>{icon}</div>
    <h4 style={{ color: color, marginBottom: "10px", fontWeight: 600 }}>
      {title}
    </h4>
    <p style={{ color: "#6c757d", fontSize: "0.9rem" }}>{description}</p>
  </div>
);

export default function HomeLanding() {
  return (
    // The main container wrapper now spans the full width of the screen content area
    <div style={{ paddingBottom: "0" }}>
      {/* 1. TOP SECTION: Text, Features, and Primary CTAs */}

      {/* 1a. Primary Hero Text */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #007bff, #0056b3)",
          color: "white",
          padding: "50px 20px",
          textAlign: "center",
          marginBottom: "40px",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
        }}
      >
        <h1
          style={{
            fontSize: "3.5rem",
            marginBottom: "15px",
            fontWeight: 700,
            color: "white",
          }}
        >
          YOUR COLLEGE EVENTS HUB
        </h1>
        <p
          style={{
            fontSize: "1.4rem",
            marginBottom: "30px",
            fontWeight: 300,
            color: "#f0f8ff",
          }}
        >
          Unleash your potential. Discover and register for all major campus
          activities in one place.
        </p>
        <Link
          to="/register"
          className="btn"
          style={{
            backgroundColor: "white",
            color: "#007bff",
            padding: "15px 35px",
            fontSize: "1.2rem",
            fontWeight: 700,
            borderRadius: "8px",
          }}
        >
          Start Your Journey &rarr;
        </Link>
      </div>

      {/* 1b. Feature Cards (What's Happening) */}
      <h2
        style={{
          textAlign: "center",
          marginBottom: "35px",
          color: "#0056b3",
          fontWeight: 600,
        }}
      >
        What's Happening This Semester?
      </h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
          marginBottom: "40px",
        }}
      >
        <FeatureCard
          title="Tech & Innovation"
          icon="💻"
          description="Hackathons, AI seminars, and design thinking workshops."
          color="#007bff"
        />
        <FeatureCard
          title="Cultural Showcase"
          icon="🎭"
          description="Dance competitions, drama festivals, and literary meets."
          color="#e36300"
        />
        <FeatureCard
          title="Sports & Athletics"
          icon="🏆"
          description="Intramural championships, volleyball, and fitness challenges."
          color="#28a745"
        />
        <FeatureCard
          title="Professional Growth"
          icon="💼"
          description="Resume reviews, career fairs, and expert guest lectures."
          color="#6f42c1"
        />
      </div>

      {/* 1c. Secondary Call to Action (Login/Register) */}
      <div
        className="card"
        style={{
          marginTop: "20px",
          textAlign: "center",
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
        }}
      >
        <h3 style={{ color: "#343a40", fontWeight: 600, marginTop: 0 }}>
          Don't Miss Out!
        </h3>
        <p style={{ margin: "15px 0 20px 0", fontSize: "1.1rem" }}>
          Log in to view event details and secure your registration slot
          immediately.
        </p>
        <Link to="/login?role=student" className="btn">
          Student Login
        </Link>
        <Link
          to="/register"
          className="btn btn-secondary"
          style={{ marginLeft: "15px" }}
        >
          New Student Registration
        </Link>
      </div>

      {/* 2. BOTTOM SECTION: Full-Width Image to Attract Students */}
      <div
        style={{
          // Container for the image, forcing full-width appearance
          margin: "30px -20px 0 -20px", // Negative margin offsets the .container padding
          width: "calc(100% + 40px)", // Makes it span beyond the container limits
          height: "450px", // Fixed height for visual impact
          overflow: "hidden",
          borderRadius: "0 0 10px 10px",
        }}
      >
        <div
          style={{
            backgroundImage: `url(${EVENT_COLLAGE_URL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            width: "100%",
            height: "100%",
            transition: "transform 0.5s",
          }}
        >
          {/* Subtle overlay over image for final visual polish, no text needed here */}
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.15)", // Very slight dark overlay
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
