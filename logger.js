import fs from 'fs';
import os from 'os';

export function writeToLog(status) {
    const logStream = fs.createWriteStream(process.env.LOG_FILENAME, {flags: 'a'});
    logStream.write(`${new Date().toString()} - ${status}${os.EOL}`);
    logStream.end();
}