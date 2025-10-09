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
        messages: true,
      },
    });
    console.log(chats);
    res.status(200).json({ chats });
  } catch (e) {
    console.error(e);
    return res.json({ msg: 'internal server error' });
  }
});

export default userRouter;
