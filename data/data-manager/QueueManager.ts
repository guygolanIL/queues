import { bot } from "../../telegram/telegram";
import { getQueueHash, IQueue, QueueModel, toMessage } from "../Queue";
import { toString, UserModel } from "../User";

export class QueueManager {

    public async update(queues: IQueue[]) {
        const hashToQueueMap: { [key: string]: IQueue } = {};
        queues.forEach(queue => {
            hashToQueueMap[getQueueHash(queue)] = queue;
        });

        const oldQueues = await QueueModel.find({ hash: { $in: Object.keys(hashToQueueMap) } });

        const newQueues = Object.entries(hashToQueueMap).filter(([hash, queue]) => {
            const foundQueue = oldQueues.find(q => q.hash === hash);
            return !foundQueue;
        })
            .map(([, queue]) => queue);

        await QueueModel.insertMany(newQueues);
    }

    /**
     * 1. for each user find all the queues that match its query
     * 2. for those queues find those that havent been alerted about
     * 3. notify user of new queues 
     */
    public async calculateNotifications() {
        const MAX_MSG = 30;
        const users = await UserModel.find({ onboardStep: 'done' });
        console.log(`processing ${users.length} users requests`);
        for (const user of users) {
            console.log(`calculating for user ${user.chatId}`);

            const { location, service, therapist } = user.query;

            // find user's query matching queues 
            const queues = await QueueModel.find({ 
                service,
                'therapist.name': { $regex: therapist },
            });

            // find new unsent queues
            const unsentQueues = queues
            .filter(({ _id }) => !user.sentQueues.includes(_id.toString()))
            .splice(0, MAX_MSG);
            
            console.log(`found ${queues.length} queues that matched user ${user.chatId} (${unsentQueues.length} of them are new). query: (${toString(user)})`);

            if (unsentQueues.length > 0) {
                //notify user
                await bot.sendMessage(user.chatId, `Found ${unsentQueues.length} new queues for you :)`);
                const msgPromises = [];
                for (const unsentQ of unsentQueues) {
                    msgPromises.push(bot.sendMessage(user.chatId, toMessage(unsentQ)));
                }
                await Promise.all(msgPromises);
                const sentQueuesIds = unsentQueues.map(q => q._id.toString());
                user.sentQueues.push(...sentQueuesIds);
                await user.save();
            }

        }
    }
}