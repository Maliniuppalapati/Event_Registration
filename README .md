# College Events Registration System
## Project Overview
This is a full-stack web application designed to streamline the event registration process for college
students and faculty organizers. Built with the MERN stack (MongoDB, Express, React, Node.js), the
system provides dedicated dashboards for different user roles, handles secure authentication, and
manages event seat availability in real-time.
## Features
### Student (student)
- Event Browsing: View all upcoming college events.
- Single Registration: Easily register for an event (fixed 1 ticket per student per event).
- My Bookings: View a history of all registered events and total price paid.
### Organizer (organizer)
- Event Creation: Add new events with date, location, seats, price, and image URL.
- Registration Tracking: See live student registration count for each event.
- Event Management: Delete events and clean up related bookings.
## Technical Features
- Role-Based Access Control (RBAC)
- Secure Authentication using JWT and bcryptjs
- Real-time Seat Management
## Technology Stack
Frontend: React.js, CSS, React Router DOM
Backend: Node.js, Express.js
Database: MongoDB
Authentication: JWT, bcryptjs
## Getting Started
### Prerequisites
- Node.js
- MongoDB (local or Atlas)
### Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env`
4. `npm run dev`
### Frontend Setup
1. `cd college-events-frontend`
2. `npm install`
3. `npm start`
## Environment Variables
Add these to `.env`:
- MONGO_URI
- JWT_SECRET
- PORT
- ORGANIZER_EMAIL
- ORGANIZER_PASSWORD_PLAIN
## Usage & Demo Accounts
- Student: Register using `/register`
- Organizer: Use credentials from `.env`
## Project Structure
backend/
config/
middleware/
models/
routes/
.env
server.js
college-events-frontend/
public/
src/
components/
pages/
utils/
styles.css
