import { MongoClient, WithId } from "mongodb";
import { dbname, collectionName } from './dbName';
import 'dotenv/config';

const URI: string = process.env.URI!;

class Repository {

    private client;
    private collection;

    constructor() {
        this.client = new MongoClient(URI);
        this.collection = this.client.db(dbname).collection(collectionName);
    }

    connect = async () => {
        try {
            await this.client.connect();
            console.log('Connect to db successed');
        } catch (err) {
            console.log(err);
        }
    }

    insertJSON = async (json: Object) => {
        try {
            await this.collection.insertOne(json);
        } catch (err) {
            console.log(err);
        }

    }

    getJSON = async (route: any): Promise<any> => {
        try {
            return this.collection.findOne(route);
        } catch (err) {
            console.log(err);
        }
    }
}

export { Repository }