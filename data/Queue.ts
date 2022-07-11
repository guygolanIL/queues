import {createHash} from 'crypto';
import mongoose from "mongoose";

export interface ILocation {
    city?: string;
    branch?: string;
}

export interface ITherapist {
    name: string;
}

export interface IQueue {
    service: string;
    therapist?: ITherapist;
    location: ILocation;
    date: string;
    hash: string;
}

const queueSchema = new mongoose.Schema<IQueue>({
    service: { type: String, required: true },
    therapist: { 
        type: new mongoose.Schema<ITherapist>({
            name: String
        }) 
    },
    location: { 
        type: new mongoose.Schema<ILocation>({
            branch: String,
            city: String,
        }), 
        required: true 
    },
    date: { type: String, required: true },
    hash: { type: String, required: true },
});

export const QueueModel = mongoose.model('Queue', queueSchema);

function dateToMessage(date: string) {
    const dateObj = new Date(date);
    return dateObj.toLocaleString();
}

export function toMessage({ location, service, date, therapist }: IQueue) {
    const message = `service: ${service},\nlocation: ${location.branch},\ndate: ${dateToMessage(date)},\ntherapist: ${therapist?.name}`;
    return message;
}

export function getQueueHash(queue: Omit<IQueue, 'hash'>) {
    const plainText = 
        `${queue.service};${queue.therapist?.name};${queue.location.branch};${queue.location.city};${queue.date}`;

    return createHash('sha256').update(plainText).digest('hex');
}