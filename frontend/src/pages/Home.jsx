import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/home.css";

export default function LandingPage() {
  const navigate = useNavigate();


  const features = [
    { icon: "🎥", title: "Secure Video Calls", desc: "End-to-end encrypted 1:1 interviews" },
    { icon: "🛡️", title: "Live Proctoring", desc: "Real-time tab switch & distraction detection" },
    { icon: "⚡", title: "Instant Setup", desc: "No downloads, works on any device" },
    { icon: "📊", title: "Risk Reports", desc: "Detailed proctoring analytics post-interview" },
  ];

  return (
    <>
      {/* Navbar */}
      <Navbar />

      <div className="page-container">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-grid">

            {/* Left Content */}
            <div className="hero-content">
              <h1 className="hero-title">
                Secure Video Interviews <br />
                <span className="gradient-text">with Live Proctoring</span>
              </h1>

              <p className="hero-subtitle">
                Detect tab switching, distractions & cheating in real-time.
                Hire confidently with complete session transparency.
              </p>

              {/* CTAs */}
              <div className="hero-cta">
                <Link to="/hostInterview" className="custom-hover-btn">
                  <span className="btn-text">HOST INTERVIEW</span>
                  <span className="btn-bg-wrapper">
                    <span className="btn-bg"></span>
                  </span>
                </Link>

                 <Link to="/joinroom" className="custom-hover-btn">
                  <span className="btn-text">JOIN INTERVIEW</span>
                  <span className="btn-bg-wrapper">
                    <span className="btn-bg"></span>
                  </span>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="social-proof">
                Trusted by 500+ recruiters | 10K+ secure interviews conducted
              </div>
            </div>

            {/* Right Visual */}
            <div className="hero-visual">
              <div className="mock-card">
                <div className="mock-layout">

                  <div className="video-grid">
                    <div className="icons">👨‍💼</div>
                    <div className="icons">👨‍💻</div>
                  </div>

                  <div className="proctor-panel">
                    <div className="panel-title">🛡️ Live Proctor Status</div>

                    <div className="panel-status">
                      <span className="ok">✅ Tab Focus: OK</span>
                      <span className="warn">⚠️ Mouse: Idle</span>
                    </div>

                    <div className="risk">Risk: LOW</div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Features Section */}
        <section className="features">
          <div className="features-container">
            <h2 className="features-title">Why Choose ProctorInterview?</h2>
            <p className="features-subtitle">
              Everything you need for secure, professional remote interviews
            </p>

            <div className="features-grid">
              {features.map((feature, i) => (
                <div key={i} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>


    </>
  );
}
