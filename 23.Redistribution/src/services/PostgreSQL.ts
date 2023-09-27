import pgPromise, { IDatabase, IMain } from 'pg-promise';
import { User } from 'src/models/user';
import * as dotenv from 'dotenv';
import { Shop } from 'src/models/shop';
 
dotenv.config();

class PostgreSQL {
    db: IDatabase<any>;
    pgp: IMain;

    constructor() {
        this.pgp = pgPromise(); 
        const connectionPool = this.pgp({
            host: process.env.POSTGRESQL_HOST,
            port: 5432,
            user: process.env.POSTGRESQL_USER,
            password: process.env.POSTGRESQL_PASSWORD,
            database: process.env.POSTGRESQL_DATABASE,
            ssl: {
                rejectUnauthorized: false, 
            },
            max: 100,
            connectionTimeoutMillis: 10000,
        });

        this.db = connectionPool;
    }

    insertUser = async (body: User) => {
        try {
            const { user_name, password, search_phrases, shop_id,} = body;
            await this.db.any('INSERT INTO history_info(user_name, password, search_frase, shop_id) VALUES($1, $2, $3, $4)', [user_name, password, search_phrases, shop_id]);
        } catch (err) {
            console.error('Error inserting user:', err);
            throw err;
        }
    };

    insertShop = async (shopName: string, user: Shop) => {
        try {
            await this.db.any(`INSERT INTO ${shopName}(user_name, password, search_frase) VALUES($1, $2, $3)`, [user.user_name, user.password, user.search_phrases])
        }catch(err){
            console.error('Error insering user to shop db:', err);
            throw err;
        }
    };
}

export default new PostgreSQL();