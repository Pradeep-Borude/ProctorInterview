import { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer/simplepeer.min.js";
import { useSocket } from "../contexts/SocketContext";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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
    fullscreen: true,
  });

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  // EVENT COUNTERS (AGGREGATED)
  const countersRef = useRef({
    focusLost: 0,
    fullscreenExit: 0,
    inactiveMouse: 0,
  });

  // PREVIOUS METRICS SNAPSHOT
  const prevMetricsRef = useRef({
    isFocused: true,
    mouseActive: true,
    fullscreen: true,
  });

  // verify ROOM  and the ROLE
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

  // WEBRTC + SIGNALING (offer , sdp created)
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

  // SEND PROCTOR DATA ( from INTERVIEWEE)
  useEffect(() => {
    if (!socket || role !== "interviewee") return;

    let lastMouseMove = Date.now();

    const onMouseMove = () => {
      lastMouseMove = Date.now();
    };

    window.addEventListener("mousemove", onMouseMove);

    const interval = setInterval(() => {
      socket.emit("proctor-data", {
        isFocused: document.hasFocus(),
        mouseActive: Date.now() - lastMouseMove < 2000,
        fullscreen: !!document.fullscreenElement,
      });
    }, 500);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      clearInterval(interval);
    };
  }, [socket, role]);

  // RECEIVE + AGGREGATE ( to INTERVIEWER)
  useEffect(() => {
    if (!socket || role !== "interviewer") return;

    const handler = (payload) => {
      const { isFocused, mouseActive, fullscreen } = payload.metrics;
      const prev = prevMetricsRef.current;

      //  COUNT OF PROCTOR EVENTS HAPPINING
      if (prev.isFocused && !isFocused)
        countersRef.current.focusLost++;

      if (prev.mouseActive && !mouseActive)
        countersRef.current.inactiveMouse++;

      if (prev.fullscreen && !fullscreen)
        countersRef.current.fullscreenExit++;

      prevMetricsRef.current = { isFocused, mouseActive, fullscreen };

      setIndicators({
        focus: isFocused,
        mouse: mouseActive,
        fullscreen,
      });
    };

    socket.on("proctor-update", handler);

    return () => {
      socket.off("proctor-update", handler);
    };
  }, [socket, role]);

  // RISK CALCULATION FUNCTION
  const calculateRiskScore = (counters) => {
    return (
      counters.focusLost * 2 +
      counters.fullscreenExit * 3 +
      counters.inactiveMouse * 1
    );
  };

  // status CALCULATION FUNCTION

  const calculateStatus = (score) => {
    if (score >= 20) return "HIGH_RISK";
    if (score >= 12) return "SUSPICIOUS";
    return "NORMAL";
  };



  // end call HANDLER (disconnect sockets , cleans up resources , send data )

  const handleEndCall = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to end the interview call? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      socket.emit("leave-room", { roomId });

      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }

      stream?.getTracks().forEach((t) => t.stop());

      // {role check} ONLY INTERVIEWER CAN SUBMIT PROCTOR DATA
      if (role === "interviewer") {
        const counters = countersRef.current;
        const riskScore = calculateRiskScore(counters);
        const status = calculateStatus(riskScore);

        console.log("FINAL COUNTERS:", counters);
        console.log("RISK:", riskScore, status);

        await axios.post(
          "http://localhost:3000/api/auth/session/end",
          {
            roomId,
            focusLostCount: counters.focusLost,
            fullscreenExitCount: counters.fullscreenExit,
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
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      <div>
        <h3>You ({role})</h3>
        <video ref={localVideoRef} autoPlay muted playsInline width="300" />
      </div>

      <div>
        <h3>{connected ? "Remote User" : "Waiting..."}</h3>
        <video ref={remoteVideoRef} autoPlay playsInline width="300" />
      </div>

      {/* SHOW PROCTOR INDICATORS ONLY TO INTERVIEWER */}

      {role === "interviewer" && (
        <div style={{ minWidth: "220px" }}>
          <h3>Live Proctor Indicators</h3>
          <Indicator label="Tab Focus" ok={indicators.focus} />
          <Indicator label="Mouse Active" ok={!indicators.mouse} />
          <Indicator label="Fullscreen" ok={indicators.fullscreen} />
        </div>
      )}

      <button
        onClick={handleEndCall}
        style={{
          marginTop: "20px",
          padding: "10px 16px",
          background: "#e74c3c",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        End Call
      </button>
    </div>
  );
}

    // INDICATOR COMPONENT
function Indicator({ label, ok }) {
  return (
    <div
      style={{
        padding: "8px",
        marginBottom: "8px",
        borderRadius: "6px",
        background: ok ? "#d4f8d4" : "#ffd6d6",
        fontWeight: "bold",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span>{label}</span>
      <span>{ok ? "✅ OK" : "⚠️ ALERT"}</span>
    </div>
  );
}
