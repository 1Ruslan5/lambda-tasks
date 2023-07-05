import { MongoClient } from 'mongodb'
import { dbName, collectionLink } from '../views/dbName'
import * as dotenv from 'dotenv'
dotenv.config();

const URIMONGODB = process.env.URIMONGODB!;

class Repository {

    client;
    collection;

    constructor() {
        this.client = new MongoClient(URIMONGODB);
        this.collection = this.client.db(dbName).collection(collectionLink);
    }

    connect = async () => {
        try {
            await this.client.connect();
            console.log('Connected successfully to server');
        } catch (err) {
            console.log(err);
        }
    }

    setLink = async (link: object) => {
        try {
            await this.collection.insertOne(link);
        } catch (err) {
            console.log(err);
        }
    }

    getLongLink = (shortLink: string) => {
        try {
            return this.collection.findOne({ shortLink: shortLink })
        } catch (err) {
            console.log(err);
        }
    }
}

export { Repository } 