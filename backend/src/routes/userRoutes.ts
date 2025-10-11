import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import { clerkClient } from '@clerk/express';

const userRouter = Router();
const prisma = new PrismaClient();

userRouter.get('/allUsers', async (req, res) => {
  try {
    const users = await prisma.user.findMany({});

    res.status(200).json({ users });
  } catch (e) {
    console.error('Error while getting the users', e);
  }
});

userRouter.get('/allChats', async (req: Request, res: Response) => {
  console.log('request reached all chats');
  try {
    if (!req.userId) return res.json({ msg: 'unauthorized' });
    const clerkUser = await clerkClient.users.getUser(req.userId);

    if (!clerkUser.username) return res.json({ msg: 'user not found' });

    const userDetails = await prisma.user.findUnique({
      where: { username: clerkUser.username },
    });
    if (!userDetails) return res.json({ msg: 'user details not found in db' });

    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: {
            id: userDetails.id,
          },
        },
      },
      include: {
        members: true,
        messages: {
          include: {
            sender: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    // Transform messages to match frontend expectations
    const transformedChats = chats.map((chat) => ({
      ...chat,
      messages: chat.messages.map((message) => {
        // Find receiver username (other member who is not the sender)
        const receiver = chat.members.find(
          (member) => member.id !== message.senderId
        );

        return {
          id: message.id.toString(),
          text: message.text,
          chatId: message.chatId.toString(),
          senderId: message.senderId.toString(),
          senderUsername: message.sender.username,
          reciverUsername: receiver?.username || '',
          createdAt: message.createdAt.toISOString(),
          tempId: '', // Not needed for existing messages
          status: 'sent' as const,
        };
      }),
    }));

    console.log(
      'Transformed chats:',
      JSON.stringify(transformedChats, null, 2)
    );
    res.status(200).json({ chats: transformedChats });
  } catch (e) {
    console.error(e);
    return res.json({ msg: 'internal server error' });
  }
});

userRouter.get('/search-user/:username', async (req, res) => {
  const username = req.params.username;
  console.log('request reached search user');
  console.log(username);

  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: username,
        },
      },
    });

    console.log('matching users ', users);
    res.status(200).json({ users });
  } catch (e) {
    console.error(e);
    res.status(400).json({ msg: 'internal server error' });
  }
});

userRouter.post('/createGroup', async (req: Request, res: Response) => {
  const {
    name,
    members,
  }: { name: string; members: { username: string; id: string }[] } = req.body;
  try {
    if (!req.userId) return res.json({ msg: 'unauthorized' });
    const clerkUser = await clerkClient.users.getUser(req.userId);

    if (!clerkUser.username) return res.json({ msg: 'user not found' });

    const chat = await prisma.chat.create({
      data: {
        isGroup: true,
        name,
        members: {
          connect: members.map((member) => ({ username: member.username })),
        },
      },
    });

    res.status(200).json({ chat });
  } catch (e) {
    console.error(e);
  }
});

export default userRouter;
