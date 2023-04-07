import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

process.env["NTBA_FIX_350"] = 1;
const token = "6288084592:AAFxWL38IAtj_jrx2iEbwqtFypBcAb6r75g";
const bot = new TelegramBot(token, {polling:true});

console.log("\nFunction 'Telegram Echo' is active:\n");
bot.on("message", (msg)=>{
    const id = msg.chat.id;
    const message = msg.text;
    const nameFirst = msg.from.first_name;
    const nameSecond = msg.from.last_name;
    if(message === "photo"){
        axios({
            method: 'get',
            url: 'https://picsum.photos/200/300',
            responseType: 'stream'
        })
        .then(response =>{
            bot.sendPhoto(id, response.data);
        })
        .catch(err=>{
            console.log(err);
        });
        name(nameFirst, nameSecond, "photo(got random picture)");
    }else{
        bot.sendMessage(id, "You wrote:  '" + message + "'.");
        name(nameFirst, nameSecond, message);
    }
})


function name(first_name, second_name, message){
    if(first_name === undefined){
        console.log(`User ${second_name} wrote: ${message}`)
    }else{
        if(second_name === undefined){
            console.log(`User ${first_name} wrote: ${message}`)
        }else{
            console.log(`User ${first_name} ${second_name} wrote: ${message}`)
        }
    }
}