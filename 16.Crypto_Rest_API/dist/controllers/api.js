"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataFromDB = void 0;
const axios_1 = __importDefault(require("axios"));
const Repository_1 = require("./Repository");
const repository = new Repository_1.Repository();
const calculatePercentage = (suma, percentage) => {
    let answear = (suma) + (suma * percentage / 100);
    if (answear <= 0) {
        return 0;
    }
    if (isNaN(answear)) {
        return suma;
    }
    return answear;
};
const numberFormat = (num) => {
    return Number(num.toFixed(7));
};
const deleteUSD = (ticker) => {
    return ticker
        .filter((ticker) => ticker.symbol.endsWith('-USDT'))
        .sort((a, b) => b.volValue - a.volValue)
        .slice(0, 100);
};
const marketCap = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data: { data } } = yield axios_1.default.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
            headers: {
                'X-CMC_PRO_API_KEY': "9f2092dc-f56a-4027-9712-1930eb76cb65"
            },
            params: {
                limit: 60,
            }
        });
        const cryptocurrencies = data.map((crypto) => {
            const price = parseFloat(crypto.quote.USD.price);
            const priceDay = calculatePercentage(price, parseFloat(crypto.quote.USD.percent_change_1h));
            return {
                name: crypto.name.toUpperCase(),
                symbol: crypto.symbol.toUpperCase(),
                price: numberFormat(price),
                dayPrice: numberFormat(priceDay)
            };
        });
        repository.delet('4 HOUR', 'marketcap');
        for (let json of cryptocurrencies) {
            repository.insert(json, 'marketcap');
        }
    }
    catch (err) {
        console.error('Error with api marketcap:', err);
    }
});
const koinbase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: 60,
                page: 1
            }
        });
        const cryptocurrencies = data.map(({ name, symbol, current_price, price_change_24h }) => {
            const price = parseFloat(current_price);
            const priceChange1d = price - price_change_24h;
            return {
                name: name.toUpperCase(),
                symbol: symbol.toUpperCase(),
                price: numberFormat(current_price),
                dayPrice: numberFormat(priceChange1d)
            };
        });
        repository.delet('4 HOUR', 'koinbase');
        for (let json of cryptocurrencies) {
            repository.insert(json, 'koinbase');
        }
    }
    catch (err) {
        console.error('Error with api koinbase', err);
    }
});
const coinStats = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data: { coins } } = yield axios_1.default.get('https://api.coinstats.app/public/v1/coins?skip=0&limit=60&currency=USD');
        const cryptocurrencies = coins.map(({ name, symbol, price, priceChange1h, priceChange1d }) => {
            const current_price = parseFloat(price);
            const dayPrice = calculatePercentage(current_price, parseFloat(priceChange1d));
            return {
                name: name.toUpperCase(),
                symbol: symbol.toUpperCase(),
                price: numberFormat(current_price),
                dayPrice: numberFormat(dayPrice)
            };
        });
        repository.delet('4 HOUR', 'coinstats');
        for (let json of cryptocurrencies) {
            repository.insert(json, 'coinstats');
        }
    }
    catch (err) {
        console.error('Error with api coinstats:', err);
    }
});
const kucoin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data: { data: { ticker } } } = yield axios_1.default.get('https://api.kucoin.com/api/v1/market/allTickers');
        const cryptocurrencies = deleteUSD(ticker).map(({ symbol, buy, changePrice }) => {
            const price = parseFloat(buy);
            const dayPrice = price + parseFloat(changePrice);
            return {
                symbol: symbol.replace('-USDT', '').toUpperCase(),
                price: numberFormat(price),
                dayPrice: numberFormat(dayPrice)
            };
        });
        repository.delet('4 HOUR', 'kucoin');
        for (let json of cryptocurrencies) {
            repository.insert(json, 'kucoin');
        }
    }
    catch (err) {
        console.error('Error with api kucoin:', err);
    }
});
const coinPaprika = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get('https://api.coinpaprika.com/v1/ticker');
        let cryptocurrencies = data.slice(0, 60).map(({ name, symbol, price_usd, percent_change_1h, percent_change_24h }) => {
            const currentPrice = parseFloat(price_usd);
            const dayPrice = calculatePercentage(currentPrice, parseFloat(percent_change_24h));
            return {
                name: name.toUpperCase(),
                symbol: symbol.toUpperCase(),
                price: numberFormat(currentPrice),
                dayPrice: numberFormat(dayPrice)
            };
        });
        repository.delet('4 HOUR', 'coinpaprika');
        for (let json of cryptocurrencies) {
            repository.insert(json, 'coinpaprika');
        }
    }
    catch (err) {
        console.error('Error with api coinpaprika:', err);
    }
});
const dataFromDB = () => {
    marketCap();
    koinbase();
    coinStats();
    kucoin();
    coinPaprika();
    console.log('All data was sended to db');
};
exports.dataFromDB = dataFromDB;
//# sourceMappingURL=api.js.map