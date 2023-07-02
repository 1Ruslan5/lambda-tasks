import { Repository } from "./Repository";
import { marketCap, coinPaprika, coinStats, koinbase, kucoin } from "./api";

const repository = new Repository();

const deletInsert = async (data: Promise<object[]>, table: string) => {
  repository.delet('12 HOUR', table);
  (await data).reduce((prev: object, current: object) => {
    repository.insert(current, table)
    return current
  }, Object)
}

const dataFromDB = async () => {
  try {
    await Promise.all([
      deletInsert(koinbase(), 'koinbase'),
      deletInsert(coinStats(), 'coinstats'),
      deletInsert(kucoin(), 'kucoin'),
      deletInsert(coinPaprika(), 'coinpaprika'),
      deletInsert(marketCap(), 'marketcap')
    ]);
    console.log('All data was sent to the database');
  } catch (error) {
    console.error('Error occurred while sending data to the database:', error);
  }
}

export { dataFromDB }