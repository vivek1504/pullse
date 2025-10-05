import { useEffect, useState } from 'react';
import { socket } from '../socket';
import axios from 'axios';

interface userType {
  username: string;
  id: number;
}

const Chat = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState<string>('');
  const [users, setUsers] = useState<userType[]>([]);
  const [selectedUser, setSelectedUser] = useState<userType>();

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
    };
    const handleDisconnect = () => setIsConnected(false);

    const fetchUsers = async () => {
      const response = await axios.get('http://localhost:3000/users/allUsers');
      setUsers(response.data.users);
      console.log(users);
    };
    fetchUsers();

    const handleMessage = (value: string) =>
      //@ts-ignore
      setMessages((prev) => [...prev, value]);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('message', handleMessage);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('message', handleMessage);
    };
  }, []);

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

      <div className="text-white">
        <h3>Recived messages</h3>
        <ul>
          {messages && messages.map((msg, i) => <li key={i}> {msg.text}</li>)}
        </ul>
      </div>

      <div className="text-white font-bold">
        <h3>selected user</h3>
        <div className="text-blue-500">{selectedUser?.username}</div>
      </div>

      <div>
        <input
          className="border-2 text-white"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="type a msg..."
        ></input>
        <button
          className="bg-blue-600 p-2 m-2 text-white font-semibold cursor-pointer"
          onClick={() => {
            if (msg.trim() === '') return;
            console.log(msg, selectedUser);
            socket.emit('private_message', {
              message: msg,
              toUsername: selectedUser?.username,
            });
            setMsg('');
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
