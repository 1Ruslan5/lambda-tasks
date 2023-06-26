"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
require("express");
const express_1 = __importStar(require("express"));
const Repository_1 = require("../controllers/Repository");
const router = (0, express_1.Router)();
exports.router = router;
const repository = new Repository_1.Repository();
const jsonAwnswear = (status, info) => {
    const exeption = new Map([
        [400, 'Bad Request'],
        [201, 'Created'],
        [200, 'Ok'],
        [404, 'Not found'],
    ]);
    return { status, exeption: exeption.get(status), info };
};
const checkValidCoin = (name, symbol, table = 'coinstats') => __awaiter(void 0, void 0, void 0, function* () {
    if (name) {
        const answear = yield repository.checkCoinExistName(name, table);
        return answear;
    }
    if (symbol) {
        const answear = yield repository.checkCoinExistSymbol(symbol, table);
        return answear;
    }
    return true;
});
const checkValidTime = (time) => {
    if (!time.includes('15 minute') || !time.includes("1 hour") || !time.includes("4 hour") || !time.includes("24 hour")) {
        return true;
    }
    return false;
};
const checkDayPrice = (crypto, time) => {
    if (time === '24 hour') {
        return crypto[0].dayPrice;
    }
    else {
        return crypto[0].price;
    }
};
const checkTimeToDay = (time) => {
    if (time === '24 hour') {
        return '0 minute';
    }
    return time;
};
router.use(express_1.default.json());
router.get('*', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body: { name, symbol, market, time } } = req;
    const markets = ['koinbase', 'marketcap', 'coinstats', 'coinpaprika', 'kucoin'];
    if ((!name && !symbol) || !time) {
        return res.status(404).json(jsonAwnswear(404, "Coin name, symbol or time didn't found"));
    }
    const validTime = time.toLowerCase();
    if (!checkValidTime(validTime)) {
        return res.status(400).json(jsonAwnswear(400, "Time didn't valid"));
    }
    if (!markets.includes(market)) {
        let suma = 0;
        if (symbol) {
            if (!(yield checkValidCoin(undefined, symbol))) {
                return res.status(404).json(jsonAwnswear(404, "Crypto didn't found"));
            }
            for (const market of markets) {
                const crypto = yield repository.selectTakeBySymbol(symbol, market, checkTimeToDay(validTime));
                suma += checkDayPrice(crypto, validTime);
            }
            return res.status(200).json({ 'info': jsonAwnswear(200, 'Data was found'), 'data': { crypto: name, price: suma / 5 } });
        }
        if (name) {
            if (!(yield checkValidCoin(name))) {
                return res.status(404).json(jsonAwnswear(404, "Crypto didn't found"));
            }
            for (let i = 0; i < markets.length - 1; i++) {
                const crypto = yield repository.selectTakeByName(name, markets[i], checkTimeToDay(validTime));
                suma += checkDayPrice(crypto, validTime);
            }
            const crypto = yield repository.selectKucoinByName(name, checkTimeToDay(validTime));
            suma += checkDayPrice(crypto, validTime);
            return res.status(200).json({ 'info': jsonAwnswear(200, 'Data was found'), 'data': { crypto: name, price: suma / 5 } });
        }
    }
    const validMarket = market.toLowerCase();
    if (symbol) {
        if (!(yield checkValidCoin(undefined, symbol, validMarket))) {
            return res.status(404).json(jsonAwnswear(404, "Crypto didn't found"));
        }
        const crypto = yield repository.selectTakeBySymbol(symbol, validMarket, checkTimeToDay(validTime));
        const price = checkDayPrice(crypto, validTime);
        return res.status(200).json({ 'info': jsonAwnswear(200, 'Data was found'), 'data': { crypto: symbol, market, price } });
    }
    if (name) {
        if (!(yield checkValidCoin(name, undefined, validMarket))) {
            return res.status(404).json(jsonAwnswear(404, "Crypto didn't found"));
        }
        let crypto;
        if (validMarket === 'kucoin') {
            crypto = yield repository.selectKucoinByName(name, checkTimeToDay(validTime));
        }
        else {
            crypto = yield repository.selectTakeByName(name, validMarket, checkTimeToDay(validTime));
        }
        const price = checkDayPrice(crypto, validTime);
        return res.status(200).json({ 'info': jsonAwnswear(200, 'Data was found'), 'data': { crypto: name, market, price } });
    }
}));
//# sourceMappingURL=requests.js.map