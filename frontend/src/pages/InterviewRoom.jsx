// src/pages/InterviewRoom.jsx
import { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer/simplepeer.min.js';
import { useSocket } from '../contexts/SocketContext';

export default function InterviewRoom({ roomId, role }) {
  const socket = useSocket();

  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connected, setConnected] = useState(false);

  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // 1) Get camera/mic
  useEffect(() => {
    async function getMedia() {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(media);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = media;
        }
        console.log('Got local media for', role);
      } catch (err) {
        console.error('Media error:', err);
      }
    }
    getMedia();
  }, [role]);

  // 2) Join room + setup SimplePeer signaling
  useEffect(() => {
    if (!socket || !stream) return;

    console.log('Setting up peer, role =', role, 'roomId =', roomId);

    socket.emit('join-room', { roomId, role });

    const isInitiator = role === 'interviewer';
    console.log('isInitiator:', isInitiator);

    const peer = new SimplePeer({
      initiator: isInitiator,
      trickle: false,
      stream,
    });

    peer.on('signal', (data) => {
      console.log('peer signal from', role, 'type =', data.type);
      socket.emit('signal', { roomId, data });
    });

    peer.on('connect', () => {
      console.log('WEBRTC CONNECTED for', role);
    });

    peer.on('stream', (remote) => {
      console.log('REMOTE STREAM for', role);
      setConnected(true);
      setRemoteStream(remote);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remote;
      }
    });

    peer.on('error', (err) => console.error('Peer error:', role, err));

    peerRef.current = peer;

    const signalHandler = ({ from, data }) => {
      console.log('received signal on', role, 'from', from, 'type =', data.type);
      peer.signal(data);
    };

    socket.on('signal', signalHandler);

    const userLeftHandler = ({ socketId }) => {
      console.log('user-left received on', role, 'for socket', socketId);
      setConnected(false);
      setRemoteStream(null);
    };

    socket.on('user-left', userLeftHandler);

    return () => {
      console.log('Cleaning up peer for', role);
      socket.off('signal', signalHandler);
      socket.off('user-left', userLeftHandler);
      peer.destroy();
    };
  }, [socket, stream, roomId, role]);

  // 3) Basic proctoring (interviewee side)
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
        timestamp: Date.now(),
      };
      socket.emit('proctor-data', metrics);
    }, 2000);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      clearInterval(interval);
    };

  useEffect()
  }, [socket, role]);

  // 4) Receive proctoring (interviewer side)
  const [proctorEvents, setProctorEvents] = useState([]);

  useEffect(() => {
    if (!socket || role !== 'interviewer') return;

    const handler = (payload) => {
      setProctorEvents((prev) => [...prev.slice(-20), payload]); // keep last 20
    };

    socket.on('proctor-update', handler);

    return () => {
      socket.off('proctor-update', handler);
    };
  }, [socket, role]);

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <div>
        <h2>You ({role})</h2>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={{ width: '320px', background: '#000' }}
        />
      </div>

      <div>
        <h2>{connected ? 'Remote' : 'Waiting...'}</h2>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: '320px', background: '#000' }}
        />
      </div>

      {role === 'interviewer' && (
        <div style={{ marginLeft: '1rem' }}>
          <h3>Proctoring feed (last 20)</h3>
          <ul style={{ maxHeight: '300px', overflow: 'auto', fontSize: '12px' }}>
            {proctorEvents.map((e, idx) => (
              <li key={idx}>
                {new Date(e.at).toLocaleTimeString()} →{' '}
                focus: {String(e.metrics.isFocused)},{' '}
                mouse: {String(e.metrics.mouseActive)},{' '}
                full: {String(e.metrics.fullscreen)},{' '}
                size: {e.metrics.screenSize}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
