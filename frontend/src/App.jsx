// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useSearchParams } from "react-router-dom";
import { SocketProvider } from "./contexts/SocketContext";
import InterviewRoom from "./pages/InterviewRoom";
import Home from "./pages/Home";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import UserDashboard from "./pages/UserDashboard";
import "./styles/global.css";
import HostInterview from "./pages/HostInterview";
import JoinRoom from "./pages/JoinRoom";

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
    <SocketProvider>
      <Router>
        <div >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/user/register" element={<UserRegister />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/hostInterview" element={<HostInterview />} />
            <Route path="/interview/:roomId" element={<InterviewRoomWrapper />} />
            <Route path="/joinroom" element={<JoinRoom />} />
                <Route path="*" element={<Home />} />
                {/* https://i.pinimg.com/originals/f3/56/3e/f3563e945aa9c7c37dccacf53ba603a0.gif */}
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  );
}
