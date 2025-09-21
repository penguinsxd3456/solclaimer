import fs from 'fs';
export default async function handler(req, res) {
    const logFile = './burn_log.json';
    const data = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
    res.status(200).json(data);
}
