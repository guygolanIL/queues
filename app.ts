import express from 'express';
import cors from 'cors';
import { json } from 'express';
import { initBot } from './telegram/telegram';
import { connect } from 'mongoose';
import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import {fetchers} from './crawlers/provider-data-fetcher/dataFetchers';
import { scheduleJob } from 'node-schedule';
import { QueueModel } from './data/Queue';

dotenv.config();

const app = express();
app.use(json());
app.use(cors());


scheduleJob('*/60 * * * * *', () => {
    fetchers['maccabi'].fetch().then(({ queues }) => {


        QueueModel.insertMany(queues);
    });
});


app.listen(4000, () => {

    connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gspqo.mongodb.net/?retryWrites=true&w=majority`)
        .then(() => {
            console.log('server started on 4000');
            

            const bot = new TelegramBot(process.env.BOT_TOKEN || '', {
                polling: true
            });

            initBot(bot);
        })
        .catch(err => console.log('failed to connect to db with err', err));
});