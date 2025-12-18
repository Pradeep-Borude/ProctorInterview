// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useSearchParams } from "react-router-dom";
import { SocketProvider } from "./contexts/SocketContext";
import InterviewRoom from "./pages/InterviewRoom";
import Home from "./pages/Home";
import UserLogin from "./pages/UserLogin";
import "./styles/global.css";

function InterviewRoomWrapper() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("room") || "test-room";
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
            <Route path="/" element={<UserLogin />} />
            <Route path="/home" element={<Home />} />
            <Route path="/interview" element={<InterviewRoomWrapper />} />
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  );
}
