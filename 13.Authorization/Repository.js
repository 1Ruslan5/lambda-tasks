const { MongoClient } = require('mongodb');
const { dbName, collectionUser, collectionTokens } = require('./dbName');
require('dotenv').config();

class Repository {

  client;

  constructor(URI) {
    this.client = new MongoClient(URI);
  }

  connect = async () => {
    try {
      await this.client.connect();
      console.log('Connected successfully to server');
      const collection = this.client.db(dbName).collection(collectionTokens);
      await collection.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 0 });
    } catch (err) {
      console.log(err);
    }
  }

  getAllUsers = () => {
    try {
      const collection = this.client.db(dbName).collection(collectionUser);
      return collection.find({}).toArray();
    } catch (err) {
      console.log(err);
    }
  }

  getAllTokens = () => {
    try {
      const collection = this.client.db(dbName).collection(collectionTokens);
      return collection.find({}).toArray();
    } catch (err) {
      console.log(err);
    }
  }

  insertUser = async (user) => {
    try {
      const collection = this.client.db(dbName).collection(collectionUser);
      await collection.insertOne(user);
    } catch (err) {
      console.log(err);
    }
  }

  insertTokens = async (token) => {
    try {
      const collection = this.client.db(dbName).collection(collectionTokens);
      await collection.insertOne(token)
    } catch (err) {
      console.log(err)
    }
  }

  getDataFromToken = async (info) => {
    try {
      const collection = this.client.db(dbName).collection(collectionTokens);
      return collection.find(info).toArray();
    } catch (err) {
      console.log(err)
    }
  }

  updateToken = async (query, values) => {
    try {
      const collection = this.client.db(dbName).collection(collectionTokens);
      await collection.updateOne(query, values);
    } catch (err) {
      console.log(err)
    }
  }
}
module.exports = { Repository };