const {time} = require('./time_words');

let workday1 = new Date(2023, 4, 15, 11, 25);
let workday2 = new Date(2023, 4, 15, 11, 25);
let workday3 = new Date(2023, 4, 12, 19, 25);
let holiday1 = new Date(2023, 4, 20, 9, 10);
let holiday2 = new Date(2023, 4, 20, 9, 10);
let holiday3 = new Date(2023, 4, 21, 9, 10);
let holiday4 = new Date(2023, 5, 21, 9, 10);

test(`0, eng, doc, ${workday1.toLocaleString()}`, ()=>{
    expect(time(0, 'en', 'doc', workday1)).toBe("Not enough symbols");
});

test(`33333, eng, doc, ${holiday1.toLocaleString()}`, ()=>{
    expect(time(33333, 'ua', 'doc', holiday1)).toStrictEqual({"deadline": 1684856400, "deadline_data": "23.05.2023, 18:40:00", "time": "26h 30m"});
});

test(`50000, eng, doc, ${holiday2.toLocaleString()}`, ()=>{
    expect(time(50000, 'en', 'doc', holiday2)).toStrictEqual({"deadline": 1686580800, "deadline_data": "12.06.2023, 17:40:00", "time": "151h 30m"});
});

test(`50000, eng, doc, ${workday2.toLocaleString()}`, ()=>{
    expect(time(50000, 'en', 'doc', workday2)).toStrictEqual({"deadline": 1685980500, "deadline_data": "05.06.2023, 18:55:00", "time": "151h 30m"});
});

test(`33333, eng, doc, ${workday3.toLocaleString()}`, ()=>{
    expect(time(33333, 'ua', 'doc', workday3)).toStrictEqual({"deadline": 1684252500, "deadline_data": "16.05.2023, 18:55:00", "time": "26h 30m"});
});

test(`33333, ukr, doc, ${holiday3.toLocaleString()}`, ()=>{
    expect(time(33333, 'ua', 'enc', holiday3)).toStrictEqual({"deadline": 1684929480, "deadline_data": "24.05.2023, 14:58:00", "time": "31h 48m"});
});

test(`324653, ukr, doc, ${holiday3.toLocaleString()}`, ()=>{
    expect(time(324653, 'ua', 'enc', holiday4)).toStrictEqual({"deadline": 1691062440, "deadline_data": "03.08.2023, 14:34:00", "time": "293h 24m"});
});