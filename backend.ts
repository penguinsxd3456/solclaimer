import express from 'express';
import fs from 'fs';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const LOG_FILE = './burn_log.json';

app.get('/logBurn', (req, res) => {
    const data = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
    res.json(data);
});

app.post('/logBurn', (req, res) => {
    const { user, amount, signature, date } = req.body;
    const data = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
    data.push({ user, amount, signature, date });
    fs.writeFileSync(LOG_FILE, JSON.stringify(data, null, 2));
    res.send({ status: 'ok' });
});

app.listen(3000, () => console.log('Backend running on http://localhost:3000'));
