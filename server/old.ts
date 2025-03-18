

import express, { Request, Response } from 'express';
import path from 'path';
import http from 'http';
import WebSocket from 'ws';

const {runImport, finishImporting, deleteHistory} = require("./runImport.ts");
const {runSearch} = require("./runSearch.ts");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const WEB_DIR = path.join(__dirname, '../client/build/');

app.get('/:filename', (req: Request, res: Response) => {
    const filePath = path.join(WEB_DIR, req.params.filename);

    console.log(`Serving ${filePath}`)

    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('404 Not Found');
        }
    });
});

interface ImportOrder {

    channelId: string;
    videos: boolean;
    shorts: boolean;
    lives: boolean;
    update: boolean;

}

interface Message {
    cmd: string;
    data: string;
}

let importRunning = false;
let searchRunning = false;
let stopImport = false;

wss.on('connection', (ws) => {

    ws.on('message', (data) => {

        const message = JSON.parse(data.toString()) as Message;


        if (message.cmd == "delete") {

            deleteHistory(message.data);
            ws.send(JSON.stringify({cmd: "history_deleted"}));

        } else if (message.cmd == "search") {

            if (searchRunning) {return;}
            const searchResults = runSearch(JSON.parse(message.data));

            ws.send(JSON.stringify({cmd: "search_results", data: searchResults}))

        } else if (message.cmd == "import") {

            if (importRunning) {return;}

            runImport(JSON.parse(message.data), function (message: string) {

                ws.send(JSON.stringify({cmd: "import_progress", progressMessage: message})
            )

            }, function () {

                ws.send(JSON.stringify({cmd: "import_finished"}))

            })

            ws.send(JSON.stringify({cmd: "import_started", channelId: JSON.parse(message.data).channelId}))

        } else if (message.cmd == "stop_import") {

            finishImporting();
        }

    });

    ws.on('close', () => console.log('Client disconnected'));
});

server.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
