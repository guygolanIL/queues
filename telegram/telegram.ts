import axios from 'axios';
import { IQueue, toMessage } from '../data/Queue';
const TOKEN = "5149898098:AAGk2NbFst3B4w-ZOqwrxHkTtfKyGzwW8qE";
const TELEGRAM_DOMAIN = "https://api.telegram.org/bot";
const groupId = -788712668;

const sendMessage = (msg: string) => {
    return axios.post(`${TELEGRAM_DOMAIN}${TOKEN}/sendMessage`, {
        chat_id: groupId,
        text: msg
    });
}

const MAX_MESSAGES_PER_CHUNK = 10;

const sendQueuesByChunks = (queues: IQueue[], onQueuesSent: (queues: IQueue[]) => void) => {
    
    function prepareChunkMessage(chunk: IQueue[]) {
        const queueMessages = chunk.map(queue => toMessage(queue));
        const message = queueMessages.join('\n ------------------------------------- \n');

        return `Found ${chunk.length} new appointment${chunk.length === 1 ? "" : "s"}:\n\n` + message;
    }

    for (let i = 0; i < queues.length; i += MAX_MESSAGES_PER_CHUNK) {
        const chunk = queues.slice(i, i + MAX_MESSAGES_PER_CHUNK);
        const message = prepareChunkMessage(chunk);
        sendMessage(message)
            .then(() => {
                onQueuesSent(chunk);
            })
            .catch((err) => {
                console.error('failed to send chunk', chunk, err);
            })
        
    }
}

export const telegram = {
    sendMessage,
    sendQueuesByChunks,
}