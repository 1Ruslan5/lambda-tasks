import 'express';
import express, { Router, Request, Response } from 'express';
import { Repository } from '../controllers/Repository';

const router: Router = Router();
const repository: Repository = new Repository();

interface Crypto {
  price: number;
  dayPrice: number
}

const jsonAwnswear = (status: number, info: string) => {
  const exeption = new Map([
    [400, 'Bad Request'],
    [201, 'Created'],
    [200, 'Ok'],
    [404, 'Not found'],
  ]);
  return { status, exeption: exeption.get(status), info }
}

const checkValidCoin = async (name?: string, symbol?: string, table: string = 'coinstats'): Promise<boolean> => {
  if (name) {
    const answear = await repository.checkCoinExistName(name, table) as boolean;
    return answear
  }
  if (symbol) {
    const answear = await repository.checkCoinExistSymbol(symbol, table) as boolean;
    return answear
  }
  return true
}

const checkValidTime = (time: string) => {
  if (!time.includes('15 minute') || !time.includes("1 hour") || !time.includes("4 hour") || !time.includes("24 hour")) {
    return true
  }
  return false
}

const checkDayPrice = (crypto: Array<Crypto>, time: string) => {
  if (time === '24 hour') {
    return crypto[0].dayPrice;
  } else {
    return crypto[0].price;
  }
}

const checkTimeToDay = (time: string) => {
  if (time === '24 hour') {
    return '0 minute'
  }
  return time
}

router.use(express.json());

router.get('*', async (req: Request, res: Response) => {
  const { body: { name, symbol, market, time } } = req;
  const markets: string[] = ['koinbase', 'marketcap', 'coinstats', 'coinpaprika', 'kucoin'];
  if ((!name && !symbol) || !time) {
    return res.status(404).json(jsonAwnswear(404, "Coin name, symbol or time didn't found"));
  }
  const validTime = time.toLowerCase()
  if (!checkValidTime(validTime)) {
    return res.status(400).json(jsonAwnswear(400, "Time didn't valid"));
  }
  if (!markets.includes(market)) {
    let suma = 0;
    if (symbol) {
      if (!await checkValidCoin(undefined, symbol)) {
        return res.status(404).json(jsonAwnswear(404, "Crypto didn't found"));
      }

      for (const market of markets) {
        const crypto = await repository.selectTakeBySymbol(symbol, market, checkTimeToDay(validTime));
        suma += checkDayPrice(crypto, validTime);
      }

      return res.status(200).json({ 'info': jsonAwnswear(200, 'Data was found'), 'data': { crypto: name, price: suma / 5 } })
    }
    if (name) {
      if (!await checkValidCoin(name)) {
        return res.status(404).json(jsonAwnswear(404, "Crypto didn't found"));
      }

      for (let i = 0; i < markets.length - 1; i++) {
        const crypto = await repository.selectTakeByName(name, markets[i], checkTimeToDay(validTime));
        suma += checkDayPrice(crypto, validTime);
      }
      const crypto = await repository.selectKucoinByName(name, checkTimeToDay(validTime));
      suma += checkDayPrice(crypto, validTime);

      return res.status(200).json({ 'info': jsonAwnswear(200, 'Data was found'), 'data': { crypto: name, price: suma / 5 } })
    }
  }

  const validMarket = market.toLowerCase();
  if (symbol) {
    if (!await checkValidCoin(undefined, symbol, validMarket)) {
      return res.status(404).json(jsonAwnswear(404, "Crypto didn't found"));
    }

    const crypto = await repository.selectTakeBySymbol(symbol, validMarket, checkTimeToDay(validTime));
    const price = checkDayPrice(crypto, validTime);

    return res.status(200).json({ 'info': jsonAwnswear(200, 'Data was found'), 'data': { crypto: symbol, market, price } })
  }
  if (name) {
    if (!await checkValidCoin(name, undefined, validMarket)) {
      return res.status(404).json(jsonAwnswear(404, "Crypto didn't found"));
    }

    let crypto;
    if (validMarket === 'kucoin') {
      crypto = await repository.selectKucoinByName(name, checkTimeToDay(validTime));
    } else {
      crypto = await repository.selectTakeByName(name, validMarket, checkTimeToDay(validTime));
    }

    const price = checkDayPrice(crypto, validTime)

    return res.status(200).json({ 'info': jsonAwnswear(200, 'Data was found'), 'data': { crypto: name, market, price } })
  }
});

export { router }