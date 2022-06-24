import axios from "axios";
import { IProvider } from "../../data/Provider";
import { fetchers } from "../../provider-data-fetcher/dataFetchers";
import { Command } from "../CommandManager";


async function updateProvider(providerName: string, data: IProvider) {
    console.log('sending data to server', data);
    const res = await axios.put(`http://localhost:4000/providers/${providerName}`, data);
}

export const run: Command = {
    async execute(flags) {

        async function run(provider: string) {
            try {
                const fetcher = fetchers[provider];
                const data = await fetcher.fetch();
                updateProvider(provider, data);
            } catch (e) {
                console.log(e);
            }
        }

        console.log('running command run with flags ', flags);
        const { provider, watch } = flags;

        run(provider);

        if (watch !== undefined) {
            console.log('starting watch mode', watch);
            setInterval(() => {
                run(provider);
            }, parseInt(watch) * 60 * 1000);
        }
    },
    validateFlags(flags) {
        const providerFlag = flags.provider;
        const fetcher = fetchers[providerFlag];
        if (!fetcher) throw new Error(`invalid flag "provider" value ${providerFlag}`);
    },
}