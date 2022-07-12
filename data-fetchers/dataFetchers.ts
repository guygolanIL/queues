import { IQueue } from "../data/Queue";
import { services } from "../telegram/telegram";
import { DataFetcher } from "./DataFetcher";
import { MaccabiDataFetcher } from "./maccabi/MaccabiDataFetcher";

const fetchers: { [key: string]: DataFetcher } = {
    maccabi: new MaccabiDataFetcher(),
}

export async function fetchAllQueues(filters?: { service?: string }): Promise<{queues: IQueue[]}> {
    const queues: IQueue[] = [];

    if(filters?.service) {
        return await fetchers.maccabi.fetch(filters.service, 'נתניה');
    }

    for (const service of services) {
        queues.push(...((await fetchers.maccabi.fetch(service, 'נתניה')).queues));
    }

    return {queues};
}