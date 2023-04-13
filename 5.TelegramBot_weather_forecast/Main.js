import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import net from "net";

const token = '6211433037:AAGCjoY254Xbe0baQRrVxBYAz4QO4g8nb0U';
const bot = new TelegramBot(token, {polling: true});

const socket = new net.Socket();
socket.connect({ port : 1200000, host: "forecast-weather.herokuapp.com"});

bot.onText(/\/start/, (msg)=>{
    const id = msg.chat.id;
    bot.sendMessage(id, "Welcome. Please, choose what function you want to use.", {
    "reply_markup":{
        "keyboard":[["Weather forecast in Kharkiv"]]
    }})
});

bot.on("text", (msg)=>{
    const id = msg.chat.id;
    const forecast = "Weather forecast in Kharkiv";
    const six = "with interval at 6 oclock";
    const three = "with interval at 3 oclock";
    if(forecast === msg.text.toString()){
        bot.sendMessage(id, "What type of interval do you want?", {
            "reply_markup":{
                "keyboard":[["with interval at 3 oclock"], ["with interval at 6 oclock"]]
            }
        });
    }
    if(three === msg.text.toString()){
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
            bot.sendMessage(id, "Please, choose what function you want to use.", {
                "reply_markup":{
                    "keyboard":[["Weather forecast in Kharkiv"]]
                }
            })
        });
        
    }
    if(six === msg.text.toString()){
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
            bot.sendMessage(id, "Please, choose what function you want to use.", {
                "reply_markup":{
                    "keyboard":[["Weather forecast in Kharkiv"]]
                }
            })
        });
    }
});