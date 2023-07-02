import Database from 'better-sqlite3';

class RepositorySQLite {
    db: any;

    constructor() {
        this.db = new Database('C:/lambda-task/17.Crypto_TelegramBot/telegram-crypto.db');
    }

    addToList = (idList: number, listData: string) => {
        try {
            this.db.prepare('INSERT INTO listFavourite (idList, listData) VALUES (?, ?)')
                .run(idList, listData.toUpperCase());
        } catch (err) {
            console.log('No data inserted:', err);
        }
    }

    allListById = (idList: number) => {
        try {
            return this.db.prepare(`SELECT listData FROM listFavourite WHERE idList = ?`)
                .all(idList);
        } catch (err) {
            console.log('No data found', err);
        }
    }

    deleteFavouriteByCoins = (idList: number, coinsName: string) => {
        try {
            this.db.prepare('DELETE FROM listFavourite WHERE idList = ? AND listData = ?')
                .run(idList, coinsName)
        } catch (err) {
            console.log('No data deleted', err);
        }
    }

    checkDataToExist = (idList: number, coinName: string) => {
        try {
            const row = this.db.prepare('SELECT * FROM listFavourite WHERE idList = ? AND listData = ?')
                .get(idList, coinName);
            return (row) ? true : false;
        } catch (err) {
            console.log('No data deleted', err);
        }
    }
}

export { RepositorySQLite }