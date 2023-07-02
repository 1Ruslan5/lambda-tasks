import { Pool, RowDataPacket, createPool, PoolConnection } from 'mysql2';

const pool: Pool = createPool({
    host: "eu-cdbr-west-03.cleardb.net",
    user: "b8fd0bd7f626de",
    password: "9f55b014",
    database: "heroku_7b3b6acbac4b56e",
    waitForConnections: true,
    connectionLimit: 4,
    queueLimit: 0,
});

class RepositoryMySQL {

    private getConnection = (): Promise<PoolConnection> => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(connection);
                }
            });
        });
    }

    checkCoinExistSymbol = (coinSymbol: string) => {
        return new Promise(async (resolve) => {
            try {
                const connection = await this.getConnection();
                connection.query(
                    `SELECT COUNT(*) AS count FROM kucoin WHERE symbol = '${coinSymbol.toUpperCase()}'`, (error, results: RowDataPacket[]) => {
                        const count = results[0].count;
                        const coinExists = count > 0;
                        resolve(coinExists);
                    })
            } catch (err) {
                console.log(err);
            }
        });
    };

    selectAveragePrice = (cryptoSymbol: string, time: string): Promise<number> => {
        return new Promise(async (resolve, reject) => {
            try {
                const connection = await this.getConnection();
                const tables = ['coinpaprika', 'coinstats', 'koinbase', 'kucoin', 'marketcap'];
                const query = tables.map(table =>
                    `(SELECT price FROM ${table.toLowerCase()} WHERE dateInput >= (NOW() - INTERVAL ${time.toUpperCase()}) AND symbol = '${cryptoSymbol.toUpperCase()}' LIMIT 1)`
                ).join(' UNION ');

                connection.query(query, (error, results: RowDataPacket[]) => {
                    connection.release();
                    if (error) {
                        reject(error);
                    } else {
                        const sum = results.reduce((total, row) => total + row.price, 0);
                        const averagePrice = parseFloat((sum / 5).toFixed(4));
                        resolve(averagePrice);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    };

    selectAveragePriceForDay = (cryptoSymbol: string): Promise<number> => {
        return new Promise(async (resolve, reject) => {
            try {
                const connection = await this.getConnection();
                const tables = ['coinpaprika', 'coinstats', 'koinbase', 'kucoin', 'marketcap'];
                const query = tables.map(table =>
                    `(SELECT dayPrice FROM ${table.toLowerCase()} WHERE symbol = '${cryptoSymbol.toUpperCase()}' ORDER BY dateInput DESC LIMIT 1)`
                ).join(' UNION ');
                connection.query(query, (error, results: RowDataPacket[]) => {
                    connection.release();
                    if (error) {
                        reject(error);
                    } else {
                        const sum = results.reduce((total, row) => total + row.dayPrice, 0);
                        const averagePrice = parseFloat((sum / 5).toFixed(4));
                        resolve(averagePrice);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}

export { RepositoryMySQL }