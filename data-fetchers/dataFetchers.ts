import { IQueue } from "../data/Queue";
import { services, branches } from "../telegram/telegram";
import { DataFetcher } from "./DataFetcher";
import { MaccabiDataFetcher } from "./maccabi/MaccabiDataFetcher";

const fetchers: { [key: string]: DataFetcher } = {
    maccabi: new MaccabiDataFetcher(),
}

export async function fetchAllQueues(filters?: { service: string, branch: string }): Promise<{ queues: IQueue[] }> {
    const queues: IQueue[] = [];

    if (filters) {
        return await fetchers.maccabi.fetch(filters.service, filters.branch);
    }

    for (const service of services) {
        for (const branch of branches) {
            queues.push(...((await fetchers.maccabi.fetch(service, branch)).queues));
        }
    }

    return { queues };
}