import { IQueue } from "./Queue";
import { ITelegramStatus } from "./TelegramStatus";

export interface IQueueInfo {
    queue: IQueue;
    telegramStatus: ITelegramStatus;
}

export interface IProvider {
    name: string;
    queuesInfo: Array<IQueueInfo>;
}