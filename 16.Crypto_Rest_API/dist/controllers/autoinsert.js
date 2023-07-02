"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataFromDB = void 0;
const Repository_1 = require("./Repository");
const api_1 = require("./api");
const repository = new Repository_1.Repository();
const deletInsert = async (data, table) => {
    repository.delet('12 HOUR', table);
    (await data).reduce((prev, current) => {
        repository.insert(current, table);
        return current;
    }, Object);
};
const dataFromDB = async () => {
    try {
        await Promise.all([
            deletInsert((0, api_1.koinbase)(), 'koinbase'),
            deletInsert((0, api_1.coinStats)(), 'coinstats'),
            deletInsert((0, api_1.kucoin)(), 'kucoin'),
            deletInsert((0, api_1.coinPaprika)(), 'coinpaprika'),
            deletInsert((0, api_1.marketCap)(), 'marketcap')
        ]);
        console.log('All data was sent to the database');
    }
    catch (error) {
        console.error('Error occurred while sending data to the database:', error);
    }
};
exports.dataFromDB = dataFromDB;
//# sourceMappingURL=autoinsert.js.map