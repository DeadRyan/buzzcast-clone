require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

app.use(express.json()); // Parse JSON bodies

const uri = process.env.MONGODB_URI;
let db; // Store DB connection globally

async function connectDB() {
  try {
    const client = new MongoClient(uri, {
      tls: true,
      tlsAllowInvalidCertificates: false
    });
    await client.connect();
    db = client.db('buzzcast');
    console.log('Connected to MongoDB Atlas');
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas:', err);
    return null;
  }
}

app.get('/', (req, res) => {
  res.send('Hello, BuzzCast!');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    if (!db) await connectDB(); // Ensure DB is connected
    const users = db.collection('users');

    // Check if username exists
    const existingUser = await users.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user with hashed password
    await users.insertOne({ username, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, async () => {
  await connectDB();
  console.log(`Server running at http://3.141.45.143:${port}`);
});
