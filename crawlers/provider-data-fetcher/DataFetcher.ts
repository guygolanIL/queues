import { IProvider } from "../../data/Provider";
import { IQueue } from "../../data/Queue";

export abstract class DataFetcher {
    abstract fetch(): Promise<{ queues: Array<IQueue>}>;
}