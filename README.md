# 🎓 College Event Registration & Ticketing Platform

A full-stack, enterprise-grade event management system built with the MERN stack. Designed to handle high-concurrency ticket bookings, automated waitlist promotion, and secure digital QR-code ticketing.

## 🚀 Key Features

### 1. Concurrency & Race Condition Prevention
* Utilizes **MongoDB Atomic Operators (`$inc`)** during the booking process.
* Guarantees that two users cannot simultaneously book the last remaining seat, preventing database inconsistencies and overbooking.

### 2. Automated Waitlist Management
* Built-in queue system for sold-out events. 
* If a registered student cancels their ticket, the system automatically dequeues the first waitlisted user and assigns them the available seat in real-time.

### 3. Digital QR-Code Ticketing
* Generates unique, scannable **QR Codes** using the `qrcode` library for every successful booking.
* The embedded data securely links to the user's encrypted Booking ID for at-the-door verification.

### 4. Admin & Organizer Tooling
* **Scanner Simulator**: Organizers have access to a real-time ticket verification dashboard to mark attendees as "Present".
* **CSV Data Export**: Backend generation of Excel-ready `.csv` reports of attendee lists using `json2csv`, securely downloadable from the frontend.

### 5. Secure Authentication & UX
* Role-based access control (Student vs Organizer) powered by **JSON Web Tokens (JWT)** and **bcryptjs**.
* Interactive frontend states, including a **Payment Simulator** with dynamic loading animations.
* Global error handling and strict schema validation utilizing **Zod** and `express-async-errors`.

## 💻 Tech Stack
* **Frontend**: React.js, React Router DOM, Axios, Vanilla CSS
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose ORM)
* **Libraries**: `bcryptjs`, `jsonwebtoken`, `qrcode`, `json2csv`, `zod`, `cors`

## 🛠 Installation & Setup

### Prerequisites
* Node.js (v16+)
* MongoDB Atlas Cluster (or local instance)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/event-registration-system.git
cd event-registration-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/college_events?retryWrites=true
JWT_SECRET=your_super_secret_jwt_key
```
Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Start the client:
```bash
npm start
```
The application will run on `http://localhost:3000`.

## 👩‍💻 Usage Guide

### 🧑‍🎓 Student Role
1. **Register/Login** to the platform.
2. Browse available events. If seats are available, click **Register** to process the mock payment and secure a ticket.
3. If an event is full, click **Join Waitlist**.
4. View your **Digital Ticket (QR Code)** under "My Registrations".

### 👨‍💼 Organizer Role
1. Create a user account and change the `role` field in your MongoDB database to `"organizer"`.
2. Log in through the specific **Organizer Login** link on the homepage.
3. **Create new events** with custom seat limits and pricing.
4. View real-time registration data, **Export to CSV**, and use the **Open Scanner** tool to verify Student IDs at the door.

---
*Developed as a Placement Portfolio Project.*
