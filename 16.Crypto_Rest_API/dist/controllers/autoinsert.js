"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataFromDB = void 0;
const Repository_1 = require("./Repository");
const api_1 = require("./api");
const repository = new Repository_1.Repository();
const deletInsert = async (data, table) => {
    repository.delet('4 HOUR', table);
    (await data).reduce((prev, current) => {
        repository.insert(current, table);
        return current;
    }, Object);
};
const dataFromDB = () => {
    deletInsert((0, api_1.koinbase)(), 'koinbase');
    deletInsert((0, api_1.coinStats)(), 'coinstats');
    deletInsert((0, api_1.kucoin)(), 'kucoin');
    deletInsert((0, api_1.coinPaprika)(), 'coinpaprika');
    deletInsert((0, api_1.marketCap)(), 'marketcap');
    console.log('All data was sended to db');
};
exports.dataFromDB = dataFromDB;
//# sourceMappingURL=autoinsert.js.map