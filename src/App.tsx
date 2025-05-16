// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Room } from 'livekit-client';
import type { RemoteParticipant } from 'livekit-client';
import { RoomConnection } from './components/RoomConnection';
import { AudioCall } from './components/AudioCall';
import { VideoCall } from './components/VideoCall';
import { ScreenShare } from './components/ScreenShare';
import { Chat } from './components/Chat';
import PhoneIcon from '@mui/icons-material/Phone';
import VideocamIcon from '@mui/icons-material/Videocam';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import ChatIcon from '@mui/icons-material/Chat';
import './styles/App.scss';

export const App = () => {
  const [room] = useState<Room>(new Room());
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    room.on('connected', handleConnected);
    room.on('disconnected', handleDisconnected);

    return () => {
      room.off('connected', handleConnected);
      room.off('disconnected', handleDisconnected);
      if (room.state === 'connected') {
        room.disconnect();
      }
    };
  }, [room]);

  return (
    <Router>
      <div className="app">
        <div className="sidebar">
          <a href="/audio" className={window.location.pathname === '/audio' ? 'active' : ''}>
            <PhoneIcon />
            <span>Audio Call</span>
          </a>
          <a href="/video" className={window.location.pathname === '/video' ? 'active' : ''}>
            <VideocamIcon />
            <span>Video Call</span>
          </a>
          <a href="/screen" className={window.location.pathname === '/screen' ? 'active' : ''}>
            <DesktopWindowsIcon />
            <span>Screen Share</span>
          </a>
          <a href="/chat" className={window.location.pathname === '/chat' ? 'active' : ''}>
            <ChatIcon />
            <span>Chat</span>
          </a>
      </div>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<RoomConnection room={room} setRoom={() => { }} setParticipants={setParticipants} />} />
          <Route path="/audio" element={isConnected ? <AudioCall room={room} participants={participants} /> : <Navigate to="/" />} />
          <Route path="/video" element={isConnected ? <VideoCall room={room} participants={participants} /> : <Navigate to="/" />} />
          <Route path="/screen" element={isConnected ? <ScreenShare room={room} participants={participants} /> : <Navigate to="/" />} />
          <Route path="/chat" element={isConnected ? <Chat room={room} participants={participants} /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </div>
    </Router >
  );
};