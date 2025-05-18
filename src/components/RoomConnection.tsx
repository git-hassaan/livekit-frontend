import { useEffect, useState } from 'react';
import { Room, RoomEvent, RemoteParticipant, Track, RemoteTrackPublication } from 'livekit-client';
import '../styles/RoomConnection.scss';
import { useNavigate } from 'react-router-dom';

interface RoomConnectionProps {
  room: Room;
  setRoom: (room: Room) => void;
  setParticipants: (participants: RemoteParticipant[]) => void;
}

// Enhanced mock participant generator with proper audio tracks
const generateMockParticipant = (index: number): RemoteParticipant => {
  const names = ['Alex', 'Jamie', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jordan', 'Skyler'];
  const roles = ['doctor', 'engineer', 'designer', 'teacher', 'student'];

  // Create a mock participant
  const participant: any = new RemoteParticipant(
    `${names[Math.floor(Math.random() * names.length)]}-${roles[Math.floor(Math.random() * roles.length)]}-${index}` as any,
    `participant-${Math.random().toString(36).substr(2, 9)}`
  );

  // Create a mock audio track publication
  const mockPublication = new RemoteTrackPublication(
    Track.Kind.Audio,
    `audio-track-${index}` as any,
    'mock-track-sid' as any
  );

  // Add mock methods needed for the audio call
  mockPublication.track = {
    kind: Track.Kind.Audio,
    attach: (element: HTMLAudioElement) => {
      console.log(`Attaching mock audio for ${participant.identity}`);
      // In a real app, this would attach a real media stream
    },
    detach: () => { },
    isMuted: false,
    isEnabled: true,
  } as any;

  // Add to participant's tracks
  participant.addTrackPublication(mockPublication);

  return participant;
};

export const RoomConnection = ({ room, setRoom, setParticipants }: RoomConnectionProps) => {
  const [url, setUrl] = useState<string>('wss://abcdefghijklmnopqrstuvwxyz-jj12giiv.livekit.cloud');
  const [token, setToken] = useState<string>('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDc2ODA4NjQsImlzcyI6IkFQSVluY3g3Z1VpM2VYdSIsIm5iZiI6MTc0NzQ4MDg2NCwic3ViIjoibWF4IiwidmlkZW8iOnsiY2FuUHVibGlzaCI6dHJ1ZSwiY2FuUHVibGlzaERhdGEiOnRydWUsImNhblN1YnNjcmliZSI6dHJ1ZSwicm9vbSI6Im1heCByb29tIiwicm9vbUpvaW4iOnRydWV9fQ.-Q1tWBxCEoCEHWww-0dbDxNC05uCKjYWmt-8RZSSR2M');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const navigate = useNavigate();

  const addMockParticipants = () => {
    const mockParticipants: RemoteParticipant[] = [];
    for (let i = 0; i < 5; i++) {
      mockParticipants.push(generateMockParticipant(i));
    }
    setParticipants(mockParticipants);

    // Simulate participant connection events
    mockParticipants.forEach(participant => {
      room.emit(RoomEvent.ParticipantConnected, participant);
    });
  };

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

      // Add mock participants after successful connection
      addMockParticipants();

      navigate('/audio');
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