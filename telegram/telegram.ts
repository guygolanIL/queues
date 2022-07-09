import TelegramBot from 'node-telegram-bot-api';
import { IUser, UserModel } from '../data/User';
import { toString } from '../data/User';


export function initBot(bot: TelegramBot) {

    async function handleCommands(msg: TelegramBot.Message): Promise<boolean> {
        const chatId = msg.chat.id;

        const commands: { [key: string]: Function } = {
            '/start': async () => {

                await UserModel.deleteMany({ chatId });

                const userParams: IUser = {
                    chatId,
                    onboardStep: 'service',
                    query: {}
                }

                const user = new UserModel(userParams);

                try {
                    await user.save();
                    bot.sendMessage(chatId, `Welcome ${msg.from?.first_name}, please choose the desired service`, {
                        reply_markup: {
                            keyboard: [
                                [{ text: 'תור לשיננית' }],
                            ],
                        },
                    });
                } catch (error) {
                    console.log('error occured', error);
                }
            },
            '/info': async () => {

                const user = await UserModel.findOne({ chatId });

                if (user) {
                    bot.sendMessage(chatId, `Ok, this is all we know about your query\n${toString(user)}`);
                } else {
                    bot.sendMessage(chatId, `You dont have a query just yet. Use /start`);
                }
            }
        };
        const commandName = msg.text || '';
        const command = commands[commandName];
        if (command) {
            await command();
            return true;
        }

        return Promise.resolve(false);
    }

    bot.on('polling_error', (err) => {
        console.log(err);
    });

    bot.on('error', (err) => {
        console.log(err);
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const shouldExit = await handleCommands(msg);

        if (shouldExit) {
            return;
        }

        const userSelectionModel = await UserModel.findOne({ chatId })

        if (!userSelectionModel) {
            return;
        }

        switch (userSelectionModel.onboardStep) {
            case 'done':
                bot.sendMessage(chatId, 'Im already familiar with you :). if you want to alter your query please type /start');
                break;

            case 'service':
                if (msg.text === 'תור לשיננית') {

                    userSelectionModel.query.service = "תור לשיננית";
                    userSelectionModel.onboardStep = 'location';

                    bot.sendMessage(chatId, `Gotcha, please select the location`, {
                        reply_markup: {
                            keyboard: [
                                [{ text: 'נתניה' }]
                            ]
                        }
                    });
                } else {
                    createHandleUnknownCommand(chatId, [
                        [{ text: 'תור לשיננית' }],
                    ])(bot)
                }
                break;

            case 'location':
                if (msg.text === 'נתניה') {
                    userSelectionModel.query.location = 'נתניה';
                    userSelectionModel.onboardStep = 'therapist';

                    bot.sendMessage(chatId, 'Finally, please select the therapist', {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
                } else {
                    createHandleUnknownCommand(chatId, [
                        [{ text: 'נתניה' }]
                    ])(bot)
                }
                break;

            case 'therapist':
                userSelectionModel.query.therapist = msg.text;
                userSelectionModel.onboardStep = 'done';
                bot.sendMessage(chatId, 'Roger that, if we find queues that match your query we will post them here.');
                break;

            default:
                console.error('invalid state', userSelectionModel);
                userSelectionModel.onboardStep = 'service';
                userSelectionModel.query = {};
                bot.sendMessage(chatId, 'An error occurred please use the /start to start fresh');
        }


        await userSelectionModel.save();
    });
}

const createHandleUnknownCommand = (chatId: number, keyboard: TelegramBot.KeyboardButton[][]) => (bot: TelegramBot) => {
    bot.sendMessage(chatId, 'Unknwon command. please try again', {
        reply_markup: {
            keyboard,
        },
    });
};
