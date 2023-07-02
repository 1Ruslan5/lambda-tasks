import * as dotenv from 'dotenv';
import TelegramBot, { Message } from 'node-telegram-bot-api'
import { RepositoryMySQL } from './RepositoryMySQL';
import { coinStats } from './api';
import { RepositorySQLite } from './RepositorySQLite';

dotenv.config()
const dbMySQL = new RepositoryMySQL();
const dbSQLite = new RepositorySQLite();

interface Symbol {
    symbol: string,
}

const currentCoin = async (symbol: string) => {
    const price30m = await dbMySQL.selectAveragePrice(symbol, '30 MINUTE');
    const price1h = await dbMySQL.selectAveragePrice(symbol, '1 HOUR');
    const price3h = await dbMySQL.selectAveragePrice(symbol, '3 HOUR');
    const price6h = await dbMySQL.selectAveragePrice(symbol, '6 HOUR');
    const price12h = await dbMySQL.selectAveragePrice(symbol, '12 HOUR');
    const price24h = await dbMySQL.selectAveragePriceForDay(symbol);
    return `/${symbol} price:\n30m $${price30m} 1h: $${price1h}\n3h $${price3h} 6h: $${price6h}\n12h: $${price12h} 24h: $${price24h}\n`;
}

const recentCoin = async (symbol: string) => {
    const price = await dbMySQL.selectAveragePrice(symbol, '5 MINUTE');
    return `/${symbol} price: $${price}\n`
}

const recentCoins = async (arraySymbol: Array<Symbol>) => {
    const coinPromises = arraySymbol.map((current) => {
        const symbol = current.symbol;
        return recentCoin(symbol);
    });

    const coinPrices = await Promise.all(coinPromises);
    const message = coinPrices.join('');
    return message;
};

const startM = async (bot: TelegramBot, msg: Message, message: string) => {
    const { chat: { id } } = msg;
    bot.sendMessage(id, message);
};

const helpM = async (bot: TelegramBot, msg: Message, message: string) => {
    const { chat: { id } } = msg;
    bot.sendMessage(id, message);
};

const listRecentM = async (bot: TelegramBot, msg: Message) => {
    const { chat: { id } } = msg;
    const message = await recentCoins(await coinStats());
    bot.sendMessage(id, message)
};

const currentSymbolM = async (bot: TelegramBot, msg: Message, symbol: string, messageExepCoin: string) => {
    const { chat: { id } } = msg;

    if (await dbMySQL.checkCoinExistSymbol(symbol)) {
        bot.sendMessage(id, await currentCoin(symbol), {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'addToFavourite',
                            callback_data: `addToFavourite_${symbol}`
                        },
                        {
                            text: 'deleteFavourite',
                            callback_data: `deleteFavourite_${symbol}`
                        },
                    ]
                ]
            }
        });
    } else {
        bot.sendMessage(id, messageExepCoin);
    }
};

const addToFavourite = async (bot: TelegramBot, id: number, symbol: string, messageSuccessAdd: string, messageExepData: string, messageExepCoin: string) => {
    if (dbSQLite.checkDataToExist(id, symbol)) {
        return bot.sendMessage(id, messageExepData);
    }
    if (!await dbMySQL.checkCoinExistSymbol(symbol)) {
        return bot.sendMessage(id, messageExepCoin);
    }
    dbSQLite.addToList(id, symbol);
    bot.sendMessage(id, messageSuccessAdd)
}

const listFavourite = async (bot: TelegramBot, msg: Message, messageExep: string) => {
    const { chat: { id } } = msg;
    const favList: Array<Symbol> = dbSQLite.allListById(id).map((crypto: any) => {
        return {
            symbol: crypto.listData.toUpperCase()
        }
    });
    if (favList.length) {
        return bot.sendMessage(id, await recentCoins(favList));
    }
    return bot.sendMessage(id, messageExep);
}

const deleteFavourite = async (bot: TelegramBot, id: number, symbol: string, messageSuccessDelete: string, messageExepExist: string) => {
    if (dbSQLite.checkDataToExist(id, symbol)) {
        dbSQLite.deleteFavouriteByCoins(id, symbol);
        return bot.sendMessage(id, messageSuccessDelete);
    }
    return bot.sendMessage(id, messageExepExist);
}

export { startM, helpM, listRecentM, currentSymbolM, addToFavourite, listFavourite, deleteFavourite }