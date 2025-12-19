// src/pages/Home.jsx
import "../styles/home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  // Host (interviewer) button
  const handleHost = () => {
    // abhi ke liye fixed room id; baad me yahan uuid generate kar sakte ho
    navigate("/interview?room=test&role=interviewer");

       // simple session/room id (baad me uuid use kar sakte ho)
    // const roomId = crypto.randomUUID().slice(0, 8);

    // // meeting start time abhi ke liye (ISO string)
    // const startTime = new Date().toISOString();

    //     navigate(`/interview?room=${roomId}&role=interviewer&start=${encodeURIComponent(startTime)}`);


  };

  // Join (interviewee) button
  const handleJoin = () => {
    navigate("/interview?room=test&role=interviewee");
  };

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <div className="hero-section">
        <h1 className="hero-title">ProctorInterview workspace</h1>
        <p className="hero-subtitle">
          connect by heart, bridge the distance
        </p>
      </div>

      <h1 className="hero-title">Welcome</h1>

      <div className="products-header1"></div>

      <div className="btns">
        <div className="i-buttons">
          <button className="custom-hover-btn" onClick={handleHost}>
            <span className="btn-text">Host a Interview</span>
            <span className="btn-bg-wrapper">
              <span className="btn-bg"></span>
            </span>
          </button>

          <button className="custom-hover-btn" onClick={handleJoin}>
            <span className="btn-text">Join a Interview</span>
            <span className="btn-bg-wrapper">
              <span className="btn-bg"></span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
