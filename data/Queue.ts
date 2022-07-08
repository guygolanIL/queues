import { ILocation } from "./Location";
import { ITherapist } from "./Therapist";
import {createHash} from 'crypto';

export interface IQueue {
    service: string;
    therapist?: ITherapist;
    location: ILocation;
    date: string;
}

function dateToMessage(date: string) {
    const dateObj = new Date(date);
    return dateObj.toLocaleString();
}

export function toMessage({ location, service, date, therapist }: IQueue) {
    const message = `service: ${service},\nlocation: ${location.branch},\ndate: ${dateToMessage(date)},\ntherapist: ${therapist?.firstName} ${therapist?.lastName}`;
    return message;
}

function getQueueHash(queue: IQueue) {
    const plainText = 
        `${queue.service};${queue.therapist?.firstName};${queue.therapist?.lastName};${queue.location.branch};${queue.location.city};${queue.date}`;

    return createHash('sha256').update(plainText).digest('hex');
}

export function compare(q1: IQueue, q2: IQueue) {
    return getQueueHash(q1) === getQueueHash(q2);
}