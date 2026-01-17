import { useEffect, useRef, useState } from "react";
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

  // LIVE INDICATORS
  const [indicators, setIndicators] = useState({
    focus: true,
    mouse: true,
    resize: true,
  });

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  // EVENT COUNTERS
  const countersRef = useRef({
    focusLost: 0,
    screenResize: 0,
    inactiveMouse: 0,
  });

  // PREVIOUS SNAPSHOT
  const prevMetricsRef = useRef({
    isFocused: true,
    mouseActive: true,
    resize: false,
  });

  // RESIZE TRACKER
  const resizeRef = useRef({
    resized: false,
    timer: null,
  });

  // VERIFY ROOM
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
      }
    }
    verifyRoom();
  }, [roomId]);

  // GET MEDIA
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

  // WEBRTC
  useEffect(() => {
    if (!socket || !stream || !role) return;

    socket.emit("join-room", { roomId, role });

    const peer = new SimplePeer({
      initiator: role === "interviewer",
      trickle: false,
      stream,
    });

    peer.on("signal", (data) => {
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

    const onResize = () => {
      resizeRef.current.resized = true;

      clearTimeout(resizeRef.current.timer);
      resizeRef.current.timer = setTimeout(() => {
        resizeRef.current.resized = false;
      }, 1000);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    const interval = setInterval(() => {
      socket.emit("proctor-data", {
        isFocused: document.hasFocus(),
        mouseActive: Date.now() - lastMouseMove < 2000,
        resize: resizeRef.current.resized,
      });
    }, 1000);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      clearInterval(interval);
    };
  }, [socket, role]);

  // RECEIVE + AGGREGATE (INTERVIEWER)
  useEffect(() => {
    if (!socket || role !== "interviewer") return;

    const handler = (payload) => {
      const { isFocused, mouseActive, resize } = payload.metrics;
      const prev = prevMetricsRef.current;
// checks for prevous state && current state to increment counters
      if (prev.isFocused && !isFocused)
        countersRef.current.focusLost++;

      if (prev.mouseActive && !mouseActive)
        countersRef.current.inactiveMouse++;

      if (!prev.resize && resize)
        countersRef.current.screenResize++;

      prevMetricsRef.current = { isFocused, mouseActive, resize };

      setIndicators({
        focus: isFocused,
        mouse: mouseActive,
        resize: !resize,
      });
    };

    socket.on("proctor-update", handler);
    return () => socket.off("proctor-update", handler);
  }, [socket, role]);

  // RISK SCORE
  const calculateRiskScore = (counters) =>
    counters.focusLost * 2 +
    counters.screenResize * 3 +
    counters.inactiveMouse * 1;

  const calculateStatus = (score) => {
    if (score >= 20) return "HIGH_RISK";
    if (score >= 12) return "SUSPICIOUS";
    return "NORMAL";
  };

  // END CALL
  const handleEndCall = async () => {
    const confirmed = window.confirm("End interview?");
    if (!confirmed) return;

    try {
      socket.emit("leave-room", { roomId });

      peerRef.current?.destroy();
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
            screenResizeCount: counters.screenResize,
            inactiveMouseCount: counters.inactiveMouse,
            riskScore,
            status,
          },
          { withCredentials: true }
        );
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  if (!role) return <h2>Verifying room...</h2>;

  return (
    <>
      <div className="proctor-panel">
        <div className="localVideoRefContainer">
          <h3>You ({role})</h3>
          <video ref={localVideoRef} autoPlay muted playsInline />
        </div>

        <div className="RemoteVideoRefContainer">
          <h3>{connected ? "Remote User" : "Waiting..."}</h3>
          <video ref={remoteVideoRef} autoPlay muted playsInline />
        </div>

        <button className="endBTN" onClick={handleEndCall}>
          End Call
        </button>
      </div>

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
          <Indicator label="Screen Resize" ok={indicators.resize} icon="🖥️" />
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
