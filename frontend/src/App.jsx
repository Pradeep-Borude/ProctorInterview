// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useSearchParams } from "react-router-dom";

// contexts
import { SocketProvider } from "./contexts/SocketContext";
import { AuthProvider } from "./contexts/AuthContext";

import "./styles/global.css";


// different pages
import InterviewRoom from "./pages/InterviewRoom";
import Home from "./pages/Home";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import UserDashboard from "./pages/UserDashboard";
import HostInterview from "./pages/HostInterview";
import JoinRoom from "./pages/JoinRoom";
import PageNotFound from "./pages/PageNotFound";

import { ProtectedRoute, UserAlreadyLoggedIn } from "./components/ProtectedRoute"; // protected routes

// room wrapper to extract query params
function InterviewRoomWrapper() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId") || "test-room";
  const role = searchParams.get("role") || "interviewee";

  return (

    <InterviewRoom roomId={roomId} role={role} />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/user/login" element={
                <UserAlreadyLoggedIn>
                  <UserLogin />
                </UserAlreadyLoggedIn>
              }
              />
              <Route path="/user/register" element={
                <UserAlreadyLoggedIn>
                  <UserRegister />
                </UserAlreadyLoggedIn>
              } />


              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>} />

              <Route path="/user/:userId" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>} />

              <Route path="/hostInterview" element={
                <ProtectedRoute>
                  <HostInterview />
                </ProtectedRoute>} />

              <Route path="/interview/:roomId" element={
                <ProtectedRoute>
                  <InterviewRoomWrapper />
                </ProtectedRoute>} />

              <Route path="/joinroom" element={
                <ProtectedRoute>
                  <JoinRoom />
                </ProtectedRoute>} />

              <Route path="*" element={<PageNotFound />} />
            </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
