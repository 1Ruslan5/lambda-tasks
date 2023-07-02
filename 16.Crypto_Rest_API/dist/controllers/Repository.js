"use strict";
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
        this.insert = async (json, table) => {
            let connection = null;
            try {
                connection = await this.getConnection();
                connection.query(`INSERT INTO ${table} SET ?`, json);
            }
            catch (err) {
                console.error('Error with insert:', err);
                this.insert(json, table);
            }
            finally {
                if (connection) {
                    connection.release();
                }
            }
        };
        this.delet = async (time, table) => {
            try {
                const connection = await this.getConnection();
                connection.query(`DELETE FROM ${table} WHERE dateInput < (NOW() - INTERVAL ${time});`);
                connection.release();
            }
            catch (err) {
                console.error('Error with delete:', err);
            }
        };
        this.selectTakeByName = (cryptoName, table, time) => {
            return new Promise(async (resolve) => {
                try {
                    const connection = await this.getConnection();
                    connection.query(`SELECT * FROM ${table.toLowerCase()} WHERE dateInput <= (NOW() - INTERVAL ${time.toUpperCase()}) AND name = '${cryptoName.toUpperCase()}' LIMIT 1;`, (error, result) => {
                        resolve(result);
                        connection.release();
                    });
                }
                catch (err) {
                    console.log(err);
                }
            });
        };
        this.selectTakeBySymbol = (cryptoSymbol, table, time) => {
            return new Promise(async (resolve) => {
                try {
                    const connection = await this.getConnection();
                    connection.query(`SELECT * FROM ${table.toLowerCase()} WHERE dateInput <= (NOW() - INTERVAL ${time.toUpperCase()}) AND symbol = '${cryptoSymbol.toUpperCase()}' LIMIT 1;`, (error, result) => {
                        resolve(result);
                        connection.release();
                    });
                }
                catch (err) {
                    console.log(err);
                }
            });
        };
        this.selectKucoinByName = (cryptoName, time) => {
            return new Promise(async (resolve) => {
                try {
                    const connection = await this.getConnection();
                    connection.query(`SELECT symbol FROM coinstats WHERE name = '${cryptoName.toUpperCase()}' LIMIT 1;`, (error, result) => {
                        connection.query(`SELECT * FROM kucoin WHERE dateInput <= (NOW() - INTERVAL ${time.toUpperCase()}) AND symbol = '${result[0].symbol}' LIMIT 1;`, (error, result) => {
                            resolve(result);
                        });
                    });
                }
                catch (err) {
                    console.log(err);
                }
            });
        };
        this.checkCoinExistSymbol = (coinSymbol, table) => {
            return new Promise(async (resolve) => {
                try {
                    const connection = await this.getConnection();
                    connection.query(`SELECT COUNT(*) AS count FROM ${table.toLowerCase()} WHERE symbol = '${coinSymbol.toUpperCase()}' LIMIT 1`, (error, results) => {
                        const count = results[0].count;
                        const coinExists = count > 0;
                        resolve(coinExists);
                    });
                }
                catch (err) {
                    console.log(err);
                }
            });
        };
        this.checkCoinExistName = (coinName, table) => {
            return new Promise(async (resolve) => {
                try {
                    const connection = await this.getConnection();
                    if (table.toLowerCase() === 'kucoin') {
                        connection.query(`SELECT symbol FROM coinstats WHERE name = '${coinName.toUpperCase()}' LIMIT 1;`, (error, result) => {
                            connection.query(`SELECT COUNT(*) AS count FROM kucoin WHERE symbol = '${result[0].symbol}' LIMIT 1`, (error, results) => {
                                const count = results[0].count;
                                const coinExists = count > 0;
                                resolve(coinExists);
                            });
                        });
                    }
                    else {
                        connection.query(`SELECT COUNT(*) AS count FROM ${table.toLowerCase()} WHERE name = '${coinName.toUpperCase()}' LIMIT 1;`, (error, results) => {
                            const count = results[0].count;
                            const coinExists = count > 0;
                            resolve(coinExists);
                        });
                    }
                }
                catch (err) {
                    console.log(err);
                }
            });
        };
    }
}
exports.Repository = Repository;
//# sourceMappingURL=Repository.js.map