import { Schema, model } from 'mongoose';

export interface IUserSelection {
    step: 'service' | 'location' | 'therapist' | 'done';
    chatId: number;
    data: {
        service?: string;
        therapist?: string;
        location?: string;
    }
}

const userSelectionSchema = new Schema<IUserSelection>({
    step: { type: String, required: true },
    chatId: { type: Number, required: true },
    data: {
        type: new Schema({
            service: {type: String, required: false},
            therapist: {type: String, required: false},
            location: {type: String, required: false}
        }),
        required: true
    }
});

export const UserSelectionModel = model('UserSelection', userSelectionSchema);

export function toString(userSelection: IUserSelection): string {
    const { service, location, therapist } = userSelection.data;
    return `service: ${service || "Not selected"}\nlocation: ${location || "Not selected"}\ntherapist: ${therapist || "Not selected"}`;
}
