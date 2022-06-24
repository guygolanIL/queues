import { DataFetcher } from "./DataFetcher";
import { MaccabiDataFetcher } from "./maccabi/maccabi";

export const fetchers: {[key: string]: DataFetcher} = {
    maccabi: new MaccabiDataFetcher(),
}