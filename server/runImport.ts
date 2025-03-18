/*
Contains functions for web scraping youtube, and managing the resulting json files.

*/
import { chromium, Locator, ElementHandle } from 'playwright';
import * as playwright from 'playwright';
import path from 'path';
import fs from 'fs';
import { getVideos } from './getVideos';
import { video } from './videoInterface';
import { ImportOrder } from './ImportOrderInterface';

let nowTime = (new Date()).getTime() / 1000;
const historiesDir = "histories"


//takes the way views are represented on youtube, and make it in to a number of views
function viewsStrToInt(str: string): number {
    const regex = /^(\d+\.?\d*)([KMB])$/i;

    str = str.substring(0, str.indexOf(" "))
    const match = str.match(regex);
  
    if (!match) return parseInt(str);
  
    const num = parseFloat(match[1]);
    const unit = match[2].toLowerCase();


    const units: { [key: string]: number } = { k: 1000, m: 1000000, b: 1000000000 };
  
    return Math.round(num * units[unit]);
}

//converts the way duration is represented on youtube and makes it a number
function timeStringToSeconds(time: string): number {
    const parts = time.split(':').map(Number);
    let seconds = 0;
    for (let i = 0; i < parts.length; i++) {
        seconds += parts[parts.length - 1 - i] * Math.pow(60, i);
    }
    return seconds;
}
  
//converts the way published date is shown on youtube, and makes it in to a number
function ageToTimestamp(str: string): number {
    if (str.indexOf("Streamed") >= 0) {
      str = str.substring(9);
    }
    const space = str.indexOf(" ");
    let num = parseInt(str.substring(0, space), 10);
  
    if (str.indexOf("minute") > 0) {
        num *= 60;
    } else if (str.indexOf("hour") > 0) {
        num *= 60 * 60;
    } else if (str.indexOf("day") > 0) {
        num *= 60 * 60 * 24;
    } else if (str.indexOf("week") > 0) {
        num *= 60 * 60 * 24 * 7;      
    } else if (str.indexOf("month") > 0) {
        num *= 60 * 60 * 24 * 31;
    } else if (str.indexOf("year") > 0) {
        num *= 60 * 60 * 24 * 365;
    }
  
    const time_now = nowTime;
    return Math.round(time_now - num);
}



let run = true;  //boolean for when to keep looking for new results

//terminate the actively running import
export function finishImporting() {

    run = false;

}

//delete a history json file by channel id
export async function deleteHistory(channelId: string) {

    const historyFile = path.join(__dirname, historiesDir, channelId + ".json");
    try {
        fs.unlinkSync(historyFile);
        console.log('File deleted successfully');
    } catch (error) {
        console.error("File already doesn't exist");
    }

}

