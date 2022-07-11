import { By, Key, until, WebDriver } from "selenium-webdriver";

export type TableRow = {
    clinic_name?: string;
    doctor_name?: string;
    time?: string;
    date?: string;
};

export class MaccabiLandingPage {
    static url = "https://maccabi-dent.com/%d7%aa%d7%95%d7%a8-%d7%9c%d7%9c%d7%90-%d7%a1%d7%99%d7%a1%d7%9e%d7%90/";

    constructor(private driver: WebDriver) { }

    async noCookies(f: () => Promise<unknown>) {
        await this.driver.manage().deleteAllCookies();
        await f();
        await this.driver.manage().deleteAllCookies();
    }

    async selectQueueKind(queueKind: string) {
        const queueKindSelect = await this.driver.wait(() => {
            return this.driver.findElement(By.css('.appointment-dropdown.search_clinic'));
        });

        await queueKindSelect.click();

        const queueKindOption = await this.driver.wait(() => {
            return this.driver.findElement(By.xpath("//label[contains(text(), 'שיננית')]"));
        });

        await queueKindOption.click();
    }

    async selectDateOfBirth() {
        const dob = '20/07/1991' + Key.TAB;
        const birthdateInput = await this.driver.wait(() => {
            return this.driver.findElement(By.css('.bdate-select input'));
        });

        await birthdateInput.sendKeys(dob);
    }

    async selectCityOrBranch(place: string) {
        const cityOrBranchInputSelector = By.css('input[placeholder = "חפש עיר או מרפאה*"]');
        const selector = await this.driver.wait(() => {
            return this.driver.findElement(cityOrBranchInputSelector);
        });

        await this.driver.wait(until.elementIsEnabled(selector));

        await selector.sendKeys(place);

        await new Promise<void>((res) => setTimeout(() => res(), 2000));

        const cityOrBranchOptionSelector = By.xpath(`//div[@class = "search_clinic"]/div[@class = 'search_results']//li`);
        const options = await this.driver.wait(() => {
            return this.driver.findElements(cityOrBranchOptionSelector);
        });

        await options[0].click();
    }

    async continueToQueueSelection() {
        const buttonSelector = By.css("input[name='step_1_submit']");

        const submitButton = await this.driver.findElement(buttonSelector);

        await this.driver.wait(until.elementIsEnabled(submitButton));

        await submitButton.click();
    }

    async waitUntilLoadingCompleted() {
        const loaderSelector = By.css('.cal_loader');

        const loader = await this.driver.wait(() => this.driver.findElement(loaderSelector));
        await this.driver.wait(until.elementIsNotVisible(loader));

    }

    async getCurrentPageData() {

        const calendarRowsSelector = By.css('.calander .body > div');
        const rowsData: Array<TableRow> = [];
        const rows = await this.driver.findElements(calendarRowsSelector);

        for (const row of rows) {
            const attrs = ['clinic_name', 'date', 'time', 'doctor_name'] as Array<keyof TableRow>;
            const rowData: TableRow = {};
            for (const attr of attrs) {

                const cell = await row.findElement(By.css(`.td.${attr}`));
                let cellText = await cell.getText();
                rowData[attr] = cellText;
            }

            rowsData.push(rowData);
        }

        return rowsData;
    }

    async hasAnotherPage() {
        
        const nextPageAnchorSelector = By.xpath('//div[contains(@class, "simple-pagination")]//li/a[text()="לדף הבא"]');
        const foundElements = await this.driver.findElements(nextPageAnchorSelector);
        const hasAnotherPage = foundElements.length > 0;
        return hasAnotherPage;
    }

    async goToNextPage() {
        const nextPageAnchorSelector = By.xpath('//div[contains(@class, "simple-pagination")]//li/a[text()="לדף הבא"]');
        const foundElement = await this.driver.findElement(nextPageAnchorSelector);

        await foundElement.click();
    }
}
