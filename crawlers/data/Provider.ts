import { IQueue } from "./Queue";

export interface IProvider {
    name: string;
    queues: Array<IQueue>;
}