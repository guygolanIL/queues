import express from 'express';
import cors from 'cors';
import { json } from 'express';
import { QueueManager } from './data/data-manager/QueueManager';
import schedule from 'node-schedule';
import { initBot } from './telegram/telegram';
import { IQueue } from './data/Queue';
import { fetchers } from './crawlers/provider-data-fetcher/dataFetchers';
import {connect} from 'mongoose';
import * as dotenv from 'dotenv';
import { IUserSelection, UserSelectionModel } from './data/UserSelections';

dotenv.config()

const app = express();
app.use(json());
app.use(cors());

app.listen(4000, () => {
    initBot();

    connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gspqo.mongodb.net/?retryWrites=true&w=majority`)
        .then(() => console.log('server started on 4000'))
        .catch(err => console.log('failed to connect to db with err', err));
});