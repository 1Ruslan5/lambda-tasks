import * as dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'
import { addText, coinExistText, deleteText, emptyListText, existDeleteText, helpText, invalidCommandText, startText } from '../view/string';
import { addToFavourite, currentSymbolM, deleteFavourite, helpM, listFavourite, listRecentM, startM } from '../controllers/telegram_comands'

dotenv.config()

const token = process.env.BOT_TOKEN!;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/^\/([A-Za-z]+)(?:\s(.*))?$/, (msg, match) => {
    let { chat: { id } } = msg;
    let command = '';
    let cryptoSymbol = '';
    if (match) {
        command = match[1];
        cryptoSymbol = match[2];
    }
    switch (command) {
        case 'help':
            return helpM(bot, msg, helpText);
        case 'start':
            return startM(bot, msg, startText);
        case 'listRecent':
            return listRecentM(bot, msg);
        case 'addToFavourite':
            return addToFavourite(bot, id, cryptoSymbol, addText, existDeleteText, coinExistText);
        case 'listFavourite':
            return listFavourite(bot, msg, emptyListText);
        case 'deleteFavourite':
            return deleteFavourite(bot, id, cryptoSymbol, deleteText, existDeleteText);
        default:
            return currentSymbolM(bot, msg, command, invalidCommandText);
    }
});

bot.on('callback_query', (msg) => {
    const { message, data } = msg;
    let request, symbol = '';
    let id = 0;
    if (data && message) {
        [request, symbol] = data.split('_');
        id = message.chat.id;
    }
    switch (request) {
        case 'addToFavourite':
            addToFavourite(bot, id, symbol, addText, existDeleteText, coinExistText);
            break;
        case 'deleteFavourite':
            deleteFavourite(bot, id, symbol, deleteText, existDeleteText);
            break;
        default:
            break;
    }
});