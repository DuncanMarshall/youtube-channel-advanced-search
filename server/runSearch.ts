const path = require('path');
const fs = require('fs');
const { chromium,  Locator, ElementHandle  } = require('playwright');
let nowTime = (new Date()).getTime() / 1000;
const historiesDir = "histories";
import { video } from './videoInterface';
import { getVideos } from './getVideos';

interface searchArgs { 
    channelId: string, 
    sortby?: string, 
    asc?: Boolean, 
    min_duration?: number, 
    max_duration?: number, 
    min_views?: number, 
    max_views?: number, 
    min_published?: number, 
    max_published?: number, 
    query?: Array<string>,
    page?: number
}


export function runSearch({ 
    channelId, 
    sortby = "published", 
    asc = false, 
    min_duration = 0, 
    max_duration = 45000, 
    min_views = 0, 
    max_views = 1000000000000, 
    min_published = 0, 
    max_published = 2039606260, 
    query = [],
    page = 1
}: searchArgs) {

    const pageLength = 60;

    const videos = getVideos(channelId);

    const allList: video[] = [];

    for (const videoId in videos) {

        const video = videos[videoId];

        if (video.duration < min_duration){continue;}
        if (video.duration > max_duration){continue;}
        if (video.published < min_published){continue;}
        if (video.published > max_published){continue;}
        if (video.views < min_views){continue;}
        if (video.views > max_views){continue;}


        let missingTerm = false;
        for (const term of query) {

            if (!video.title.includes(term)) {
                missingTerm = true;
                break;
            }

        }

        if (missingTerm) {continue;}

        allList.push(video);

    }

    const sortedList = Object.values(allList).sort((x: video, y: video) => {
        const a = Number(y[sortby as keyof video]);
        const b = Number(x[sortby as keyof video]);
        if (!asc){return a - b;}
        return b - a;
    });

    const pageList = sortedList.slice((page - 1) * pageLength, page * pageLength);

    return pageList;

}
