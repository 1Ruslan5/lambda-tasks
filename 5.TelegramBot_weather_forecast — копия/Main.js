import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import net from "net";
import express from "express";
import fs from "fs";

const app = express();
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const token = '6211433037:AAGCjoY254Xbe0baQRrVxBYAz4QO4g8nb0U';
const bot = new TelegramBot(token, {polling: true});
getExchangeMono();

bot.onText(/\/start/, (msg)=>{
    const id = msg.chat.id;
    bot.sendMessage(id, "Welcome. Please, choose what function you want to use.", {
    "reply_markup":{
        "keyboard":[["Weather forecast in Kharkiv"], ["Exchange rate"]]
    }})
});

bot.on("text", async (msg)=>{
    const id = msg.chat.id;
    const message = msg.text.toString();
    const forecast = "Weather forecast in Kharkiv";
    const exchange = "Exchange rate";
    const six = "with interval at 6 oclock";
    const three = "with interval at 3 oclock";
    const back = "Go to back";
    const usd = "USD";
    const eur = "EUR";
    if(forecast === message){
        bot.sendMessage(id, "What type of interval do you want?", {
            "reply_markup":{
                "keyboard":[["with interval at 3 oclock"], ["with interval at 6 oclock"], ["Go to back"]]
            }
        });
    }
    if(exchange === message){
        bot.sendMessage(id, "What type of currency do you want?", {
            "reply_markup":{
                "keyboard":[["USD"], ["EUR"], ["Go to back"]]
            }
        });
    }
    if(three === message){
        axios.get(
            'https://api.openweathermap.org/data/2.5/forecast?'+
            'lat=49.986387&lon=36.227873&appid=7f356605ab931defa1f5389e58e74d2c'+
            '&units=metric&lang=en')
        .then(response=>{
            let text = "Weather forecast in Kharkiv:\n";
            let list = response.data.list;
            let temp, feel, weather, date, day;
            for(let i in list){
                date = new Date(list[i].dt_txt);
                temp = Math.round(list[i].main.temp);
                feel = Math.round(list[i].main.feels_like);
                weather = list[i].weather[0].description;
                if(date.getDate() === day){
                    text += `${date.getHours()}:00, air temperature: ${temp}°C, ` +
                    `feels like: ${feel}°C, ${weather}\n`
                }else{
                    day = date.getDate();
                    text += `\n${date.toLocaleString('en-US', {weekday: 'long'})}, ` + 
                    `${day} ${date.toLocaleString('en-US', {month: 'long'})}\n` +
                    `${date.getHours()}:00, air temperature: ${temp}°C, ` +
                    `feels like: ${feel}°C, ${weather}\n`
                }
            }
            bot.sendMessage(id, text);
        });
    }
    if(six === message){
        axios.get(
            'https://api.openweathermap.org/data/2.5/forecast?'+
            'lat=49.986387&lon=36.227873&appid=7f356605ab931defa1f5389e58e74d2c'+
            '&units=metric&lang=en')
        .then(response=>{
            let text = "Weather forecast in Kharkiv:\n";
            let list = response.data.list;
            let temp, feel, weather, date, day;
            for(let i = 0; i < list.length; i+=2){
                date = new Date(list[i].dt_txt);
                temp = Math.round(list[i].main.temp);
                feel = Math.round(list[i].main.feels_like);
                weather = list[i].weather[0].description;
                if(date.getDate() === day){
                    text += `${date.getHours()}:00, air temperature: ${temp}°C, ` +
                    `feels like: ${feel}°C, ${weather}\n`
                }else{
                    day = date.getDate();
                    text += `\n${date.toLocaleString('en-US', {weekday: 'long'})}, ` + 
                    `${day} ${date.toLocaleString('en-US', {month: 'long'})}\n` +
                    `${date.getHours()}:00, air temperature: ${temp}°C, ` +
                    `feels like: ${feel}°C, ${weather}\n`
                }
            }
            bot.sendMessage(id, text);
        });
    }
    if(back === message){
        bot.sendMessage(id, "Please, choose what function you want to use.", {
            "reply_markup":{
                "keyboard":[["Weather forecast in Kharkiv"], ["Exchange rate"]]
        }})
    }
    if(usd === message){
        var arrfs = JSON.parse(fs.readFileSync('./MonobanExchange', "utf8"));
        var answear = "";
        await axios.get(
            'https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=11'
        ).then(response =>{
            const usd_mas = response.data[1];
            answear += `PrivatBank USD:\nbuy: ${Math.round(usd_mas.buy * 100) / 100}`+
            `\nsale: ${Math.round(usd_mas.sale * 100) / 100}`;
        })
        answear += `\nMonobank EUR:\nbuy: ${Math.round(arrfs[0].rateBuy * 100) / 100}`+
        `\nsale: ${Math.round(arrfs[0].rateSell * 100) / 100}`;
        bot.sendMessage(id,answear);
    }
    if(eur === message){
        var arrfs = JSON.parse(fs.readFileSync('./MonobanExchange', "utf8"));
        var answear = "";
        await axios.get(
            'https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=11'
        ).then(response => {
            const eur_mas = response.data[0];
            answear +=`PrivatBank EUR:\nbuy: ${Math.round(eur_mas.buy * 100) / 100}`+
            `\nsale: ${Math.round(eur_mas.sale * 100) / 100}`;
        })
        answear += `\nMonobank EUR:\nbuy: ${Math.round(arrfs[1].rateBuy * 100) / 100}`+
        `\nsale: ${Math.round(arrfs[1].rateSell * 100) / 100}`;
        bot.sendMessage(id, answear);
    }
});

const socket = net.connect({port: port, host:process.env.HOSTNAME|| "localhost"});
setInterval(() => {
    socket.write("PING");
}, 20 * 60 * 1000);

setInterval(()=>{
    getExchangeMono();
}, 5.1 * 60 * 1000)

function getExchangeMono(){
    axios.get(
            'https://api.monobank.ua/bank/currency'
        ).then(response =>{
            var array = [response.data[0], response.data[1]]
            fs.writeFileSync('./MonobanExchange',
            JSON.stringify(array));
    })
}
