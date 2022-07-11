import { Builder, Browser, By, until, WebDriver } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import { getQueueHash, IQueue } from '../../../data/Queue';
import { DataFetcher } from '../DataFetcher';
import { MaccabiLandingPage, TableRow } from './pageObjects/MaccabiLandingPage';
import { writeFileSync } from 'fs';

function tableRowToQueue(queueKind: string, cityOrBranch: string, row: TableRow): IQueue {
    const [firstName, lastName] = row.doctor_name!.split(" ");
    const {date, time} = row;
    const [day, month, year] = date!.split('/');
    const [hr, min] = time!.split(':');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hr), parseInt(min));
    const queue = {
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

    const queueHash = getQueueHash(queue);
    return {
        ...queue,
        hash: queueHash,
    }
}

export class MaccabiDataFetcher extends DataFetcher {

    async fetch() {
        
        async function saveScreenshot(driver: WebDriver, fileName: string) {
            const screenshot = await driver.takeScreenshot();
            writeFileSync(fileName + ".png", screenshot, 'base64');
        }

        let driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(
            new Options()
            .headless()
            .addArguments('--incognito')
            .addArguments('--start-maximized')
            .addArguments('--disable-gpu')
            .addArguments('--no-sandbox')
            .addArguments('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36')
        ).build();
        const queueKind = "תור לשיננית";
        const cityOrBranch = "נתניה";
        try {
            await driver.get(MaccabiLandingPage.url);
            const mainPage = new MaccabiLandingPage(driver);
            await saveScreenshot(driver, 'landingScreenshot');
            await mainPage.noCookies(() => {
                console.log('about to select the queue kind');
                return mainPage.selectQueueKind(queueKind);
            });

            await saveScreenshot(driver, 'queueKindScreenShot');

            await mainPage.noCookies(() => {
                console.log('about to select the dob');
                return mainPage.selectDateOfBirth();
            });

            await saveScreenshot(driver, 'dobScreenshot');

            await mainPage.noCookies(() => {
                console.log('about to select the city or branch');
                return mainPage.selectCityOrBranch("נתניה");
            });

            await saveScreenshot(driver, 'branchScreenshot');

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