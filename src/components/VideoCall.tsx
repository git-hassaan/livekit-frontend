// src/components/VideoCall.tsx
import { Room,RemoteParticipant } from 'livekit-client';
import { ParticipantView } from './ParticipantView';
import { Controls } from './Controls';
import '../styles/VideoCall.scss'; // Add this import

interface VideoCallProps {
  room: Room;
  participants: RemoteParticipant[];
}

export const VideoCall = ({ room, participants }: VideoCallProps) => {
  return (
    <div className="video-call">
      <h2>Video Call</h2>
      <div className="participants-grid">
        {participants.map((participant) => (
          <ParticipantView key={participant.sid} participant={participant} />
        ))}
      </div>
      <Controls room={room} />
    </div>
  );
};