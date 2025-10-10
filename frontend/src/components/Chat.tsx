import { useCallback, useEffect, useState } from 'react';
import { socket } from '../socket';
import axios from 'axios';
import { type userType, type messageType } from '../types/types';
import { useUser } from '@clerk/clerk-react';
import { useRecoilState } from 'recoil';
import { myChatsAtom, selectedChatAtom } from '../atoms';
import { 
  Search, 
  Send, 
  Users, 
  MessageCircle, 
  Lock, 
  Wifi, 
  WifiOff,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';

const Chat = () => {
  const { user } = useUser();
  const DEBOUNCE_DELAY = 200;
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [text, setText] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [users, setUsers] = useState<userType[]>([]);
  const [, setSelectedUser] = useState('');
  const [startingConversationWith, setStartingConversationWith] = useState<userType | null>(null);

  const [selectedChat, setSelectedChat] = useRecoilState(selectedChatAtom);
  const [chats, setChats] = useRecoilState(myChatsAtom);

  const fetchUsers = useCallback(async (username: string) => {
    if (!username.trim()) {
      setUsers([]);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:3000/users/search-user/${username}`,
        {
          withCredentials: true,
        }
      );
      setUsers(response.data.users);
      console.log(users);
    } catch (e) {
      console.error('API error', e);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers(query);
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [query, fetchUsers]);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
    };
    const handleDisconnect = () => setIsConnected(false);
    if (!user) return;

    const fetchChats = async () => {
      try {
        console.log('Fetching chats...');
        const response = await axios.get('http://localhost:3000/users/allChats', {
          withCredentials: true,
        });
        console.log('Chats response:', response.data);
        setChats(response.data.chats || []);
      } catch (error) {
        console.error('Error fetching chats:', error);
        setChats([]);
      }
    };

    fetchChats();

    const handleMessage = async (msg: messageType) => {
      // First update the selected chat if it matches
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

      // Also update the chats list to show new messages in sidebar
      setChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.id === parseInt(msg.chatId)) {
            const exists = chat.messages.some(
              (m) => m.id === msg.id || m.tempId === msg.tempId
            );
            
            if (exists) return chat;
            
            return {
              ...chat,
              messages: [...chat.messages, msg],
            };
          }
          return chat;
        });
      });

      // If this is a message from a new chat (someone messaging us for the first time),
      // refresh the chat list to include the new chat
      const existingChat = chats.find(chat => chat.id === parseInt(msg.chatId));
      if (!existingChat) {
        try {
          const response = await axios.get('http://localhost:3000/users/allChats', {
            withCredentials: true,
          });
          setChats(response.data.chats || []);
        } catch (error) {
          console.error('Error refreshing chats for new message:', error);
        }
      }
    };

    const handleMessageSent = async (msg: messageType) => {
      // If we're starting a new conversation, we need to refresh chats and switch to the new chat
      if (startingConversationWith) {
        try {
          // Refresh chats to get the newly created chat
          const response = await axios.get('http://localhost:3000/users/allChats', {
            withCredentials: true,
          });
          const updatedChats = response.data.chats || [];
          setChats(updatedChats);
          
          // Find the new chat and select it
          const newChat = updatedChats.find((chat: any) =>
            chat.id === parseInt(msg.chatId)
          );
          
          if (newChat) {
            setSelectedChat(newChat);
            setStartingConversationWith(null);
          }
        } catch (error) {
          console.error('Error refreshing chats:', error);
        }
      } else if (selectedChat) {
        // Handle existing chat message updates
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
      }
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
  }, [user, setSelectedChat, setChats, startingConversationWith]);

  const sendMessage = () => {
    if (text.trim() === '') return;
    if (!selectedChat && !startingConversationWith) return;
    if (!user) return;

    const tempId = Math.random().toString(36).substring(2, 10);

    // Handle sending message to existing chat
    if (selectedChat) {
      const reciverUsername = selectedChat.members.filter(
        (m) => m.username !== user.username
      );

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

      setSelectedChat({
        ...selectedChat,
        messages: [...selectedChat.messages, newMsg],
      });

      if (selectedChat.isGroup) {
        socket.emit('group_message', {
          message: text,
          chatId: selectedChat.id,
          tempId,
        });
      } else {
        socket.emit('private_message', {
          message: text,
          toUsername: reciverUsername[0].username,
          tempId,
        });
      }
    }
    // Handle starting new conversation
    else if (startingConversationWith) {
      socket.emit('private_message', {
        message: text,
        toUsername: startingConversationWith.username,
        tempId,
      });
    }

    setText('');
  };

  const handleUserSelection = (selectedUserData: userType) => {
    // Check if we already have a chat with this user
    const existingChat = chats.find(
      (chat) =>
        !chat.isGroup &&
        chat.members.some(member => member.username === selectedUserData.username)
    );

    if (existingChat) {
      // If chat exists, select it
      setSelectedChat(existingChat);
      setStartingConversationWith(null);
    } else {
      // If no chat exists, start a new conversation
      setStartingConversationWith(selectedUserData);
      setSelectedChat(null);
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <div className="w-80 h-full sidebar flex flex-col">
        {/* Header */}
        <div className="sidebar-header p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Pulse
            </h2>
            <div className={`connection-indicator ${
              isConnected ? 'connection-connected' : 'connection-disconnected'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="w-3 h-3" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  Offline
                </>
              )}
            </div>
          </div>
          
          {/* Search Users */}
          <div className="search-container relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              className="search-input"
              placeholder="Search users"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          
          {/* User Search Results */}
          {users && users.length > 0 && (
            <div className="mt-3 space-y-1 max-h-32 overflow-y-auto scrollbar-thin bg-slate-700 rounded-lg p-2">
              {users.map((searchUser, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-2 text-white hover:bg-slate-600 rounded-md transition-colors text-sm"
                  onClick={() => {
                    setSelectedUser(searchUser.username);
                    handleUserSelection(searchUser);
                    setQuery('');
                    setUsers([]);
                  }}
                >
                  <div className="avatar avatar-sm">
                    {searchUser.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{searchUser.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="px-4 py-2">
            <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              CHATS ({chats.length})
            </h3>
            
            {chats.length === 0 && (
              <div className="text-center py-12 empty-state">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p className="text-sm mb-1">No chats yet</p>
                <p className="text-xs text-slate-500">Search for users to start chatting</p>
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            {chats.map((chat) => {
              const otherMember = !chat.isGroup 
                ? chat.members.find((m) => m.username !== user?.username)
                : null;
              const displayName = !chat.isGroup && otherMember 
                ? otherMember.username 
                : chat.name;
              const lastMessage = chat.messages[chat.messages.length - 1];
              const isActive = selectedChat?.id === chat.id;

              return (
                <button
                  key={chat.id}
                  className={`chat-item w-full text-left ${
                    isActive ? 'active' : ''
                  }`}
                  onClick={() => {
                    setSelectedChat(chat);
                    setStartingConversationWith(null);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="avatar">
                        {chat.isGroup ? (
                          displayName.charAt(0).toUpperCase()
                        ) : (
                          otherMember?.username.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="online-dot"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-white truncate text-sm">{displayName}</h4>
                        {lastMessage && (
                          <span className="text-xs text-slate-400">
                            {new Date(lastMessage.createdAt).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                      {lastMessage && (
                        <p className="text-xs text-slate-400 truncate">
                          {lastMessage.senderUsername === 'You' ? 'You: ' : ''}
                          {lastMessage.text}
                        </p>
                      )}
                      {chat.messages.length === 0 && (
                        <p className="text-xs text-slate-500 italic">No messages yet</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-900">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="chat-header p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="avatar">
                      {selectedChat.isGroup ? (
                        selectedChat.name.charAt(0).toUpperCase()
                      ) : (
                        selectedChat.members
                          .find((m) => m.username !== user?.username)?.username
                          ?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="online-dot"></div>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">
                      {!selectedChat.isGroup
                        ? selectedChat.members
                            .filter((m) => m.username !== user?.username)
                            .map((m) => m.username)
                        : selectedChat.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Online
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Lock className="w-3 h-3 text-green-400" />
                  <span>Encrypted</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3 bg-slate-900">
              {selectedChat.messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-medium text-white mb-2">Start a conversation</h3>
                  <p className="text-sm text-slate-400 max-w-md">
                    Your messages are end-to-end encrypted. Send your first message to begin chatting.
                  </p>
                </div>
              )}
              
              {selectedChat.messages.map((msg) => {
                const sender = selectedChat.members.find(
                  (m) => m.id === Number(msg.senderId)
                );
                const senderName = sender?.username === user?.username ? 'You' : sender?.username || 'You';
                const isSent = senderName === 'You';
                const messageTime = new Date(msg.createdAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={msg.id || msg.tempId}
                    className={`flex items-end gap-2 animate-fade-in ${
                      isSent ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {!isSent && (
                      <div className="avatar avatar-sm flex-shrink-0">
                        {sender?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    
                    <div className={`message-bubble ${
                      isSent ? 'message-sent' : 'message-received'
                    }`}>
                      <p>{msg.text}</p>
                      <div className={`flex items-center gap-1 mt-1 text-xs opacity-70 ${
                        isSent ? 'justify-end' : 'justify-start'
                      }`}>
                        <span>{messageTime}</span>
                        {isSent && (
                          <div className="flex items-center ml-1">
                            {msg.status === 'sending' ? (
                              <Clock className="w-3 h-3" />
                            ) : msg.status === 'sent' ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="message-input-container p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    className="message-input w-full"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message"
                  />
                </div>
                <button
                  disabled={text.trim() === ''}
                  className="send-button"
                  onClick={sendMessage}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : startingConversationWith ? (
          /* Start New Conversation */
          <>
            {/* New Conversation Header */}
            <div className="chat-header p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="avatar">
                      {startingConversationWith.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="online-dot"></div>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{startingConversationWith.username}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Online
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Lock className="w-3 h-3 text-green-400" />
                  <span>Encrypted</span>
                </div>
              </div>
            </div>

            {/* Start Conversation Area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3 bg-slate-900">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="avatar avatar-lg">
                    {startingConversationWith.username.charAt(0).toUpperCase()}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Start a conversation with {startingConversationWith.username}
                </h3>
                <p className="text-slate-400 mb-6 leading-relaxed max-w-md">
                  This is the beginning of your conversation with {startingConversationWith.username}. 
                  Send your first message to start chatting!
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <Lock className="w-4 h-4 text-green-400" />
                  <span>Messages are end-to-end encrypted</span>
                </div>
              </div>
            </div>

            {/* New Conversation Message Input */}
            <div className="message-input-container p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    className="message-input w-full"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={`Send a message to ${startingConversationWith.username}`}
                  />
                </div>
                <button
                  disabled={text.trim() === ''}
                  className="send-button"
                  onClick={sendMessage}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-slate-900">
            <div className="text-center max-w-md px-8">
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Welcome to Pulse</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Select a chat from the sidebar or search for users to start messaging. 
                All your conversations are end-to-end encrypted for maximum privacy.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <Lock className="w-4 h-4 text-green-400" />
                <span>Your messages are secure and private</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
