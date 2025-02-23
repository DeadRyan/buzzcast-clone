const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function testConnection() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Successfully connected to MongoDB Atlas');
    await client.close();
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

testConnection();
