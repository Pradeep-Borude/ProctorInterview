import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import InterviewRoom from './pages/InterviewRoom';

function InterviewRoomWrapper() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room') || 'test-room';
  const role = searchParams.get('role') || 'interviewee';
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🖥️ Interview Room: {roomId}</h1>
      <p>Role: <strong>{role}</strong></p>
      <InterviewRoom roomId={roomId} role={role} />
    </div>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <Router>  {/* ← BrowserRouter as Router */}
        <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
          <Routes>
            <Route path="/" element={
              <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h1>🎤 ProctorInterview</h1>
                <p style={{ fontSize: '1.2rem' }}>
                  <a 
                    href="/interview?room=test&role=interviewer" 
                    style={{ 
                      display: 'inline-block', 
                      margin: '1rem', 
                      padding: '1rem 2rem',
                      background: '#007bff',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px'
                    }}
                  >
                    👨‍💼 Interviewer
                  </a>
                  <a 
                    href="/interview?room=test&role=interviewee"
                    style={{ 
                      display: 'inline-block', 
                      margin: '1rem', 
                      padding: '1rem 2rem',
                      background: '#28a745',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px'
                    }}
                  >
                    👨‍💼 Interviewee
                  </a>
                </p>
              </div>
            } />
            <Route path="/interview" element={<InterviewRoomWrapper />} />
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  );
}
