import express from 'express';
import cors from 'cors';
import { json } from 'express';
import { QueueManager } from './data/data-manager/QueueManager';
import schedule from 'node-schedule';
import { telegram } from './telegram/telegram';
import { IQueue } from './data/Queue';

const app = express();

app.use(json());
app.use(cors());

const queueManager = new QueueManager();

schedule.scheduleJob('*/5 * * * * *', function () {
    const unsentQueues = queueManager.findUnsentQueues();

    if (unsentQueues.length) {
        telegram.sendQueuesByChunks(unsentQueues, (sentQueues: IQueue[]) => queueManager.markAsSent(sentQueues));
    }

});

app.get('/providers/:provider', (req, res) => {
    const { provider } = req.params;
    const savedProvider = queueManager.findProviderByName(provider);
    if (!savedProvider) {
        return res.send({
            message: 'provider not found'
        });
    }

    res.json(savedProvider);
});

app.put('/providers/:provider', (req, res) => {
    const { provider } = req.params;
    if (!req.body) {
        return res.json({
            message: 'no data sent'
        });
    }

    queueManager.update(provider, req.body.queues);

    res.json({ message: 'ok' });
});

app.listen(4000, () => {
    console.log('server started on 4000');
});