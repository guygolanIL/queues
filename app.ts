import express from 'express';
import cors from 'cors';
import { json } from 'express';
import { QueueManager } from './data/data-manager/QueueManager';
import schedule from 'node-schedule';
import { telegram } from './telegram/telegram';
import { IQueue } from './data/Queue';
import { fetchers } from './crawlers/provider-data-fetcher/dataFetchers';

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

schedule.scheduleJob('* */10 * * * *', function () {
    console.log('starting to fetch maccabi dent data');

    fetchers['maccabi'].fetch()
    .then(({ queues }) => {
        queueManager.update('maccabi', queues);
    })
    .catch(err => {
        console.log(err);
    });
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

app.listen(4000, () => {
    console.log('server started on 4000');
});