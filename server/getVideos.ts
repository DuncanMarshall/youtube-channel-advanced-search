import path from 'path';
import fs from 'fs';
import { video } from './videoInterface';
const historiesDir = "histories"

export function getVideos(channelId: string): { [key: string]: video } {

    const historyFile = path.join(__dirname, historiesDir, channelId + ".json");
    let results: { [key: string]: video } = {};

    if (fs.existsSync(historyFile)) {

        const str = fs.readFileSync(historyFile, 'utf8');
        if (str.length > 0) {

            results = JSON.parse(`{${str.slice(0, -2)}}`);

        }

    }
    
    return results;

}