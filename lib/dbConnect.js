// lib/dbConnect.js
const MongoClient = require('mongodb').MongoClient;

export const dbConnect = async () => {
  const uri = process.env.MONGODB_CONNECTION_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('[process.env.MONGODB_CONNECTION_URI]', process.env.MONGODB_CONNECTION_URI);
  try {
    await client.connect();
    return client;
  } catch (error) {
    console.log(error);
  }
}