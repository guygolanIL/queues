import TelegramBot from 'node-telegram-bot-api';
import { IUserSelection, UserSelectionModel } from '../data/UserSelections';
const TOKEN = "5149898098:AAGk2NbFst3B4w-ZOqwrxHkTtfKyGzwW8qE";
import { toString } from '../data/UserSelections';

const bot = new TelegramBot(TOKEN, {
    polling: true
});

const userSelections: { [key: number]: IUserSelection } = {};

export function initBot() {

    bot.on('polling_error', (err) => {
        console.log(err);
    });

    bot.on('error', (err) => {
        console.log(err);
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const shouldExit =  await handleCommands(msg);

        if (shouldExit) {
            return;
        } 
        
        const userSelectionModel = await UserSelectionModel.findOne({ chatId })
          
        if(!userSelectionModel) {
            return;
        }
        
        switch (userSelectionModel.step) {
            case 'done':
                bot.sendMessage(chatId, 'Im already familiar with you :). if you want to alter your query please type /start');
                break;

            case 'service':
                if (msg.text === 'תור לשיננית') {

                    userSelectionModel.data.service = "תור לשיננית";
                    userSelectionModel.step = 'location';
                    
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
                    ])()
                }
                break;

            case 'location':
                if (msg.text === 'נתניה') {
                    userSelectionModel.data.location = 'נתניה';
                    userSelectionModel.step = 'therapist';

                    bot.sendMessage(chatId, 'Finally, please select the therapist', {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
                } else {
                    createHandleUnknownCommand(chatId, [
                        [{ text: 'נתניה' }]
                    ])()
                }
                break;

            case 'therapist':
                userSelectionModel.data.therapist = msg.text;
                userSelectionModel.step = 'done';
                bot.sendMessage(chatId, 'Roger that, if we find queues that match your query we will post them here.');
                break;

            default:
                console.error('invalid state', userSelectionModel);
                userSelectionModel.step = 'service';
                userSelectionModel.data = {};
                bot.sendMessage(chatId, 'An error occurred please use the /start to start fresh');
        }


        await userSelectionModel.save();
    });
}

async function handleCommands(msg: TelegramBot.Message): Promise<boolean> {
    const chatId = msg.chat.id;

    const commands: {[key: string]: Function} = {
        '/start': async () => {
        
            await UserSelectionModel.deleteMany({ chatId });

            const userSelection = new UserSelectionModel({
                chatId,
                data: {},
                step: 'service',
            });
            
            try {
                await userSelection.save();    
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

            const userSelection = await UserSelectionModel.findOne({chatId});

            if (userSelection){
                bot.sendMessage(chatId, `Ok, this is all we know about your query\n${toString(userSelection)}`);
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

const createHandleUnknownCommand = (chatId: number, keyboard: TelegramBot.KeyboardButton[][]) => () => {
    bot.sendMessage(chatId, 'Unknwon command. please try again', {
        reply_markup: {
            keyboard,
        },
    });
};
