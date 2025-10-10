export interface messageType {
  id: string;
  text: string;
  chatId: string;
  senderId: string;
  senderUsername: string;
  reciverUsername: string;
  createdAt: string;
  tempId: string;
  status: 'sending' | 'sent';
}

export interface userType {
  username: string;
  id: number;
}

export interface chatType {
  id: number;
  name: string;
  isGroup: boolean;
  members: userType[];
  messages: messageType[];
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
