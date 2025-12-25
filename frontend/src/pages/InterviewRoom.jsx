import { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer/simplepeer.min.js';
import { useSocket } from '../contexts/SocketContext';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function InterviewRoom() {
  const socket = useSocket();
  const { roomId } = useParams();

  const [role, setRole] = useState(null);
  const [stream, setStream] = useState(null);
  const [connected, setConnected] = useState(false);

  // LIVE INDICATORS STATE
  const [indicators, setIndicators] = useState({
    focus: true,
    mouse: true,
    fullscreen: true,
  });

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  //  VERIFY ROOM
  useEffect(() => {
    async function verifyRoom() {
      try {
        const res = await axios.post(
          'http://localhost:3000/api/auth/session/verify-room',
          { roomId },
          { withCredentials: true }
        );
        setRole(res.data.role);
      } catch {
        alert('Invalid or expired room');
      }
    }
    verifyRoom();
  }, [roomId]);

  //  GET MEDIA
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
      .catch(() => alert('Camera error'));
  }, [role]);

  //  WEBRTC + SIGNALING
  useEffect(() => {
    if (!socket || !stream || !role) return;

    socket.emit('join-room', { roomId, role });

    const peer = new SimplePeer({
      initiator: role === 'interviewer',
      trickle: false,
      stream,
    });

    peer.on('signal', (data) => {
      socket.emit('signal', { roomId, data });
    });

    peer.on('stream', (remote) => {
      setConnected(true);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remote;
      }
    });

    socket.on('signal', ({ data }) => {
      peer.signal(data);
    });

    peerRef.current = peer;

    return () => {
      peer.destroy();
      socket.off('signal');
    };
  }, [socket, stream, role, roomId]);

  //  SEND PROCTOR DATA (INTERVIEWEE)
  useEffect(() => {
    if (!socket || role !== 'interviewee') return;

    let lastMouseMove = Date.now();

    const onMouseMove = () => {
      lastMouseMove = Date.now();
    };

    window.addEventListener('mousemove', onMouseMove);

    const interval = setInterval(() => {
      const metrics = {
        isFocused: document.hasFocus(),
        mouseActive: Date.now() - lastMouseMove < 5000,
        fullscreen: !!document.fullscreenElement,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
      };

      socket.emit('proctor-data', metrics);
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      clearInterval(interval);
    };
  }, [socket, role]);

  //  RECEIVE PROCTOR DATA (INTERVIEWER)
  useEffect(() => {
    if (!socket || role !== 'interviewer') return;

    const handler = (payload) => {

      // SETTING UP LIVE INDICATORS 
      setIndicators({
        focus: payload.metrics.isFocused,
        mouse: payload.metrics.mouseActive,
        fullscreen: payload.metrics.fullscreen,
      });
    };

    socket.on('proctor-update', handler);

    return () => {
      socket.off('proctor-update', handler);
    };
  }, [socket, role]);

  if (!role) return <h2>Verifying room...</h2>;

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      {/* LOCAL VIDEO */}
      <div>
        <h3>You ({role})</h3>
        <video ref={localVideoRef} autoPlay muted playsInline width="300" />
      </div>

      {/* REMOTE VIDEO */}
      <div>
        <h3>{connected ? 'Remote User' : 'Waiting...'}</h3>
        <video ref={remoteVideoRef} autoPlay playsInline width="300" />
      </div>

      {/* INTERVIEWER PANEL */}
      {role === 'interviewer' && (
        <div style={{ minWidth: '220px' }}>
          <h3>Live Proctor Indicators</h3>

          <Indicator label="Tab Focus" ok={indicators.focus} />
          <Indicator label="Mouse Active" ok={indicators.mouse} />
          <Indicator label="Fullscreen" ok={indicators.fullscreen} />

        </div>
      )}
    </div>
  );
}

/*  Indicator UI Component with temprary styles*/
function Indicator({ label, ok }) {
  return (
    <div
      style={{
        padding: '8px',
        marginBottom: '8px',
        borderRadius: '6px',
        background: ok ? '#d4f8d4' : '#ffd6d6',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <span>{label}</span>
      <span>{ok ? '✅ OK' : '⚠️ ALERT'}</span>
    </div>
  );
}
