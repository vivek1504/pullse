import 'dotenv/config';
import express from 'express';
import http from 'http';
import cookie from 'cookie';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import { clerkClient, clerkMiddleware } from '@clerk/express';
import webhookRouter from './routes/webhook.js';
import userRouter from './routes/userRoutes.js';
import { getClerkUserIdFromCookies } from './middleware/clerkAuth.js';
import { httpMiddleware } from './middleware/httpAuth.js';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use('/api', webhookRouter);
app.use(clerkMiddleware());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use('/users', httpMiddleware, userRouter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

const onlineUsers = new Map();

interface PrivateMessagePayload {
  fromUsername: string;
  toUsername: string;
  message: string;
  tempId: string;
}

interface GroupMessagePayload {
  fromUsername: string;
  chatId: number;
  message: string;
  tempId: string;
}

async function findOrCreateChat(payload: PrivateMessagePayload) {
  let existingChat = await prisma.chat.findFirst({
    where: {
      isGroup: false,
      AND: [
        { members: { some: { username: payload.toUsername } } },
        { members: { some: { username: payload.fromUsername } } },
      ],
    },
    include: { members: true },
  });

  if (existingChat) return existingChat;

  const members = await prisma.user.findMany({
    where: {
      username: { in: [payload.fromUsername, payload.toUsername] },
    },
  });

  if (members.length !== 2) throw new Error('Users not found');

  existingChat = await prisma.chat.create({
    data: {
      isGroup: false,
      members: {
        connect: members.map((user) => ({ id: user.id })),
      },
    },
    include: { members: true },
  });

  return existingChat;
}

io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    const userId = await getClerkUserIdFromCookies(cookieHeader);
    socket.userId = userId;
    next();
  } catch (e) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', async (socket) => {
  try {
    console.log('a user connected');
    const clerkUser = await clerkClient.users.getUser(socket.userId);
    console.log(clerkUser.username);

    if (clerkUser.username) {
      onlineUsers.set(clerkUser.username, socket.id);
      console.log('✅ Auto-registered:', clerkUser.username);
    }

    socket.on('private_message', async (payload: PrivateMessagePayload) => {
      if (!clerkUser) return;
      payload.fromUsername = clerkUser.username + '';
      console.log(payload);

      const existingChat = await findOrCreateChat(payload);

      const sender = await prisma.user.findFirst({
        where: {
          username: payload.fromUsername,
        },
      });

      if (!sender) return new Error('sender not found');

      const createmsg = await prisma.message.create({
        data: {
          text: payload.message,
          chatId: existingChat.id,
          senderId: sender.id,
        },
      });
      console.log('online Users', onlineUsers);

      const messageData = {
        id: createmsg.id,
        text: createmsg.text,
        chatId: createmsg.chatId,
        senderId: sender.id,
        senderUsername: sender.username,
        reciverUsername: payload.toUsername,
        createdAt: createmsg.createdAt,
        tempId: payload.tempId,
      };

      const recipientSocketId = onlineUsers.get(payload.toUsername);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('message', messageData);
      }

      socket.emit('message_sent', messageData);
    });

    socket.on('group_message', async (payload: GroupMessagePayload) => {
      try {
        if (!clerkUser) return;

        payload.fromUsername = clerkUser.username + '';

        const chat = await prisma.chat.findFirst({
          where: { id: payload.chatId },
          include: { members: true },
        });
        if (!chat) return new Error('Chat not found');

        const sender = await prisma.user.findFirst({
          where: { username: payload.fromUsername },
        });
        if (!sender) return new Error('Sender not found');

        const createmsg = await prisma.message.create({
          data: {
            text: payload.message,
            chatId: chat.id,
            senderId: sender.id,
          },
        });

        const messageData = {
          id: createmsg.id,
          text: createmsg.text,
          chatId: createmsg.chatId,
          senderId: sender.id,
          senderUsername: sender.username,
          recipentUsernames: chat.members,
          createdAt: createmsg.createdAt,
          tempId: payload.tempId,
        };

        for (let i = 0; i < chat.members.length; i++) {
          const recipientUsername = chat.members[i]?.username;
          const recipientSocketId = onlineUsers.get(recipientUsername);

          if (recipientSocketId) {
            io.to(recipientSocketId).emit('message', messageData);
          }
        }
        socket.emit('message_sent', messageData);
      } catch (e) {
        console.error(e);
      }
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
      if (clerkUser?.username) {
        onlineUsers.delete(clerkUser.username);
      }
    });
  } catch (e) {
    console.error(e);
  }
});

server.listen(3000, () => {
  console.log('listening');
});
