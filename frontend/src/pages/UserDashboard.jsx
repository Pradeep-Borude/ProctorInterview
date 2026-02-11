import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../contexts/AuthContext";
import { useSessionRefresh } from "../contexts/SessionContext";

import Navbar from "../components/Navbar";
import "../styles/InterviewerDashboard.css";

export default function InterviewerDashboard() {
  const navigate = useNavigate();
  const { user, setUser, loading } = useAuth();
  const { refreshKey } = useSessionRefresh();

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);


  /*  Fetch sessions (first render + refresh) */
  useEffect(() => {
    if (user) {
      fetchSessions();
    }
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

  // logout function
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

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        {/* HEADER */}
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <div>
            <p>{user.email}</p>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        {/* PROFILE */}
        <section className="profile-section">
          <div className="profile-card">
            <div className="profile-header"></div>

            <div className="profile-info">
              <h2>👋 Welcome, {user.fullName}</h2>
              <p className="business-type">{user.role}</p>
            </div>
          </div>

          <div className="profile-actions">
            <button
              className="btn-primary"
              onClick={() => navigate("/interview/create")}
            >
              Host an interview
            </button>

            <button
              className="btn-primary"
              onClick={() => navigate("/interview/join")}
            >
              Join a meeting
            </button>
          </div>
        </section>

        {/* INTERVIEWS */}
        <section className="products-section">
          <div className="products-header">
            <h3>Past Interviews</h3>
          </div>

          {sessionsLoading ? (
            <p>Loading interviews...</p>
          ) : sessions.length === 0 ? (
            <div className="no-products">
              <p>No interviews yet.</p>
            </div>
          ) : (
            <ul className="interview-list">
              {sessions.map((session) => (
                <li key={session._id} className="interview-card">
                  <p>
                    <strong>Room:</strong> {session.roomId}
                  </p>
                  <p>
                    <strong>Status:</strong> {session.status}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(session.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      

      
      </div>
    </>
  );
}
