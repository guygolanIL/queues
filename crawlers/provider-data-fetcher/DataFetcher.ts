import { IProvider } from "../data/Provider";

export abstract class DataFetcher {
    abstract fetch(): Promise<IProvider>;
}