// ChatComponent.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SendIcon from '@mui/icons-material/Send';

// import { database } from './firebaseConfig';
// import { ref, push, onChildAdded } from 'firebase/database';

const ChatContainer = styled.div`
  width: fit-content;
  background-color: #000;
  padding: 1rem;
  color: white;
  display: flex;
  flex-direction: column;
  height: 95%;
  max-width: fir-content;
`;

const MessagesBox = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  text-align: left;
`;

const Message = styled.div`
  margin-bottom: 0.5rem;
`;

const ChatInputRow = styled.div`
  display: flex;
  align-items: center;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  background-color: #111;
  color: white;
  border: 1px solid white;
  border-radius: 4px;
  margin-right: 0.5rem;
  outline: none;

  &::placeholder {
    color: #aaa;
  }
`;

const SendButton = styled.button`
  padding: 0.25rem 1rem;
  background-color: #333;
  color: white;
  border: 1px solid white;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #555;
  }
`;

type MessageType = {
    sender: string;
    text: string;
}
export const ChatBox = ({ }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');


  const sendMessage = () => {
    if (!newMessage.trim()) return;

    setNewMessage(newMessage);
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'You', text: newMessage },
    ]);
    setNewMessage('');
  };

  return (
    <ChatContainer>
      <MessagesBox>
        {messages.map((msg, index) => (
          <Message key={index}>
            <strong>{msg.sender}:</strong> {msg.text}
          </Message>
        ))}
      </MessagesBox>
      <ChatInputRow>
        <ChatInput
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <SendButton onClick={sendMessage}>
            <SendIcon fontSize='small'/>
        </SendButton>
      </ChatInputRow>
    </ChatContainer>
  );
};


