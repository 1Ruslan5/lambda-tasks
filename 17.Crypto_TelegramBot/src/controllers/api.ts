import axios from 'axios';

const coinStats = async () => {
    try {
        const { data: { coins } } = await axios.get('https://api.coinstats.app/public/v1/coins?skip=0&limit=30&currency=USD');

        const cryptocurrencies = coins.map((crypto: any) => {
            return {
                symbol: crypto.symbol.toUpperCase(),
            }
        })

        return cryptocurrencies
    } catch (err) {
        console.error('Error with api coinstats:', err);
    }
}

export { coinStats }