import { useEffect, useState } from 'react';
import { socket } from '../socket';
import axios from 'axios';
import type { messageType, userType } from '../types';
import { useUser } from '@clerk/clerk-react';
import { useRecoilState } from 'recoil';
import {
  messagesAtom,
  myChatsAtom,
  selectedUserAtom,
  usersAtom,
} from '../atoms';

const Chat = () => {
  const { user } = useUser();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [text, setText] = useState<string>('');

  const [messages, setMessages] = useRecoilState(messagesAtom);
  const [users, setUsers] = useRecoilState(usersAtom);
  const [selectedUser, setSelectedUser] = useRecoilState(selectedUserAtom);
  const [chats, setChats] = useRecoilState(myChatsAtom);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
    };
    const handleDisconnect = () => setIsConnected(false);
    if (!user) return;

    const fetchUsers = async () => {
      const response = await axios.get('http://localhost:3000/users/allUsers', {
        withCredentials: true,
      });
      const allUsers: userType[] = response.data.users;
      const filteredUsers = allUsers.filter(
        (usr: userType) => usr.username !== user.username
      );
      setUsers(filteredUsers);
    };
    fetchUsers();

    const fetchChats = async () => {
      const response = await axios.get('http://localhost:3000/users/allChats', {
        withCredentials: true,
      });
      setChats(response.data.chats);
    };

    fetchChats();

    const handleMessage = (msg: messageType) => {
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id,
          text: msg.text,
          chatId: msg.chatId,
          senderId: msg.senderId,
          senderUsername: msg.senderUsername,
          reciverUsername: msg.reciverUsername,
          createdAt: msg.createdAt,
          tempId: msg.tempId,
          status: 'sent',
        },
      ]);
      console.log(messages);
    };

    const handleMessageSent = (msg: messageType) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.tempId == msg.tempId
            ? {
                ...m,
                id: msg.id,
                chatId: msg.chatId,
                senderId: msg.senderId,
                createdAt: msg.createdAt,
                status: 'sent',
              }
            : m
        )
      );
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('message', handleMessage);
    socket.on('message_sent', handleMessageSent);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('message', handleMessage);
      socket.off('message_sent', handleMessageSent);
    };
  }, []);

  const sendMessage = () => {
    if (text.trim() === '' || !selectedUser) return;

    const tempId = Math.random().toString(36).substring(2, 10);

    if (!user) return;

    setMessages((prev) => [
      ...prev,
      {
        id: '',
        text,
        chatId: '',
        senderId: '',
        senderUsername: 'You',
        reciverUsername: selectedUser.username,
        createdAt: '',
        tempId,
        status: 'sending',
      },
    ]);

    socket.emit('private_message', {
      message: text,
      toUsername: selectedUser.username,
      tempId,
    });

    setText('');
  };

  return (
    <div className="m-10">
      <h1 className="text-white">WebSocket Test</h1>

      <p className="text-white">
        Connection state:{' '}
        <strong>{isConnected ? '🟢 Connected' : '🔴 Disconnected'}</strong>
      </p>

      {users &&
        users.map((u) => {
          return (
            <div key={u.username}>
              <button
                className="bg-black text-white rounded-lg p-4 mb-2 cursor-pointer"
                onClick={() => setSelectedUser(u)}
              >
                {u.username}
              </button>
            </div>
          );
        })}

      <div>
        <h1>Chats</h1>
        {chats.length === 0 && <p>No chats found</p>}
        {chats &&
          chats.map((chat) => (
            <div key={chat.id}>
              <h2>{chat.id || 'Unnamed Chat'}</h2>

              <p>Members: {chat.members.map((m) => m.username).join(', ')}</p>
              <p>Messages: {chat.messages.length}</p>
            </div>
          ))}
      </div>

      <div className="text-white">
        <h3>Recived messages</h3>
        <ul>
          {messages &&
            messages.map((msg, i) => (
              <li key={i}>
                {msg.senderUsername} : {msg.text}
              </li>
            ))}
        </ul>
      </div>

      <div className="text-white font-bold">
        <h3>selected user</h3>
        <div className="text-blue-500">{selectedUser?.username}</div>
      </div>

      <div>
        <input
          className="border-2 text-white"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="type a msg..."
        ></input>
        <button
          disabled={!selectedUser}
          className="bg-blue-600 p-2 m-2 text-white font-semibold cursor-pointer"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
