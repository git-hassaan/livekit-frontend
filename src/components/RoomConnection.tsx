// src/components/RoomConnection.tsx
import { useEffect, useState } from 'react';
import { Room, RoomEvent, RemoteParticipant } from 'livekit-client';

interface RoomConnectionProps {
  room: Room;
  setRoom: (room: Room) => void;
  setParticipants: (participants: RemoteParticipant[]) => void;
}

export const RoomConnection = ({ room, setRoom, setParticipants }: RoomConnectionProps) => {
  const [url, setUrl] = useState<string>('wss://your-livekit-server-url');
  const [token, setToken] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const connectToRoom = async () => {
    if (!url || !token) {
      alert('Please enter URL and token');
      return;
    }

    setIsConnecting(true);
    try {
      await room.connect(url, token);
      setRoom(room);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect', error);
      alert('Failed to connect: ' + error);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectFromRoom = async () => {
    try {
      await room.disconnect();
      setIsConnected(false);
      setParticipants([]);
    } catch (error) {
      console.error('Failed to disconnect', error);
    }
  };

  useEffect(() => {
    const handleParticipantsChanged = () => {
      setParticipants(Array.from(room.remoteParticipants.values()));
    };

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    room.on(RoomEvent.ParticipantConnected, handleParticipantsChanged);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantsChanged);
    room.on(RoomEvent.Connected, handleConnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantsChanged);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantsChanged);
      room.off(RoomEvent.Connected, handleConnected);
      room.off(RoomEvent.Disconnected, handleDisconnected);
    };
  }, [room, setParticipants]);

  return (
    <div className="room-connection">
      <h2>Connect to Room</h2>
      <div className="input-group">
        <label>LiveKit URL:</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="wss://your-livekit-server-url"
        />
      </div>
      <div className="input-group">
        <label>Token:</label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter your JWT token"
        />
      </div>
      <div className="button-group">
        <button onClick={connectToRoom} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect'}
        </button>
        <button onClick={disconnectFromRoom} disabled={!isConnected}>
          Disconnect
        </button>
      </div>
    </div>
  );
};