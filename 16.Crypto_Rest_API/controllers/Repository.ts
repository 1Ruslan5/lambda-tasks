import { createConnection } from "mysql";

const mysql = createConnection({
    host: "eu-cdbr-west-03.cleardb.net",
    user: "b8fd0bd7f626de",
    password: "9f55b014",
    database: "heroku_7b3b6acbac4b56e"
});

class Repository {

    connect = async () => {
        mysql.connect((err) => {
            if (err) {
                console.log('Error connection to server');
                return
            }
            console.log("Connected!");
        });
    }

    insert = (json: Object, table: string) => {
        try {
            mysql.query(`INSERT INTO ${table} SET ?`, json)
        } catch (err) {
            console.error('Error with insert:', err);
        }
    }

    delet = (time: string, table: string) => {
        try {
            mysql.query(`DELETE FROM ${table} WHERE dateInput < (NOW() - INTERVAL ${time});`)
        } catch (err) {
            console.error('Error with delete:', err);
        }
    }

    selectTakeByName = (cryptoName: string, table: string, time: string): Promise<any[]> => {
        return new Promise((resolve) => {
            try {
                mysql.query(`SELECT * FROM ${table.toLowerCase()} WHERE dateInput <= (NOW() - INTERVAL ${time.toUpperCase()}) AND name = '${cryptoName.toUpperCase()}';`, (error, result) => {
                    resolve(result);
                });
            } catch (err) {
                console.log(err);
            }
        });
    };

    selectTakeBySymbol = (cryptoSymbol: string, table: string, time: string): Promise<any[]> => {
        return new Promise((resolve) => {
            try {
                mysql.query(`SELECT * FROM ${table.toLowerCase()} WHERE dateInput <= (NOW() - INTERVAL ${time.toUpperCase()}) AND symbol = '${cryptoSymbol.toUpperCase()}';`, (error, result) => {
                    resolve(result);
                });
            } catch (err) {
                console.log(err);
            }
        });
    };

    selectKucoinByName = (cryptoName: string, time: string): Promise<any[]> => {
        return new Promise((resolve) => {
            try {
                mysql.query(`SELECT symbol FROM coinstats WHERE name = '${cryptoName.toUpperCase()}';`, (error, result) => {
                    mysql.query(`SELECT * FROM kucoin WHERE dateInput <= (NOW() - INTERVAL ${time.toUpperCase()}) AND symbol = '${result[0].symbol}';`, (error, result) => {
                        resolve(result);
                    });
                })
            } catch (err) {
                console.log(err);
            }
        });
    }

    checkCoinExistSymbol = (coinSymbol: string, table: string) => {
        return new Promise((resolve) => {
            try {
                mysql.query(
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
        return new Promise((resolve) => {
            try {
                mysql.query(
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