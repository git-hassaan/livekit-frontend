// src/components/Controls.tsx
import { useState, useEffect } from 'react';
import { Room, LocalTrack, LocalParticipant, Track } from 'livekit-client';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

interface ControlsProps {
  room: Room;
}

export const Controls = ({ room }: ControlsProps) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
  const localParticipant = room.localParticipant;

  const toggleAudio = async () => {
    if (isAudioEnabled) {
      await localParticipant.setMicrophoneEnabled(false);
    } else {
      await localParticipant.setMicrophoneEnabled(true);
    }
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleVideo = async () => {
    if (isVideoEnabled) {
      await localParticipant.setCameraEnabled(false);
    } else {
      await localParticipant.setCameraEnabled(true);
    }
    setIsVideoEnabled(!isVideoEnabled);
  };

  useEffect(() => {
    const handleLocalTrackPublished: any = (track: LocalTrack) => {
      if (track.kind === Track.Kind.Audio) {
        setIsAudioEnabled(true);
      } else if (track.kind === Track.Kind.Video) {
        setIsVideoEnabled(true);
      }
    };

    const handleLocalTrackUnpublished: any = (track: LocalTrack) => {
      if (track.kind === Track.Kind.Audio) {
        setIsAudioEnabled(false);
      } else if (track.kind === Track.Kind.Video) {
        setIsVideoEnabled(false);
      }
    };

    localParticipant.on('localTrackPublished', handleLocalTrackPublished);
    localParticipant.on('localTrackUnpublished', handleLocalTrackUnpublished);

    return () => {
      localParticipant.off('localTrackPublished', handleLocalTrackPublished);
      localParticipant.off('localTrackUnpublished', handleLocalTrackUnpublished);
    };
  }, [localParticipant]);

  return (
    <div className="controls">
      <button onClick={toggleAudio} className={isAudioEnabled ? 'active' : ''}>
        {isAudioEnabled ? <MicIcon fontSize="small" /> : <MicOffIcon fontSize="small" />}
        <span>{isAudioEnabled ? 'Mute' : 'Unmute'}</span>
      </button>
      <button onClick={toggleVideo} className={isVideoEnabled ? 'active' : ''}>
        {isVideoEnabled ? <VideocamIcon fontSize="small" /> : <VideocamOffIcon fontSize="small" />}
        <span>{isVideoEnabled ? 'Stop Video' : 'Start Video'}</span>
      </button>
    </div>
  );
};