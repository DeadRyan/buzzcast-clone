require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

app.use(express.json()); // Parse JSON bodies

const uri = process.env.MONGODB_URI;
let db;

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
    if (!db) await connectDB();
    const users = db.collection('users');

    const existingUser = await users.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await users.insertOne({ username, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    if (!db) await connectDB();
    const users = db.collection('users');

    const user = await users.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.status(200).json({ message: 'Login successful', username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, async () => {
  await connectDB();
  console.log(`Server running at http://3.141.45.143:${port}`);
});
