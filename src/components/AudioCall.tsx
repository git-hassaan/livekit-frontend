// src/components/AudioCall.tsx
import { Room } from 'livekit-client';
import type { RemoteParticipant } from 'livekit-client';

interface AudioCallProps {
  room: Room;
  participants: RemoteParticipant[];
}

export const AudioCall = ({ room, participants }: AudioCallProps) => {
  
  return (
    <div className="audio-call">
      <h2>Audio Call</h2>
      <div className="participants-container">
        {JSON.stringify(participants)}
        {participants.map((participant:any) => (
          <div key={participant.sid} className="participant-audio">
            <span>{participant.identity}</span>
            <audio autoPlay playsInline ref={(ref) => {
              if (ref) {
                participant.audioTracks.forEach((track:any) => {
                  track.attach(ref);
                });
              }
            }} />
          </div>
        ))}
      </div>
    </div>
  );
};