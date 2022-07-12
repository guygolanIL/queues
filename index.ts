import express from 'express';
import cors from 'cors';
import { json } from 'express';
import { initBot } from './telegram/telegram';
import { connect } from 'mongoose';
import * as dotenv from 'dotenv';
import { scheduleJob } from 'node-schedule';
import { QueueManager } from './data/data-manager/QueueManager';
import { fetchers } from './data-fetchers/dataFetchers';

dotenv.config();

const app = express();
app.use(json());
app.use(cors());

const queueManager = new QueueManager();

scheduleJob('*/60 * * * * *', async () => {
    console.log('fetching queues job started');
    const { queues } = await fetchers['maccabi'].fetch();
    console.log(`found ${queues.length} queues`, queues);
    await queueManager.update(queues);
    console.log('fetching queues job ended');
});

scheduleJob('*/60 * * * * *', async () => {
    console.log('calculate notifications job started');
    await queueManager.calculateNotifications();
    console.log('calculate notifications job ended');
});


app.get('/', (req, res) => {
    return res.send({ hello: 'world'});
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gspqo.mongodb.net/?retryWrites=true&w=majority`)
        .then(() => {
            console.log(`server started on ${PORT}`);
            
            initBot();
        })
        .catch(err => console.log('failed to connect to db with err', err));
});


module.exports = app;