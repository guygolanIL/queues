import { ILocation } from "./Location";
import { ITherapist } from "./Therapist";

export interface IQueue {
    service: string;
    therapist?: ITherapist;
    location: ILocation;
    date: string;
}