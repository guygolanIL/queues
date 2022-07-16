import { Schema, model } from 'mongoose';
import { User as TelegramUser } from 'node-telegram-bot-api';

export interface IQuery {
    service?: string;
    therapist?: string;
    location?: string;
}

type TelegramUserData = Pick<TelegramUser, 'first_name' | 'last_name' | 'username'>;

export interface IUser {
    chatId: number;
    tgUser?: TelegramUserData; 
    onboardStep: 'service' | 'location' | 'therapist' | 'done';
    query: IQuery;
    sentQueues: string[];
}

const userSchema = new Schema<IUser>({
    onboardStep: { type: String, required: true },
    chatId: { type: Number, required: true },
    tgUser: { type: new Schema<TelegramUserData>({
        first_name: String,
        last_name: String,
        username: String,
    })},
    query: {
        type: new Schema<IQuery>({
            service: { type: String, required: false },
            therapist: { type: String, required: false },
            location: { type: String, required: false },
        }),
        required: true,
    },
    sentQueues: [{ type: Schema.Types.ObjectId, required: true, ref: 'Queue'}],
});

export const UserModel = model('User', userSchema);

export function toString(user: IUser): string {
    const { service, location, therapist } = user.query;
    return `service: ${service || "Not selected"}\nlocation: ${location || "Not selected"}\ntherapist: ${therapist || "Not selected"}`;
}
