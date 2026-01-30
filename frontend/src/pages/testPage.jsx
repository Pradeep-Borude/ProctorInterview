import { useEffect, useRef, useState, useCallback } from "react";
import SimplePeer from "simple-peer/simplepeer.min.js";
import { useSocket } from "../contexts/SocketContext";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/InterviewRoom.css";

export default function InterviewRoom() {
  const socket = useSocket();
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [stream, setStream] = useState(null);
  const [connected, setConnected] = useState(false);

  // tracking LIVE INDICATORS 
  const [indicators, setIndicators] = useState({
    focus: true,
    mouse: true,
    screenResize: false, // NEW: Screen resize indicator
  });

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  // EVENT COUNTERS (AGGREGATED)
  const countersRef = useRef({
    focusLost: 0,
    screenResizeCount: 0,
    inactiveMouse: 0,
  });

  // RESIZE TRACKING STATE
  const [resizeCount, setResizeCount] = useState(0);
  const resizeTimerRef = useRef(null);
  const prevWidthRef = useRef(window.innerWidth);

  // PREVIOUS METRICS SNAPSHOT
  const prevMetricsRef = useRef({
    isFocused: true,
    mouseActive: true,
    screenResized: false,
  });

  // verify ROOM and the ROLE
  useEffect(() => {
    async function verifyRoom() {
      try {
        const res = await axios.post(
          "http://localhost:3000/api/auth/session/verify-room",
          { roomId },
          { withCredentials: true }
        );
        setRole(res.data.role);
      } catch {
        alert("Invalid or expired room");
        navigate("/dashboard");
      }
    }
    verifyRoom();
  }, [roomId, navigate]);

  // SCREEN RESIZE DETECTION (INTERVIEWEE ONLY)
  const handleResize = useCallback(() => {
    if (role !== "interviewee") return;

    clearTimeout(resizeTimerRef.current);
    
    resizeTimerRef.current = setTimeout(() => {
      const currentWidth = window.innerWidth;
      const widthDiff = Math.abs(currentWidth - prevWidthRef.current);
      
      // Only count significant resize (>50px)
      if (widthDiff > 50) {
        setResizeCount(prev => prev + 1);
        countersRef.current.screenResizeCount++;
        prevWidthRef.current = currentWidth;
        
        // Emit resize event
        socket.emit("proctor-event", { 
          type: "SCREEN_RESIZE", 
          roomId,
          resizeCount: countersRef.current.screenResizeCount 
        });
        
        // Update indicator
        setIndicators(prev => ({ ...prev, screenResize: true }));
        
        console.log("🚨 Screen Resize Detected! Count:", countersRef.current.screenResizeCount);
      }
    }, 300); // Debounce 300ms
  }, [role, socket, roomId]);

  // GET USERS CAMERA and MIC
  useEffect(() => {
    if (!role) return;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((media) => {
        setStream(media);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = media;
        }
      })
      .catch(() => alert("Camera / Mic error"));
  }, [role]);

  // WEBRTC + SIGNALING
  useEffect(() => {
    if (!socket || !stream || !role) return;

    socket.emit("join-room", { roomId, role });

    const peer = new SimplePeer({
      initiator: role === "interviewer",
      trickle: false,
      stream,
    });

    peer.on("signal", (data) => {
      console.log("Peer signal data:", data);
      socket.emit("signal", { roomId, data });
    });

    peer.on("stream", (remote) => {
      setConnected(true);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remote;
      }
    });

    socket.on("signal", ({ data }) => {
      peer.signal(data);
    });

    peerRef.current = peer;

    return () => {
      peer.destroy();
      socket.off("signal");
    };
  }, [socket, stream, role, roomId]);

  // SEND PROCTOR DATA (INTERVIEWEE)
  useEffect(() => {
    if (!socket || role !== "interviewee") return;

    let lastMouseMove = Date.now();

    const onMouseMove = () => {
      lastMouseMove = Date.now();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", handleResize);

    const interval = setInterval(() => {
      socket.emit("proctor-data", {
        metrics: {
          isFocused: document.hasFocus(),
          mouseActive: Date.now() - lastMouseMove < 2000,
          screenResize: indicators.screenResize,
          resizeCount: countersRef.current.screenResizeCount,
        }
      });
      
      console.log("📊 Proctor Data:", {
        focus: document.hasFocus(),
        mouseActive: Date.now() - lastMouseMove < 2000,
        resizeCount: countersRef.current.screenResizeCount
      });
    }, 2000);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    };
  }, [socket, role, roomId, handleResize, indicators.screenResize]);

  // RECEIVE + AGGREGATE (INTERVIEWER)
  useEffect(() => {
    if (!socket || role !== "interviewer") return;

    const proctorDataHandler = (payload) => {
      const { metrics } = payload;
      const { isFocused, mouseActive, screenResize } = metrics;
      const prev = prevMetricsRef.current;

      // COUNT CHANGES
      if (prev.isFocused && !isFocused) {
        countersRef.current.focusLost++;
      }

      if (prev.mouseActive && !mouseActive) {
        countersRef.current.inactiveMouse++;
      }

      if (!prev.screenResized && screenResize) {
        countersRef.current.screenResizeCount++;
      }

      prevMetricsRef.current = { 
        isFocused, 
        mouseActive, 
        screenResized: screenResize 
      };

      setIndicators({
        focus: isFocused,
        mouse: mouseActive,
        screenResize: screenResize,
      });
    };

    const proctorEventHandler = ({ type }) => {
      if (type === "SCREEN_RESIZE") {
        countersRef.current.screenResizeCount++;
        setIndicators(prev => ({ ...prev, screenResize: true }));
        console.log("🚨 Screen Resize Event from candidate!");
      }
    };

    socket.on("proctor-data", proctorDataHandler);
    socket.on("proctor-event", proctorEventHandler);

    return () => {
      socket.off("proctor-data", proctorDataHandler);
      socket.off("proctor-event", proctorEventHandler);
    };
  }, [socket, role]);

  // RISK CALCULATION
  const calculateRiskScore = (counters) => {
    return (
      counters.focusLost * 2 +
      counters.screenResizeCount * 3 +
      counters.inactiveMouse * 1
    );
  };

  // STATUS CALCULATION
  const calculateStatus = (score) => {
    if (score >= 20) return "HIGH_RISK";
    if (score >= 12) return "SUSPICIOUS";
    return "NORMAL";
  };

  // END CALL HANDLER
  const handleEndCall = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to end the interview call?"
    );

    if (!confirmed) return;

    try {
      socket.emit("leave-room", { roomId });

      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }

      stream?.getTracks().forEach((t) => t.stop());

      if (role === "interviewer") {
        const counters = countersRef.current;
        const riskScore = calculateRiskScore(counters);
        const status = calculateStatus(riskScore);

        await axios.post(
          "http://localhost:3000/api/auth/session/end",
          {
            roomId,
            focusLostCount: counters.focusLost,
            screenResizeCount: counters.screenResizeCount,
            inactiveMouseCount: counters.inactiveMouse,
            riskScore,
            status,
          },
          { withCredentials: true }
        );
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Error ending session", err);
    }
  };

  if (!role) return <h2>Verifying room...</h2>;

  return (
    <>
      <div className="proctor-panel">
        <div className="localVideoRefContainer">
          <h3>You ({role})</h3>
          <video className="video" ref={localVideoRef} autoPlay muted playsInline />
        </div>

        <div className="RemoteVideoRefContainer">
          <h3>{connected ? "Remote User" : "Waiting..."}</h3>
          <video className="video" ref={remoteVideoRef} autoPlay playsInline />
        </div>
        
        <div className="mediaBTNS">
          <button className="endBTN" onClick={handleEndCall}>
            🚪 End Call
          </button>
        </div>
      </div>

      {/* PROCTOR INDICATORS - INTERVIEWER ONLY */}
      {role === "interviewer" && (
        <div className="proctorEventContainer">
          <div className="proctor-header">
            <div className="header-icon">🔍</div>
            <h1>Live Proctor Indicators</h1>
            <div 
              className="status-dot" 
              style={{ 
                backgroundColor: 
                  indicators.focus && 
                  indicators.mouse && 
                  !indicators.screenResize ? '#10b981' : '#ef4444'
              }}
            />
          </div>

          <div className="indicators-grid">
            <Indicator label="Tab Focus" ok={indicators.focus} icon="📱" />
            <Indicator label="Mouse Activity" ok={indicators.mouse} icon="🖱️" />
            <Indicator 
              label={`Screen Resize (${countersRef.current.screenResizeCount})`} 
              ok={!indicators.screenResize} 
              icon="🔄" 
            />
          </div>
        </div>
      )}
    </>
  );
}

function Indicator({ label, ok, icon }) {
  return (
    <div className={`indicator ${ok ? 'success' : 'alert'}`}>
      <div className="indicator-left">
        <div className="icon-wrapper">
          <span className="indicator-icon">{icon}</span>
        </div>
        <div className="indicator-content">
          <div className="label">{label}</div>
          <div className={`status-text ${ok ? 'success-text' : 'alert-text'}`}>
            {ok ? 'OK' : 'ALERT'}
          </div>
        </div>
      </div>
      <div className={`status-badge ${ok ? 'success' : 'alert'}`}>
        {ok ? '✅ OK' : '⚠️ ALERT'}
      </div>
    </div>
  );
}
