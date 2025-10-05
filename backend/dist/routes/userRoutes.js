import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const userRouter = Router();
const prisma = new PrismaClient();
userRouter.get('/allUsers', async (req, res) => {
    try {
        const users = await prisma.user.findMany({});
        res.status(200).json({ users });
    }
    catch (e) {
        console.error('Error while getting the users', e);
    }
});
export default userRouter;
//# sourceMappingURL=userRoutes.js.map