import { Schema, model } from 'mongoose';

export interface IQuery {
    service?: string;
    therapist?: string;
    location?: string;
}

export interface IUser {
    chatId: number;
    onboardStep: 'service' | 'location' | 'therapist' | 'done';
    query: IQuery;
}

const userSchema = new Schema<IUser>({
    onboardStep: { type: String, required: true },
    chatId: { type: Number, required: true },
    query: {
        type: new Schema<IQuery>({
            service: { type: String, required: false },
            therapist: { type: String, required: false },
            location: { type: String, required: false }
        }),
        required: true
    }
});

export const UserModel = model('User', userSchema);

export function toString(user: IUser): string {
    const { service, location, therapist } = user.query;
    return `service: ${service || "Not selected"}\nlocation: ${location || "Not selected"}\ntherapist: ${therapist || "Not selected"}`;
}
