// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
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
  const location = useLocation();

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
      <div className="app">
        <div className="sidebar">
          <Link
            to="/audio"
            className={location.pathname === '/audio' ? 'active' : ''}
          >
            <PhoneIcon />
            <span>Audio Call</span>
          </Link>
          <Link
            to="/video"
            className={location.pathname === '/video' ? 'active' : ''}
          >
            <VideocamIcon />
            <span>Video Call</span>
          </Link>
          <Link
            to="/screen"
            className={location.pathname === '/screen' ? 'active' : ''}
          >
            <DesktopWindowsIcon />
            <span>Screen Share</span>
          </Link>
          <Link
            to="/chat"
            className={location.pathname === '/chat' ? 'active' : ''}
          >
            <ChatIcon />
            <span>Chat</span>
          </Link>
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
  );
};