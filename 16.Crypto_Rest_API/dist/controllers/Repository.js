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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
const mysql2_1 = require("mysql2");
const pool = (0, mysql2_1.createPool)({
    host: "eu-cdbr-west-03.cleardb.net",
    user: "b8fd0bd7f626de",
    password: "9f55b014",
    database: "heroku_7b3b6acbac4b56e",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
class Repository {
    constructor() {
        this.getConnection = () => {
            return new Promise((resolve, reject) => {
                pool.getConnection((err, connection) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(connection);
                    }
                });
            });
        };
        this.insert = (json, table) => __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield this.getConnection();
                connection.query(`INSERT INTO ${table} SET ?`, json);
            }
            catch (err) {
                console.error('Error with insert:', err);
            }
            finally {
                if (connection) {
                    connection.release();
                }
            }
        });
        this.delet = (time, table) => __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield this.getConnection();
                connection.query(`DELETE FROM ${table} WHERE dateInput < (NOW() - INTERVAL ${time});`);
                connection.release();
            }
            catch (err) {
                console.error('Error with delete:', err);
            }
        });
        this.selectTakeByName = (cryptoName, table, time) => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const connection = yield this.getConnection();
                    connection.query(`SELECT * FROM ${table.toLowerCase()} WHERE dateInput <= (NOW() - INTERVAL ${time.toUpperCase()}) AND name = '${cryptoName.toUpperCase()}';`, (error, result) => {
                        resolve(result);
                        connection.release();
                    });
                }
                catch (err) {
                    console.log(err);
                }
            }));
        };
        this.selectTakeBySymbol = (cryptoSymbol, table, time) => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const connection = yield this.getConnection();
                    connection.query(`SELECT * FROM ${table.toLowerCase()} WHERE dateInput <= (NOW() - INTERVAL ${time.toUpperCase()}) AND symbol = '${cryptoSymbol.toUpperCase()}';`, (error, result) => {
                        resolve(result);
                        connection.release();
                    });
                }
                catch (err) {
                    console.log(err);
                }
            }));
        };
        this.selectKucoinByName = (cryptoName, time) => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const connection = yield this.getConnection();
                    connection.query(`SELECT symbol FROM coinstats WHERE name = '${cryptoName.toUpperCase()}';`, (error, result) => {
                        connection.query(`SELECT * FROM kucoin WHERE dateInput <= (NOW() - INTERVAL ${time.toUpperCase()}) AND symbol = '${result[0].symbol}';`, (error, result) => {
                            resolve(result);
                        });
                    });
                }
                catch (err) {
                    console.log(err);
                }
            }));
        };
        this.checkCoinExistSymbol = (coinSymbol, table) => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const connection = yield this.getConnection();
                    connection.query(`SELECT COUNT(*) AS count FROM ${table.toLowerCase()} WHERE symbol = '${coinSymbol.toUpperCase()}'`, (error, results) => {
                        const count = results[0].count;
                        const coinExists = count > 0;
                        resolve(coinExists);
                    });
                }
                catch (err) {
                    console.log(err);
                }
            }));
        };
        this.checkCoinExistName = (coinSymbol, table) => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const connection = yield this.getConnection();
                    connection.query(`SELECT COUNT(*) AS count FROM ${table.toLowerCase()} WHERE name = '${coinSymbol.toUpperCase()}'`, (error, results) => {
                        const count = results[0].count;
                        const coinExists = count > 0;
                        resolve(coinExists);
                    });
                }
                catch (err) {
                    console.log(err);
                }
            }));
        };
    }
}
exports.Repository = Repository;
//# sourceMappingURL=Repository.js.map