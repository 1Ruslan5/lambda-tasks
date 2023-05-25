const express = require('express');
const time_words = require('./time_words');

let app = express();
let port = 3000;

app.use(express.json());

app.post('/data', async (req, res) =>{
    const data = req.body;
    let timeJSON = time_words.time(data.count, data.language, data.mimetype);
    let json = {
        "price": time_words.words(data.count, data.language, data.mimetype),
        "time": timeJSON.time,
        "deadline": timeJSON.deadline,
        "deadline_date": timeJSON.deadline_data        
    }
    res.json(json);
})

app.listen(port, ()=>{
    console.log(`Server started on port ${port}`)
})