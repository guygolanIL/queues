import { DataFetcher } from "./DataFetcher";
import { MaccabiDataFetcher } from "./maccabi/MaccabiDataFetcher";

export const fetchers: {[key: string]: DataFetcher} = {
    maccabi: new MaccabiDataFetcher(),
}