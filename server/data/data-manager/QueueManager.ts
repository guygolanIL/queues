import { IProvider, IQueueInfo } from "../Provider";
import { compare, IQueue } from "../Queue";

export class QueueManager {

    providers: Array<IProvider> = [];

    public findProviderByName(providerName: string): IProvider | undefined {
        const providerWithStatus = this.providers.find((provider) => provider.name === providerName);
        return providerWithStatus;
    }

    public markAsSent(unsentQueues: IQueue[]) {
        this.providers.forEach(provider => {
            provider.queuesInfo.forEach(({ queue, telegramStatus }) => {
                const found = unsentQueues.find(unsentQueue => compare(unsentQueue, queue));
                if (found) {
                    telegramStatus.sent = true
                }
            });
        });
    }

    public findUnsentQueues(filters?: { provider?: string; therapistName?: string; service?: string }): IQueue[] {
        const providerFilter = filters?.provider;
        const therapistFilter = filters?.therapistName;
        const serviceFilter = filters?.service;

        const providers =
            this.providers
                .filter(provider => {
                    return providerFilter ? provider.name === providerFilter : true
                });

        const queuesWithStatus: IQueueInfo[] = providers.reduce((prev, curr) => {
            return [...prev, ...curr.queuesInfo];
        }, [] as IQueueInfo[]);

        const unsentQueues =
            queuesWithStatus
                .filter(({ telegramStatus }) => {
                    return !telegramStatus.sent
                })
                .filter(({ queue }) => {
                    return therapistFilter ? `${queue.therapist?.firstName} ${queue.therapist?.lastName}` === therapistFilter : true
                })
                .filter(({ queue }) => {
                    return serviceFilter ? queue.service === serviceFilter : true
                })
                .map(({ queue }) => queue);

        return unsentQueues;
    }

    public update(providerName: string, queues?: Array<IQueue>) {
        const provider = this.findProviderByName(providerName);
        if (!provider) {
            const newQueuesInfo: IQueueInfo[] | undefined = queues?.map(queue => ({ queue, telegramStatus: { sent: false } }));
            const newProvider: IProvider = {
                name: providerName,
                queuesInfo: newQueuesInfo || []
            };

            this.providers.push(newProvider);

        } else {
            if (!queues) return;
            queues.forEach(queue => {
                const foundQueueInfo = provider.queuesInfo.find(queueInfo => compare(queueInfo.queue, queue));
                if (!foundQueueInfo) {
                    provider.queuesInfo.push({ queue, telegramStatus: { sent: false } });
                } else {
                    console.log('queue already tracked', queue);
                }
            });
        }

    }
}