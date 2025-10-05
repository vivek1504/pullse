import 'dotenv/config';
import express from 'express';
import http from 'http';
import cookie from 'cookie';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import { clerkClient, clerkMiddleware, verifyToken } from '@clerk/express';
import webhookRouter from './routes/webhook.js';
import userRouter from './routes/userRoutes.js';
const app = express();
const prisma = new PrismaClient();
app.use(express.json());
app.use('/api', webhookRouter);
app.use(clerkMiddleware());
app.use(cors());
app.use('/users', userRouter);
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    },
});
const onlineUsers = new Map();
async function findOrCreateChat(payload) {
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
    if (existingChat)
        return existingChat;
    const members = await prisma.user.findMany({
        where: {
            username: { in: [payload.fromUsername, payload.toUsername] },
        },
    });
    if (members.length !== 2)
        throw new Error('Users not found');
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
        if (!cookieHeader)
            return next(new Error('No Cookies Found'));
        const cookies = cookie.parse(cookieHeader);
        const sessionToken = cookies['__session'];
        if (!sessionToken)
            return next(new Error('Missing Clerk session token'));
        if (!process.env.CLERK_JWT_KEY)
            return console.log('key not found');
        const jwtKey = process.env.CLERK_JWT_KEY?.replace(/\\n/g, '\n');
        const session = await verifyToken(sessionToken, {
            jwtKey: jwtKey,
            authorizedParties: ['http://localhost:5173'],
        });
        socket.user = session.sub;
        next();
    }
    catch (e) {
        next(new Error('Authentication error'));
    }
});
io.on('connection', async (socket) => {
    console.log('a user connected');
    const clerkUser = await clerkClient.users.getUser(socket.user);
    console.log(clerkUser.username);
    if (clerkUser.username) {
        onlineUsers.set(clerkUser.username, socket.id);
        console.log('✅ Auto-registered:', clerkUser.username);
    }
    socket.on('private_message', async (payload) => {
        if (!clerkUser)
            return;
        payload.fromUsername = clerkUser.username + '';
        console.log(payload);
        const existingChat = await findOrCreateChat(payload);
        const sender = await prisma.user.findFirst({
            where: {
                username: payload.fromUsername,
            },
        });
        if (!sender)
            return new Error('sender not found');
        const createmsg = await prisma.message.create({
            data: {
                text: payload.message,
                chatId: existingChat.id,
                senderid: sender.id,
            },
        });
        console.log('online Users', onlineUsers);
        const messageData = {
            text: createmsg.text,
            chatId: createmsg.chatId,
            sender: {
                id: sender.id,
                username: sender.username,
            },
            createdAt: createmsg.createdAt,
        };
        const recipientSocketId = onlineUsers.get(payload.toUsername);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('message', messageData);
        }
        socket.emit('message', messageData);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
        if (clerkUser?.username) {
            onlineUsers.delete(clerkUser.username);
        }
    });
});
server.listen(3000, () => {
    console.log('listening');
});
//# sourceMappingURL=server.js.map