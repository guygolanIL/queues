import { IQueue } from "../data/Queue";

export abstract class DataFetcher {

    abstract fetch(service: string, place: string): Promise<{ queues: Array<IQueue>}>;
}