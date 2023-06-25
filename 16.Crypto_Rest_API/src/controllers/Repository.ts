import { createPool, Pool, PoolConnection, RowDataPacket } from "mysql2";

const pool: Pool = createPool({
    host: "eu-cdbr-west-03.cleardb.net",
    user: "b8fd0bd7f626de",
    password: "9f55b014",
    database: "heroku_7b3b6acbac4b56e",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

class Repository {

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

    insert = async (json: Object, table: string) => {
        let connection: PoolConnection|null = null;
        try {
            connection = await this.getConnection();
            connection.query(`INSERT INTO ${table} SET ?`, json)
        } catch (err) {
            console.error('Error with insert:', err);
        }finally{
            if(connection){
                connection.release();
            }
        }
    };

    delet = async (time: string, table: string) => {
        try {
            const connection = await this.getConnection();
            connection.query(`DELETE FROM ${table} WHERE dateInput < (NOW() - INTERVAL ${time});`)
            connection.release();
        } catch (err) {
            console.error('Error with delete:', err);
        }
    }

    selectTakeByName = (cryptoName: string, table: string, time: string): Promise<any[]> => {
        return new Promise(async (resolve) => {
            try {
                const connection = await this.getConnection();
                connection.query(`SELECT * FROM ${table.toLowerCase()} WHERE dateInput <= (NOW() - INTERVAL ${time.toUpperCase()}) AND name = '${cryptoName.toUpperCase()}';`, (error, result:RowDataPacket[]) => {
                    resolve(result);
                    connection.release();
                });
            } catch (err) {
                console.log(err);
            }
        });
    };

    selectTakeBySymbol = (cryptoSymbol: string, table: string, time: string): Promise<any[]> => {
        return new Promise(async (resolve) => {
            try {
                const connection = await this.getConnection();
                connection.query(`SELECT * FROM ${table.toLowerCase()} WHERE dateInput <= (NOW() - INTERVAL ${time.toUpperCase()}) AND symbol = '${cryptoSymbol.toUpperCase()}';`, (error, result:RowDataPacket[]) => {
                    resolve(result);
                    connection.release();
                });
            } catch (err) {
                console.log(err);
            }
        });
    };

    selectKucoinByName = (cryptoName: string, time: string): Promise<any[]> => {
        return new Promise(async (resolve) => {
            try {
                const connection = await this.getConnection();
                connection.query(`SELECT symbol FROM coinstats WHERE name = '${cryptoName.toUpperCase()}';`, (error, result) => {
                    connection.query(`SELECT * FROM kucoin WHERE dateInput <= (NOW() - INTERVAL ${time.toUpperCase()}) AND symbol = '${result[0].symbol}';`, (error, result:RowDataPacket[]) => {
                        resolve(result);
                    });
                })
            } catch (err) {
                console.log(err);
            }
        });
    }

    checkCoinExistSymbol = (coinSymbol: string, table: string) => {
        return new Promise(async (resolve) => {
            try {
                const connection = await this.getConnection();
                connection.query(
                    `SELECT COUNT(*) AS count FROM ${table.toLowerCase()} WHERE symbol = '${coinSymbol.toUpperCase()}'`, (error, results) => {
                        const count = results[0].count;
                        const coinExists = count > 0;
                        resolve(coinExists);
                    })
            } catch (err) {
                console.log(err);
            }
        });
    };

    checkCoinExistName = (coinSymbol: string, table: string) => {
        return new Promise(async (resolve) => {
            try {
                const connection = await this.getConnection();
                connection.query(
                    `SELECT COUNT(*) AS count FROM ${table.toLowerCase()} WHERE name = '${coinSymbol.toUpperCase()}'`, (error, results) => {
                        const count = results[0].count;
                        const coinExists = count > 0;
                        resolve(coinExists);
                    }
                );
            } catch (err) {
                console.log(err);
            }
        });
    };
}

export { Repository };