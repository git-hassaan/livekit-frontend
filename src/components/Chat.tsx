// src/components/Chat.tsx
import { useState, useEffect } from 'react';
import { Room, RemoteParticipant } from 'livekit-client';
import '../styles/Chat.scss'; // Add this import

interface ChatProps {
  room: Room;
  participants: RemoteParticipant[];
}

interface ChatMessage {
  sender: string;
  message: string;
  timestamp: Date;
}

export const Chat = ({ room, participants }: ChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  useEffect(() => {
    const handleDataReceived = (payload: Uint8Array, participant?: RemoteParticipant) => {
      const decoder = new TextDecoder();
      const message = decoder.decode(payload);
      setMessages((prev) => [
        ...prev,
        {
          sender: participant?.identity || 'System',
          message,
          timestamp: new Date(),
        },
      ]);
    };

    room.on('dataReceived', handleDataReceived);

    return () => {
      room.off('dataReceived', handleDataReceived);
    };
  }, [room]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const encoder = new TextEncoder();
      const data = encoder.encode(newMessage);
      room.localParticipant.publishData(data);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'You',
          message: newMessage,
          timestamp: new Date(),
        },
      ]);
      setNewMessage('');
    }
  };

  return (
    <div className="chat">
      <h2>Chat</h2>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <span className="sender">{msg.sender}: </span>
            <span className="text">{msg.message}</span>
            <span className="time">{msg.timestamp.toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};