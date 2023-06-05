const express = require('express');
const { money, time } = require('./time_words');
require('dotenv').config();

let app = express();
let { PORT } = process.env;

app.use(express.json());

app.post('/data', async (req, res) => {
    const { body: { count, language, mimetype } } = req;
    let timeJSON = time(count, language, mimetype);
    let json = {
        "price": money(count, language, mimetype),
        "time": timeJSON.time,
        "deadline": timeJSON.deadline,
        "deadline_date": timeJSON.deadline_data
    }
    res.json(json);
})

app.listen(PORT, () => {
    try {
        console.log(`Server started on port ${PORT}`)
    } catch (err) {
        console.log(err);
    }
})