// src/components/ScreenShare.tsx
import { useState, useEffect } from 'react';
import { Room, RemoteParticipant, Track } from 'livekit-client';
import { ParticipantView } from './ParticipantView';
import '../styles/ScreenShare.scss'; // Add this import

interface ScreenShareProps {
  room: Room;
  participants: RemoteParticipant[];
}

export const ScreenShare = ({ room, participants }: ScreenShareProps) => {
  const [screenTrack, setScreenTrack] = useState<Track.Source | null>(null);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  const startScreenShare = async () => {
    try {
      const tracks = await room.localParticipant.createScreenTracks({
        audio: true,
        video: true,
      });

      if (tracks && tracks.length > 0) {
        const track = tracks[0];
        await room.localParticipant.publishTrack(track);
        setScreenTrack(track.source);
        setIsSharing(true);
      }
    } catch (error) {
      console.error('Failed to share screen:', error);
    }
  };

  const stopScreenShare = async () => {
    if (screenTrack) {
      const publications = room.localParticipant.getTrackPublications();
      const screenPublication: any = publications.find(pub =>
        pub.track?.source === Track.Source.ScreenShare
      );

      if (screenPublication) {
        await room.localParticipant.unpublishTrack(screenPublication.track!);
      }
      setScreenTrack(null);
      setIsSharing(false);
    }
  };

  return (
    <div className="screen-share">
      <h2>Screen Share</h2>
      <div className="screen-container">
        {isSharing ? (
          <video ref={(el) => {
            if (el) {
              const publications = room.localParticipant.getTrackPublications();
              const screenPublication = publications.find(pub =>
                pub.track?.source === Track.Source.ScreenShare
              );
              if (screenPublication?.track) {
                screenPublication.track.attach(el);
              }
            }
          }} autoPlay />
        ) : (
          <div className="no-screen">No screen being shared</div>
        )}
      </div>
      <div className="participants-grid">
        {participants.map((participant) => (
          <ParticipantView key={participant.sid} participant={participant} />
        ))}
      </div>
      <div className="screen-controls">
        <button onClick={isSharing ? stopScreenShare : startScreenShare}>
          {isSharing ? 'Stop Sharing' : 'Start Sharing'}
        </button>
      </div>
    </div>
  );
};