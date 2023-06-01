const mongodb =  require('mongodb');

let uri = "mongodb+srv://sultrus15:1505200415Srs@cluster0.bqu3h4w.mongodb.net/?retryWrites=true&w=majority";
const client = new mongodb.MongoClient(uri);

const dbName = 'Authorization';
const collectionUser = 'users';
const collectionTokens = 'tokens';

async function connect() {
  await client.connect();
  console.log('Connected successfully to server');
  const collection = client.db(dbName).collection(collectionTokens);
  await collection.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 0 });
}

function getAllUsers(){
  const collection = client.db(dbName).collection(collectionUser);
  return  collection.find({}).toArray();
}

function getAllTokens(){
  const collection = client.db(dbName).collection(collectionTokens);
  return  collection.find({}).toArray();
}

async function insertUser(user){
  const collection = client.db(dbName).collection(collectionUser);
  await collection.insertOne(user);
}

async function insertTokens(token){
  const collection = client.db(dbName).collection(collectionTokens);
  await collection.insertOne(token)
}

async function getDataFromToken(info){
  const collection = client.db(dbName).collection(collectionTokens);
  return collection.find(info).toArray();
}

async function updateToken(query, values){
  const collection = client.db(dbName).collection(collectionTokens);
  await collection.updateOne(query, values);
}

module.exports = {
  connect,
  getAllUsers,
  getAllTokens,
  insertUser,
  insertTokens,
  getDataFromToken,
  updateToken,
};

 