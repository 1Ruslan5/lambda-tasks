import axios from "axios";

interface Crypto {
    name: any;
    symbol: any;
    price_usd: any;
    buy: any;
    price: any;
    current_price: any;
    percent_change_1h: any;
    priceChange1h: any;
    percent_change_24h: any;
    changePrice: any;
    priceChange1d: any;
    price_change_24h: any;
}

const calculatePercentage = (suma: number, percentage: number): number => {
    let answear = (suma) + (suma * percentage / 100);
    if (answear <= 0) {
        return 0;
    }
    if (isNaN(answear)) {
        return suma
    }
    return answear
}

const numberFormat = (num: number) => {
    return Number(num.toFixed(7))
}

const deleteUSD = (ticker: any) => {
    return ticker
        .filter((ticker: any) => ticker.symbol.endsWith('-USDT'))
        .sort((a: any, b: any) => b.volValue - a.volValue)
        .slice(0, 100);
}

const marketCap = async () => {
    try {
        const { data: { data } } = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
            headers: {
                'X-CMC_PRO_API_KEY': "9f2092dc-f56a-4027-9712-1930eb76cb65"
            },
            params: {
                limit: 60,
            }
        });

        const cryptocurrencies = data.map((crypto: any) => {
            const price = parseFloat(crypto.quote.USD.price);
            const priceDay = calculatePercentage(price, parseFloat(crypto.quote.USD.percent_change_1h))

            return {
                name: crypto.name.toUpperCase(),
                symbol: crypto.symbol.toUpperCase(),
                price: numberFormat(price),
                dayPrice: numberFormat(priceDay)
            }
        })

        return cryptocurrencies
    } catch (err) {
        console.error('Error with api marketcap:', err);
    }
}

const koinbase = async () => {
    try {
        const { data } = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: 60,
                page: 1
            }
        });
        const cryptocurrencies = data.map(({
            name, symbol, current_price, price_change_24h
        }: Crypto) => {
            const price = parseFloat(current_price)
            const priceChange1d = price - price_change_24h;

            return {
                name: name.toUpperCase(),
                symbol: symbol.toUpperCase(),
                price: numberFormat(current_price),
                dayPrice: numberFormat(priceChange1d)
            }
        });

        return cryptocurrencies
    } catch (err) {
        console.error('Error with api koinbase', err);
    }
}

const coinStats = async () => {
    try {
        const { data: { coins } } = await axios.get('https://api.coinstats.app/public/v1/coins?skip=0&limit=60&currency=USD');
        const cryptocurrencies = coins.map(({
            name, symbol, price, priceChange1h, priceChange1d
        }: Crypto) => {
            const current_price = parseFloat(price);
            const dayPrice = calculatePercentage(current_price, parseFloat(priceChange1d))

            return {
                name: name.toUpperCase(),
                symbol: symbol.toUpperCase(),
                price: numberFormat(current_price),
                dayPrice: numberFormat(dayPrice)
            }
        })

        return cryptocurrencies
    } catch (err) {
        console.error('Error with api coinstats:', err);
    }
}

const kucoin = async () => {
    try {
        const { data: { data: { ticker } } } = await axios.get('https://api.kucoin.com/api/v1/market/allTickers');

        const cryptocurrencies = deleteUSD(ticker).map(({
            symbol, buy, changePrice
        }: Crypto) => {
            const price = parseFloat(buy);
            const dayPrice = price + parseFloat(changePrice);

            return {
                symbol: symbol.replace('-USDT', '').toUpperCase(),
                price: numberFormat(price),
                dayPrice: numberFormat(dayPrice)
            }
        })

        return cryptocurrencies
    } catch (err) {
        console.error('Error with api kucoin:', err);
    }
}

const coinPaprika = async () => {
    try {
        const { data } = await axios.get('https://api.coinpaprika.com/v1/ticker');

        let cryptocurrencies = data.slice(0, 60).map(({
            name, symbol, price_usd, percent_change_1h, percent_change_24h
        }: Crypto) => {
            const currentPrice = parseFloat(price_usd);
            const dayPrice = calculatePercentage(currentPrice, parseFloat(percent_change_24h));

            return {
                name: name.toUpperCase(),
                symbol: symbol.toUpperCase(),
                price: numberFormat(currentPrice),
                dayPrice: numberFormat(dayPrice)
            }
        });

        return cryptocurrencies
    } catch (err) {
        console.error('Error with api coinpaprika:', err);
    }
}

export { marketCap, koinbase, coinStats, kucoin, coinPaprika }