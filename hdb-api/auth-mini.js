// auth-mini.js  (PORT 3002)
// Minimal Mongo Users + Insights API with CORS + JSON and clear logs.
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();
app.use(cors());            // allow Vite (5173)
app.use(express.json());    // parse JSON

// ---- health & logger ----
app.get('/ping', (_req, res) => res.json({ ok: true }));
app.use((req, _res, next) => { console.log(`${req.method} ${req.url}`); next(); });

// ---- Mongo connection (lazy init) ----
let client, db, Users, Insights;
async function initMongo() {
  if (client) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('❌ MONGODB_URI missing in .env'); process.exit(1); }
  client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true } });
  await client.connect();
  db = client.db('hdb_insights');
  Users = db.collection('users');
  Insights = db.collection('insights');
  console.log('✅ Mongo connected');
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'invalid token' }); }
}

// ---- AUTH ----
app.post('/api/auth/signup', async (req, res) => {
  try {
    await initMongo();
    const { username, email, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username & password required' });

    const existing = await Users.findOne({ username }, { collation: { locale: 'en', strength: 2 } });
    if (existing) return res.status(400).json({ error: 'username already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const r = await Users.insertOne({ username, email: email ?? null, passwordHash, role: 'user', createdAt: new Date(), lastLoginAt: null });
    const token = jwt.sign({ id: r.insertedId, username, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: r.insertedId, username, role: 'user' } });
  } catch (e) {
    console.error('signup error:', e);
    res.status(500).json({ error: 'server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await initMongo();
    const { username, password } = req.body || {};
    const u = await Users.findOne({ username }, { collation: { locale: 'en', strength: 2 } });
    if (!u) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    await Users.updateOne({ _id: u._id }, { $set: { lastLoginAt: new Date() } });
    const token = jwt.sign({ id: u._id, username: u.username, role: u.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: u._id, username: u.username, role: u.role } });
  } catch (e) {
    console.error('login error:', e);
    res.status(500).json({ error: 'server error' });
  }
});

// ---- INSIGHTS (optional quick checks) ----
app.post('/api/insights', auth, async (req, res) => {
  await initMongo();
  const { town, comment, rating, tags } = req.body || {};
  if (!town || !comment) return res.status(400).json({ error: 'town & comment required' });
  const doc = {
    userId: new ObjectId(req.user.id),
    username: req.user.username,
    town, comment,
    rating: rating ? Number(rating) : null,
    tags: Array.isArray(tags) ? tags : [],
    status: 'pending', date: new Date(),
    createdAt: new Date(), updatedAt: null
  };
  const r = await Insights.insertOne(doc);
  res.json({ insertedId: r.insertedId, status: 'pending' });
});

const PORT = 3002;
app.listen(PORT, () => console.log(`🟢 auth-mini running at http://localhost:${PORT}`));
