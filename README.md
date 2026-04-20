# Proctor Interview Platform

A MERN-stack web application for conducting online technical interviews with **live video communication + basic proctoring/monitoring features**.

This project allows an interviewer to create interview sessions, invite a candidate using a room ID, conduct a real-time video interview, and monitor suspicious behavior during the interview using browser activity indicators.

## Main Purpose

The goal of this project is to reduce cheating during online interviews by combining:

* Real-time video interview rooms
* Live browser activity monitoring
* Session-based interview management
* Risk score calculation after interview completion

It is designed for interviewers who want better visibility during remote interviews.

---

## Key Features

### Authentication System

* User registration and login
* JWT-based authentication using cookies
* Protected routes for authenticated users
* Role-based user handling

### Interview Session Management

* Host creates interview session with:

  * Room ID
  * Date
  * From / To time
* Prevents multiple active sessions for the same host
* Candidate joins using valid room ID
* Automatic role assignment:

  * Interviewer
  * Interviewee

### Real-Time Video Interview

* Peer-to-peer video/audio communication using **WebRTC**
* Signaling handled using **Socket.IO**
* Live room join/leave events
* Remote participant connection status

### Live Proctoring System

During the interview, the interviewee is monitored for:

* Browser tab focus loss
* Window resize activity
* Mouse inactivity

These events are sent in real time to the interviewer.

### Risk Analysis

After interview completion:

* Event counters are stored
* Risk score is calculated
* Final status generated:

  * NORMAL
  * SUSPICIOUS
  * HIGH_RISK

### Dashboard

* Interviewer can view hosted sessions
* Candidate can view completed sessions
* Session details include participant information and proctoring summary

---

## Tech Stack

## Frontend

* React
* Vite
* React Router
* Axios
* Socket.IO Client
* Simple Peer (WebRTC)
* CSS

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Socket.IO
* JWT Authentication
* Cookie Parser
* bcrypt
* CORS

---

## Project Structure

```text
frontend/
  src/
    components/
    contexts/
    pages/
    styles/

backend/
  src/
    controllers/
    models/
    routes/
    middlewares/
    db/
```

---

## How It Works

### Interview Flow

1. User registers and logs in
2. Interviewer creates a session
3. A room ID is generated/used for the interview
4. Candidate joins using the room ID
5. WebRTC establishes video connection
6. Interviewee activity is monitored continuously
7. Interviewer sees live proctor indicators
8. When interview ends:

   * metrics are saved
   * risk score is calculated
   * session status is updated

---

## Local Setup

## 1. Clone Repository

```bash
git clone https://github.com/Pradeep-Borude/ProctorInterview
cd ProctorInterview
```

## 2. Backend Setup

```bash
cd backend
npm install
npm run start
```

Create a `.env` file inside `backend/`

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

Backend runs on:

```text
http://localhost:3000
```

---

## Highlights

This project demonstrates practical experience with:

* MERN-stack application development
* Real-time systems using Socket.IO
* WebRTC peer-to-peer communication
* Authentication and authorization
* MongoDB schema design
* Protected routes and session management
* Live event monitoring and aggregation
* Business logic implementation for risk scoring
* Role-based dashboard workflows

This is not just a CRUD project — it includes real-time communication and interview monitoring logic that reflects real-world product thinking.

---

## Future Improvements

Possible future enhancements:

* Screen sharing support
* Recording interviews
* AI-based cheating detection
* Admin panel
* Interview reports export
* Email invite system

---

## Screenshots

## Home page

<img width=" " height=" " alt="image" src="https://github.com/user-attachments/assets/78214708-2f5a-44f9-a872-1c598dd505b3" />

## Login page
<img width="939" height="471" alt="image" src="https://github.com/user-attachments/assets/b5cb3494-0d5e-4c94-8f78-44496a95b183" />

##  Register page
<img width="854" height="632" alt="image" src="https://github.com/user-attachments/assets/873f6dfd-1d6c-40e6-ba4f-6eb4dbaf7621" />

##  HostInterview page
<img width="939" height="477" alt="image" src="https://github.com/user-attachments/assets/54b384bb-3b16-4d3d-9c90-5ed9a18431cf" />

## Join Interview page
<img width="854" height="424" alt="image" src="https://github.com/user-attachments/assets/621139f4-c219-4fa7-b75e-59dfa2267e5c" />

## Room page (interviewer View)
<img width="939" height="678" alt="image" src="https://github.com/user-attachments/assets/7401a6a3-172b-4311-9580-fdf508366bf8" />

## Room page (Candidate View)
<img width="833" height="419" alt="image" src="https://github.com/user-attachments/assets/88a163bb-1f7f-4d97-beb2-12ecbd44f03f" />


## Dashboard page(with risk summary)
<img width="853" height="622" alt="image" src="https://github.com/user-attachments/assets/5850d77a-1d9d-4bc9-a76d-3eea2bfe1406" />

---
## Author

**Pradeep Borude**

 MERN Stack Developer | React / Node.js

Focused on building practical projects that solve real problems and improve hiring workflows.
