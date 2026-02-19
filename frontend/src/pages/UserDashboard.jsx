import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../contexts/AuthContext";
import { useSessionRefresh } from "../contexts/SessionContext";

import Navbar from "../components/Navbar";
import "../styles/InterviewerDashboard.css";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, setUser, loading } = useAuth();
  const { refreshKey } = useSessionRefresh();

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (user) fetchSessions();
  }, [refreshKey, user]);

  async function fetchSessions() {
    try {
      setSessionsLoading(true);
      const res = await axios.get(
        "http://localhost:3000/api/session/my-sessions",
        { withCredentials: true }
      );
      setSessions(res.data.sessions || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setSessionsLoading(false);
    }
  }

  async function logout() {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/auth/user/logout",
        { withCredentials: true }
      );
      alert(res.data.message);
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Logout failed");
    }
  }

  function toggleRow(id) {
    setExpandedId(expandedId === id ? null : id);
  }

  function getDuration(start, end) {
    if (!start || !end) return "-";
    const diff = new Date(end) - new Date(start);
    return Math.round(diff / 60000) + " min";
  }

  // ✅ ROLE-BASED LOGIC (Add these lines!)
  const isInterviewer = user?.role === 'interviewer';
  const partnerData = isInterviewer ? 'candidateData' : 'hostData';
  const partnerLabel = isInterviewer ? 'Candidate' : 'Interviewer';

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!user) return null;

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <div>
            <p>{user.email}</p>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <section className="profile-section">
          <div className="profile-card">
            <div className="profile-header"></div>
            <div className="profile-info">
              <h2>👋 Welcome, {user.fullName}</h2>
              <p className="user-type">
                {isInterviewer ? 'Interviewer' : 'Candidate'}
              </p>
            </div>
          </div>

          <div className="profile-actions">
            <button
              className="btn-primary"
              onClick={() => navigate("/hostInterview")}
            >
              Host an interview
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate("/joinroom")}
            >
              Join a meeting
            </button>
          </div>
        </section>

        <section className="session-List">
          <div className="session-header">
            <h3>
              {isInterviewer 
                ? "Past Interviews" 
                : "My Interview Attempts"
              }
            </h3>
          </div>

          {sessionsLoading ? (
            <p>Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <div className="no-products">
              <p>{isInterviewer ? "No interviews yet." : "No attempts yet."}</p>
            </div>
          ) : (
            <table className="interview-table">
              <thead>
                <tr>
                  <th></th>
                  <th>{partnerLabel}</th>
                  <th>Date</th>
                  {isInterviewer && <th>Duration</th>}
                  {isInterviewer && <th>Risk</th>}
                </tr>
              </thead>

              <tbody>
                {sessions.map((s) => {
                  const isOpen = expandedId === s._id;
                  const partnerName = s[partnerData]?.fullName || "-";
                  
                  const duration = isInterviewer 
                    ? getDuration(s.createdAt, s.endedAt)
                    : "-";

                  const totalViolations =
                    (s.focusLostCount || 0) +
                    (s.screenResizeCount || 0) +
                    (s.inactiveMouseCount || 0);

                  return (
                    <>
                      <tr
                        key={s._id}
                        className="session-row"
                        onClick={() => toggleRow(s._id)}
                      >
                        <td>{isOpen ? "▼" : "▶"}</td>
                        <td>{partnerName}</td>
                        <td>{s.date || "-"}</td>
                        {isInterviewer && <td>{duration}</td>}
                        {isInterviewer && (
                          <td className={`risk-${(s.riskStatus || "normal").toLowerCase()}`}>
                            {s.riskStatus || "NORMAL"} ({s.riskScore || 0})
                          </td>
                        )}
                      </tr>

                      {isOpen && (
                        <tr className="details-row">
                          <td colSpan={isInterviewer ? "5" : "3"}>
                            <div className="details-box">
                              <p><strong>{partnerLabel}:</strong> {partnerName}</p>
                              <p><strong>Room ID:</strong> {s.roomId}</p>
                              
                              {isInterviewer && (
                                <>
                                  <p><strong>Total Violations:</strong> {totalViolations}</p>
                                  <p><strong>Focus Lost:</strong> {s.focusLostCount || 0}</p>
                                  <p><strong>Screen Resize:</strong> {s.screenResizeCount || 0}</p>
                                  <p><strong>Inactive Mouse:</strong> {s.inactiveMouseCount || 0}</p>
                                  <p><strong>Risk Score:</strong> {s.riskScore || 0}</p>
                                </>
                              )}
                              
                              <p><strong>Started:</strong> {s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}</p>
                              <p><strong>Ended:</strong> {s.endedAt ? new Date(s.endedAt).toLocaleString() : "-"}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
}
