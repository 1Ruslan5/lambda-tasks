const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const net = require("net");
const express = require("express");
const { readFileSync, writeFileSync } = require("fs");
const { forecast, exchange, six, three, back, usd, eur } = require("./telegramButton")
const { privatApi, forecastApi, monoApi } = require("./apiRequest")
require('dotenv').config();

const app = express();
const { PORT, TOKEN } = process.env;
const bot = new TelegramBot(TOKEN, { polling: true });
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const getExchangeMono = async () => {
    try {
        let { data } = await axios.get(monoApi)
        var array = [data[0], data[1]]
        writeFileSync('./MonobanExchange', JSON.stringify(array));
    } catch (err) {
        console.log(err)
    }
}

const getForecastKharkiv = async (id, index) => {
    try {
        let indexValue = (index % 2) ? 1 : 2;
        let { data: { list } } = await axios.get(forecastApi);
        let text = "Weather forecast in Kharkiv:\n";
        let temp, feel, weather, date, day;
        for (let i = 0; i < list.length; i += indexValue) {
            date = new Date(list[i].dt_txt);
            temp = Math.round(list[i].main.temp);
            feel = Math.round(list[i].main.feels_like);
            weather = list[i].weather[0].description;
            if (date.getDate() === day) {
                text += `${date.getHours()}:00, air temperature: ${temp}°C, feels like: ${feel}°C, ${weather}\n`;
            } else {
                day = date.getDate();
                text += `\n${await getDate(date, 'weekday')}, ${day} ${await getDate(date, 'month')}\n${date.getHours()}:00, air temperature: ${temp}°C, feels like: ${feel}°C, ${weather}\n`;
            }
        }
        bot.sendMessage(id, text);
    } catch (err) {
        console.log(err)
    }
}

const getDate = async (currentData, type) => {
    return type === 'weekday'
        ? currentData.toLocaleString('en-US', { weekday: 'long' })
        : currentData.toLocaleString('en-US', { month: 'long' })
}

const getExchange = async (id, index) => {
    try {
        var arrfs = JSON.parse(readFileSync('./MonobanExchange', "utf8"));
        var answear = "";
        let { data } = await axios.get(privatApi)
        let i = (index) ? 0 : 1;
        const currency = ["EUR", "USD"]
        const usd_mas = data[i];
        answear += `PrivatBank ${currency[i]}:\nbuy: ${await roundUp(usd_mas.buy)}\nsale: ${await roundUp(usd_mas.sale)}`;
        answear += `\nMonobank ${currency[i]}:\nbuy: ${await roundUp(arrfs[index].rateBuy)}\nsale: ${await roundUp(arrfs[index].rateSell)}`;
        bot.sendMessage(id, answear);
    } catch (err) {
        console.log(err);
    }
}

const roundUp = async (number) => {
    return Math.round(number * 100) / 100
}

getExchangeMono();

bot.onText(/\/start/, (msg) => {
    const { chat: { id } } = msg;
    bot.sendMessage(id, "Welcome. Please, choose what function you want to use.", {
        "reply_markup": {
            "keyboard": [["Weather forecast in Kharkiv"], ["Exchange rate"]]
        }
    })
});

bot.on("text", async (msg) => {
    const { chat: { id } } = msg;
    const message = msg.text.toString();

    if (forecast === message) {
        bot.sendMessage(id, "What type of interval do you want?", {
            "reply_markup": {
                "keyboard": [["with interval at 3 oclock"], ["with interval at 6 oclock"], ["Go to back"]]
            }
        });
    }
    if (exchange === message) {
        bot.sendMessage(id, "What type of currency do you want?", {
            "reply_markup": {
                "keyboard": [["USD"], ["EUR"], ["Go to back"]]
            }
        });
    }
    if (three === message) {
        getForecastKharkiv(id, 3);
    }
    if (six === message) {
        getForecastKharkiv(id, 6);
    }
    if (back === message) {
        bot.sendMessage(id, "Please, choose what function you want to use.", {
            "reply_markup": {
                "keyboard": [["Weather forecast in Kharkiv"], ["Exchange rate"]]
            }
        })
    }
    if (usd === message) {
        getExchange(id, 0)
    }
    if (eur === message) {
        getExchange(id, 1)
    }
});

const socket = net.connect({ port: PORT, host: process.env.HOSTNAME || "localhost" });
setInterval(() => {
    socket.write("PING");
}, 20 * 60 * 1000);

setInterval(() => {
    getExchangeMono();
}, 5.1 * 60 * 1000)