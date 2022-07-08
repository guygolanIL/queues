import { Builder, Browser, By, until } from 'selenium-webdriver';
import { IProvider } from '../../../data/Provider';
import { IQueue } from '../../../data/Queue';
import { DataFetcher } from '../DataFetcher';
import { MaccabiLandingPage, TableRow } from './pageObjects/MaccabiLandingPage';

function tableRowToQueue(queueKind: string, cityOrBranch: string, row: TableRow): IQueue {
    const [firstName, lastName] = row.doctor_name!.split(" ");
    const {date, time} = row;
    const [day, month, year] = date!.split('/');
    const [hr, min] = time!.split(':');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hr), parseInt(min));  
    return {
        therapist: {
            firstName,
            lastName,
        },
        location: {
            branch: cityOrBranch,
            city: cityOrBranch,
        },
        service: queueKind,
        date: dateObj.toUTCString(),
    };
}

export class MaccabiDataFetcher extends DataFetcher {

    async fetch() {
        let driver = await new Builder().forBrowser(Browser.CHROME).build();
        const queueKind = "תור לשיננית";
        const cityOrBranch = "נתניה";
        try {
            await driver.get(MaccabiLandingPage.url);
            const mainPage = new MaccabiLandingPage(driver);
            await mainPage.noCookies(() => {
                return mainPage.selectQueueKind(queueKind);
            });

            await mainPage.noCookies(() => {
                return mainPage.selectDateOfBirth();
            });

            await mainPage.noCookies(() => {
                return mainPage.selectCityOrBranch("נתניה");
            });

            await mainPage.noCookies(() => {
                return mainPage.continueToQueueSelection();
            });

            await mainPage.noCookies(() => {
                return mainPage.waitUntilLoadingCompleted();
            });

            const pages: Array<TableRow[]> = [];
            const pageRows = await mainPage.getCurrentPageData();
            pages.push(pageRows);

            let hasMorePages = await mainPage.hasAnotherPage();

            while (hasMorePages) {
                await mainPage.goToNextPage();
                const page = await mainPage.getCurrentPageData();
                pages.push(page);
                hasMorePages = await mainPage.hasAnotherPage();
            }

            const queues: Array<IQueue> = [];

            for (const page of pages) {
                const pageQueues: Array<IQueue> = [];
                for (const tableRow of page) {
                    const queue: IQueue = tableRowToQueue(queueKind, cityOrBranch, tableRow);
                    pageQueues.push(queue);
                }
                queues.push(...pageQueues);
            }

            return {
                queues,
            };
        } finally {
            await driver.quit();
        }
    }
}