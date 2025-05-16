// src/components/ParticipantView.tsx
import { useRef, useState, useEffect } from 'react';
import { RemoteParticipant, Track, RemoteTrackPublication } from 'livekit-client';

interface ParticipantViewProps {
  participant: RemoteParticipant;
}

export const ParticipantView = ({ participant }: ParticipantViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [videoTracks, setVideoTracks] = useState<RemoteTrackPublication[]>([]);
  const [audioTracks, setAudioTracks] = useState<RemoteTrackPublication[]>([]);

  useEffect(() => {
    const handleTrackPublished = (publication: RemoteTrackPublication) => {
      const track = publication.track;
      if (!track) return;

      if (track.kind === Track.Kind.Video) {
        setVideoTracks((prev) => [...prev, publication]);
      } else if (track.kind === Track.Kind.Audio) {
        setAudioTracks((prev) => [...prev, publication]);
      }
    };

    const handleTrackUnpublished = (publication: RemoteTrackPublication) => {
      const track = publication.track;
      if (!track) return;

      if (track.kind === Track.Kind.Video) {
        setVideoTracks((prev) => prev.filter((p) => p !== publication));
      } else if (track.kind === Track.Kind.Audio) {
        setAudioTracks((prev) => prev.filter((p) => p !== publication));
      }
    };

    const handleTrackSubscribed = (track: Track, publication: RemoteTrackPublication) => {
      if (track.kind === Track.Kind.Video) {
        setVideoTracks((prev) => [...prev, publication]);
      } else if (track.kind === Track.Kind.Audio) {
        setAudioTracks((prev) => [...prev, publication]);
      }
    };

    const handleTrackUnsubscribed = (track: Track) => {
      if (track.kind === Track.Kind.Video) {
        setVideoTracks((prev) => prev.filter((p) => p.track !== track));
      } else if (track.kind === Track.Kind.Audio) {
        setAudioTracks((prev) => prev.filter((p) => p.track !== track));
      }
    };

    participant.on('trackPublished', handleTrackPublished);
    participant.on('trackUnpublished', handleTrackUnpublished);
    participant.on('trackSubscribed', handleTrackSubscribed);
    participant.on('trackUnsubscribed', handleTrackUnsubscribed);

    // Set initial tracks
    setVideoTracks(Array.from(participant.trackPublications.values())
      .filter(pub => pub.kind === Track.Kind.Video));
    setAudioTracks(Array.from(participant.trackPublications.values())
      .filter(pub => pub.kind === Track.Kind.Audio));

    return () => {
      participant.off('trackPublished', handleTrackPublished);
      participant.off('trackUnpublished', handleTrackUnpublished);
      participant.off('trackSubscribed', handleTrackSubscribed);
      participant.off('trackUnsubscribed', handleTrackUnsubscribed);
    };
  }, [participant]);

  useEffect(() => {
    if (videoRef.current && videoTracks.length > 0) {
      const track = videoTracks[0].track;
      if (track) {
        track.attach(videoRef.current);
      }
    }

    return () => {
      if (videoRef.current && videoTracks.length > 0) {
        const track = videoTracks[0].track;
        if (track) {
          track.detach(videoRef.current);
        }
      }
    };
  }, [videoTracks]);

  useEffect(() => {
    if (audioRef.current && audioTracks.length > 0) {
      const track = audioTracks[0].track;
      if (track) {
        track.attach(audioRef.current);
      }
    }

    return () => {
      if (audioRef.current && audioTracks.length > 0) {
        const track = audioTracks[0].track;
        if (track) {
          track.detach(audioRef.current);
        }
      }
    };
  }, [audioTracks]);

  return (
    <div className="participant-view">
      <div className="participant-info">
        <span>{participant.identity}</span>
      </div>
      {videoTracks.length > 0 ? (
        <video ref={videoRef} autoPlay className="participant-video" />
      ) : (
        <div className="no-video">No video</div>
      )}
      <audio ref={audioRef} autoPlay className="participant-audio" />
    </div>
  );
};