import express from 'express';
import { verifyWebhook } from '@clerk/express/webhooks';
import { PrismaClient } from '@prisma/client';
const webhookRouter = express.Router();
const prisma = new PrismaClient();
webhookRouter.post('/webhooks', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const evt = await verifyWebhook(req);
        if (evt.type === 'user.created') {
            const { id, username } = evt.data;
            console.log(evt.data);
            if (!username)
                return;
            await prisma.user.create({
                data: {
                    username: username,
                },
            });
        }
        res.status(200).send('user created');
    }
    catch (e) {
        console.error('Error handling webhook');
        res.status(400).send('webhook verification failed');
    }
});
webhookRouter.get('/test', (req, res) => {
    res.send('test');
});
export default webhookRouter;
//# sourceMappingURL=webhook.js.map