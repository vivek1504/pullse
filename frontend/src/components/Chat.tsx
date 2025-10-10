import { useEffect, useState } from 'react';
import { socket } from '../socket';
import axios from 'axios';
import type { messageType } from '../types/types';
import { useUser } from '@clerk/clerk-react';
import { useRecoilState } from 'recoil';
import { myChatsAtom, selectedChatAtom } from '../atoms';

const Chat = () => {
  const { user } = useUser();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [text, setText] = useState<string>('');

  const [selectedChat, setSelectedChat] = useRecoilState(selectedChatAtom);
  const [chats, setChats] = useRecoilState(myChatsAtom);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
    };
    const handleDisconnect = () => setIsConnected(false);
    if (!user) return;

    // const fetchUsers = async () => {
    //   const response = await axios.get('http://localhost:3000/users/allUsers', {
    //     withCredentials: true,
    //   });
    //   const allUsers: userType[] = response.data.users;
    //   const filteredUsers = allUsers.filter(
    //     (usr: userType) => usr.username !== user.username
    //   );
    //   setUsers(filteredUsers);
    // };
    // fetchUsers();

    const fetchChats = async () => {
      const response = await axios.get('http://localhost:3000/users/allChats', {
        withCredentials: true,
      });
      setChats(response.data.chats);
      console.log(response.data.chats);
    };

    fetchChats();

    const handleMessage = (msg: messageType) => {
      setSelectedChat((prev) => {
        if (!prev) return prev;
        if (prev.id === parseInt(msg.chatId)) {
          const exists = prev.messages.some(
            (m) => m.id === msg.id || m.tempId === msg.tempId
          );

          if (exists) return prev;

          return {
            ...prev,
            messages: [...prev.messages, msg],
          };
        }
        return prev;
      });
    };

    const handleMessageSent = (msg: messageType) => {
      setSelectedChat((prev) => {
        if (!prev || prev.id !== parseInt(msg.chatId)) return prev;

        return {
          ...prev,
          messages: prev.messages.map((m) =>
            m.tempId === msg.tempId
              ? { ...m, id: msg.id, status: 'sent', createdAt: msg.createdAt }
              : m
          ),
        };
      });
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
    if (text.trim() === '' || !selectedChat) return;

    const tempId = Math.random().toString(36).substring(2, 10);

    if (!user) return;
    const reciverUsername = selectedChat.members.filter(
      (m) => m.username !== user.username
    );

    console.log('reciver Username ..... ', reciverUsername);
    // this will only work for one -to - one chats
    const newMsg: messageType = {
      id: '',
      text,
      chatId: selectedChat.id + '',
      senderId: user.id,
      senderUsername: 'You',
      reciverUsername: reciverUsername[0].username,
      tempId,
      status: 'sending',
      createdAt: new Date().toISOString(),
    };

    {
      setSelectedChat({
        ...selectedChat,
        messages: [...selectedChat.messages, newMsg],
      });
    }
    if (selectedChat.isGroup) {
      socket.emit('group_message', {
        message: text,
        chatId: selectedChat.id,
        tempId,
      });
    }
    socket.emit('private_message', {
      message: text,
      toUsername: reciverUsername[0].username,
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

      <div>
        <h1>Chats</h1>
        {chats.length === 0 && <p>No chats found</p>}
        {chats &&
          chats.map((chat) => (
            <div key={chat.id} className="m-2 p-2">
              <button
                className="text-white bg-cyan-500 p-2 m-2"
                onClick={() => {
                  setSelectedChat(chat);
                }}
              >
                {!chat.isGroup
                  ? chat.members
                      .filter((m) => m.username !== user?.username)
                      .map((m) => m.username)
                  : chat.name}
              </button>
            </div>
          ))}
      </div>

      <div className="text-white">
        <h3>Messages</h3>
        <ul>
          {selectedChat &&
            selectedChat.messages.map((msg) => {
              const sender = selectedChat.members.find(
                (m) => m.id === Number(msg.senderId)
              );

              const senderName =
                sender?.username === user?.username
                  ? 'You'
                  : sender?.username || 'You';

              return (
                <li key={msg.id || msg.tempId} className="my-1">
                  <strong>{senderName}:</strong> {msg.text}
                </li>
              );
            })}
        </ul>
      </div>

      <div className="text-white font-bold">
        <h3>selected Chat</h3>
        <div className="text-blue-500">{selectedChat?.id}</div>
      </div>

      <div>
        <input
          className="border-2 text-white"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="type a msg..."
        ></input>
        <button
          disabled={!selectedChat}
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