//use playwright to open up a youtube channel page and web scrape the videos
export async function runImport(importOrder: ImportOrder, progress: (message: string) => void, finish: () => void) {

    console.log("Running import: ", importOrder);

    nowTime = (new Date()).getTime() / 1000;
    const historyFile = path.join(__dirname, historiesDir, importOrder.channelId + ".json");
    let storedResults = getVideos(importOrder.channelId);
    const browser = await chromium.launch({ headless: true});
    const page = await browser.newPage();
    await page.goto(`https://www.youtube.com/${importOrder.channelId}/videos`);
    console.log("Navigated to page.")
    const button = await page.locator('form[action="https://consent.youtube.com/save"] button').nth(1);
    await button.waitFor({ timeout: 3000 });
    if (await button.isVisible()) {

        await button.click();

    } else {

        console.log("Did not find the button");
        finish();
        return;

    }

    await page.waitForTimeout(3000);


    //set the language

    const buttonCount = await page.locator('#end yt-icon-button').count();
    if (buttonCount == 0) {

        console.log("Couldn't find #end button");
        finish();
        return;

    }
    const locator = await page.locator('#end yt-icon-button');
    await locator.click({ position: { x: 10, y: 10 } });    
    await page.locator("tp-yt-iron-dropdown a").nth(1).click()
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: 'English (US)' }).click();
    await page.waitForTimeout(1000);

    try {

        await page.waitForSelector('ytd-rich-item-renderer', { timeout: 10000 });

    } catch(e) {

        console.log("Failed waiting for video items...")
        process.exit()

    }

    let finished = false;
    let first = 0;
    let highestNumVids = 0;

    run = true;

    while (run) {

        console.log("Grabbing a batch of videos");

        let count = 0;
        const elements = await page.locator('ytd-rich-item-renderer');
        const numVids = await elements.count();
        console.log(`Found ${numVids} videos`)
        const start = Math.max(first - 1, 0);
        for (let i = start; i < numVids; i++) {

            console.log("Iterating over items " + i)
    
            const element = elements.nth(i);
            const retVal = await processVideo(element);
            console.log("Video processed")
            count++;

            if (retVal != undefined) {
                console.log("processVideo returned non-undefined", retVal)

                if (storedResults[retVal["id"]] == undefined){

                    const storeObj = {
                        title: retVal.title,
                        id: retVal.id,
                        published: retVal.published,
                        duration: retVal.duration,
                        views: retVal.views
                    }
    
                    //storedResults[retVal["id"]] = retVal;

                    fs.appendFileSync(historyFile, `"${retVal["id"]}": ${JSON.stringify(storeObj)},\n`);

                    console.log("File written ")

                } else if (importOrder.update) {

                    console.log("Already have this video, and we're running update")
                    await browser.close();
                    return terminateFile();

                }

            } else {

                console.log("Got an undefined video item")

            }
            
            first = i;
            
        }

        progress(`Did ${count} in this batch`);

        if (numVids == highestNumVids) {

            run = false;

        }

        highestNumVids = numVids;
        await page.waitForTimeout(1000);
        await page.mouse.wheel(0, 2000);

    }

    console.log("Got to the end of videos.")

    await browser.close();
    return terminateFile();

    function terminateFile() {

        storedResults = getVideos(importOrder.channelId);
        const sortedArray = Object.values(storedResults).sort((x, y) => y.published - x.published);
        fs.writeFileSync(historyFile, '');
        
        for (const item of sortedArray) {
    
            fs.appendFileSync(historyFile, `"${item["id"]}": ${JSON.stringify(item)},\n`);
    
        }
    
        finish();

    }
}


//extract data from individual video result dom elements
async function processVideo(element: Locator): Promise<video | undefined> {

    let titleText = "";
    let viewsText = "";
    let ageText = "";
    let lengthText = "";
    let href = "";

    const titleElement = await element.locator('#video-title').first();

    if (await titleElement.isVisible()) {

        titleText = await titleElement.innerText();

    } else {

        return undefined;

    }

    const hrefElement = element.locator('#video-title-link').first();
    let temp = await hrefElement.getAttribute('href');
    if (temp == null) {href = ""}else{href = temp}
    const viewsElement = element.locator('#metadata-line span.ytd-video-meta-block').first();

    if (await viewsElement.isVisible()) {

        viewsText = await viewsElement.innerText();

    } else {

        return undefined;

    }
    
    const ageElement = element.locator('#metadata-line span.ytd-video-meta-block').nth(1);

    if (await ageElement.isVisible()) {

        ageText = await ageElement.innerText();

    } else {

        return undefined;

    }
    
    const lengthElement = element.locator('div.thumbnail-overlay-badge-shape').nth(0);
    lengthText = await lengthElement.innerText();

    let id = href.substring("/watch?v=".length)

    if (id.indexOf("&") > 0) {

        id = id.substring(0, id.indexOf("&"));
        console.log("HERE IS ONE: " + id);

    }

    return {
        title: titleText,
        id: href.substring("/watch?v=".length),
        published: ageToTimestamp(ageText),
        duration: timeStringToSeconds(lengthText),
        views: viewsStrToInt(viewsText),
        element: element
    }

}
