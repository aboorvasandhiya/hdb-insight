import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;

import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const app = express();
app.use(cors());
app.use(express.json());

// Connect to your PostgreSQL database
const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "hdb_resale",
  user: "postgres",
  password: "root",  // change this to your real psql password
});


// Helper to build optional WHERE clause for town, flat type, flat model
function buildFilters(query) {
  const { town, flatType, flatModel } = query;
  const where = [];
  const params = [];
  let i = 1;

  if (town) {
    where.push(`t.town_name = $${i++}`);
    params.push(town);
  }
  if (flatType) {
    where.push(`ft.flat_type_name = $${i++}`);
    params.push(flatType);
  }
  if (flatModel) {
    where.push(`fm.flat_model_name = $${i++}`);
    params.push(flatModel);
  }

  const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
  return { whereSql, params };
}


// ========== Routes ==========


//Admin Dahsboard APIs

// 1. Get all towns
app.get("/api/towns", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM towns ORDER BY town_name");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get flat types, optionally filtered by town
app.get("/api/flat-types", async (req, res) => {
  try {
    const { town } = req.query;

    let sql;
    let params = [];

    if (town) {
      // Only types that actually appear in transactions for this town
      sql = `
        SELECT DISTINCT ft.flat_type_name
        FROM resale_transactions r
        JOIN towns t       ON r.town_id      = t.town_id
        JOIN flat_types ft ON r.flat_type_id = ft.flat_type_id
        WHERE t.town_name = $1
        ORDER BY ft.flat_type_name;
      `;
      params = [town];
    } else {
      // All types
      sql = `
        SELECT DISTINCT flat_type_name
        FROM flat_types
        ORDER BY flat_type_name;
      `;
    }

    const result = await pool.query(sql, params);
    res.json(result.rows.map(r => r.flat_type_name));
  } catch (err) {
    console.error("flat-types error", err);
    res.status(500).json({ error: "Database error" });
  }
});


// Get flat models, optionally filtered by town + flatType
app.get("/api/flat-models", async (req, res) => {
  try {
    const { town, flatType } = req.query;

    let sql;
    let params = [];

    if (town && flatType) {
      // Models that exist for this town + flat type
      sql = `
        SELECT DISTINCT fm.flat_model_name
        FROM resale_transactions r
        JOIN towns t        ON r.town_id       = t.town_id
        JOIN flat_types ft  ON r.flat_type_id  = ft.flat_type_id
        JOIN flat_models fm ON r.flat_model_id = fm.flat_model_id
        WHERE t.town_name = $1
          AND ft.flat_type_name = $2
        ORDER BY fm.flat_model_name;
      `;
      params = [town, flatType];
    } else if (town) {
      // Models for this town (any flat type)
      sql = `
        SELECT DISTINCT fm.flat_model_name
        FROM resale_transactions r
        JOIN towns t        ON r.town_id       = t.town_id
        JOIN flat_models fm ON r.flat_model_id = fm.flat_model_id
        WHERE t.town_name = $1
        ORDER BY fm.flat_model_name;
      `;
      params = [town];
    } else {
      // All models
      sql = `
        SELECT DISTINCT flat_model_name
        FROM flat_models
        ORDER BY flat_model_name;
      `;
    }

    const result = await pool.query(sql, params);
    res.json(result.rows.map(r => r.flat_model_name));
  } catch (err) {
    console.error("flat-models error", err);
    res.status(500).json({ error: "Database error" });
  }
});




// 2. Get resale transactions (optional filter by town)
app.get("/api/resales", async (req, res) => {
  const { town } = req.query;
  try {
    let sql = `
      SELECT r.resale_id, r.month, t.town_name, ft.flat_type_name,
             r.resale_price, r.floor_area_sqm
      FROM resale_transactions r
      JOIN towns t ON r.town_id = t.town_id
      JOIN flat_types ft ON r.flat_type_id = ft.flat_type_id
    `;
    const params = [];
    if (town) {
      sql += " WHERE t.town_name = $1";
      params.push(town);
    }
    sql += " ORDER BY r.month DESC LIMIT 200";
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 3. Simple analytics: average price by town
// 3. Average price by town for bar chart (GLOBAL, no filters)
// 3. Simple analytics: average price by town
app.get("/api/analytics/avg-price-by-town", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.town_name,
             ROUND(AVG(r.resale_price), 0) AS avg_price
      FROM resale_transactions r
      JOIN towns t ON r.town_id = t.town_id
      GROUP BY t.town_name
      ORDER BY avg_price DESC
      LIMIT 20;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});



/*
//4. Total Transactions (optionally filtered by town)
app.get("/api/metrics/total-transactions", async (req, res) => {
  try {
    const { town } = req.query;
    const { where, params } = buildTownWhere(town);

    const result = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM resale_transactions r
      JOIN towns t ON r.town_id = t.town_id
      ${where};
      `,
      params
    );

    res.json(result.rows[0]); // { total: "233815" }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});



//5. Average price by town (for bar chart)
app.get("/api/metrics/avg-price-by-town", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.town_name,
             ROUND(AVG(r.resale_price), 0) AS avg_price
      FROM resale_transactions r
      JOIN towns t ON r.town_id = t.town_id
      GROUP BY t.town_name
      ORDER BY avg_price DESC;
    `);
    res.json(result.rows); // [{town_name: 'CENTRAL', avg_price: 650000}, ...]
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});


// 6. Yearly trend (for the line chart) — optionally filtered by town
app.get("/api/metrics/yearly-trend", async (req, res) => {
  try {
    const { town } = req.query;
    const { where, params } = buildTownWhere(town);

    const result = await pool.query(
      `
      SELECT
        DATE_TRUNC('year', r.month) AS year,
        ROUND(AVG(r.resale_price), 0) AS avg_price,
        COUNT(*) AS total_txn
      FROM resale_transactions r
      JOIN towns t ON r.town_id = t.town_id
      ${where}
      GROUP BY DATE_TRUNC('year', r.month)
      ORDER BY year;
      `,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});



// 7. GET /api/metrics/price-per-sqm?scope=all|latest or ?year=YYYY
// 7. Price per SQM for the latest year, optionally filtered by town
app.get("/api/metrics/price-per-sqm", async (req, res) => {
  try {
    const { town } = req.query;

    let sql;
    let params = [];

    if (town) {
      // latest year within this town
      sql = `
        WITH latest_year AS (
          SELECT MAX(DATE_TRUNC('year', r.month)) AS year_start
          FROM resale_transactions r
          JOIN towns t ON r.town_id = t.town_id
          WHERE t.town_name = $1
        )
        SELECT
          TO_CHAR(ly.year_start, 'YYYY')::int AS year,
          ROUND(SUM(r.resale_price)::numeric / NULLIF(SUM(r.floor_area_sqm),0)) AS price_per_sqm
        FROM resale_transactions r
        JOIN towns t ON r.town_id = t.town_id
        JOIN latest_year ly ON DATE_TRUNC('year', r.month) = ly.year_start
        WHERE t.town_name = $1
        GROUP BY ly.year_start;
      `;
      params = [town];
    } else {
      // latest year across all towns
      sql = `
        WITH latest_year AS (
          SELECT MAX(DATE_TRUNC('year', month)) AS year_start
          FROM resale_transactions
        )
        SELECT
          TO_CHAR(ly.year_start, 'YYYY')::int AS year,
          ROUND(SUM(r.resale_price)::numeric / NULLIF(SUM(r.floor_area_sqm),0)) AS price_per_sqm
        FROM resale_transactions r
        JOIN latest_year ly ON DATE_TRUNC('year', r.month) = ly.year_start
        GROUP BY ly.year_start;
      `;
    }

    const result = await pool.query(sql, params);
    res.json(result.rows[0] ?? { year: null, price_per_sqm: null });
  } catch (err) {
    console.error("price-per-sqm error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
*/
//4. Total Transactions (supports town, flatType, flatModel)
app.get("/api/metrics/total-transactions", async (req, res) => {
  try {
    const { whereSql, params } = buildFilters(req.query);
    const result = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM resale_transactions r
      LEFT JOIN towns t       ON r.town_id       = t.town_id
      LEFT JOIN flat_types ft ON r.flat_type_id  = ft.flat_type_id
      LEFT JOIN flat_models fm ON r.flat_model_id = fm.flat_model_id
      ${whereSql};
      `,
      params
    );
    res.json(result.rows[0]); // { total: "233815" }
  } catch (err) {
    console.error("total-transactions error", err);
    res.status(500).json({ error: "db error" });
  }
});


//5. Average price by town (for bar chart) – respects filters
app.get("/api/metrics/avg-price-by-town", async (req, res) => {
  try {
    const { whereSql, params } = buildFilters(req.query);
    const result = await pool.query(
      `
      SELECT t.town_name,
             ROUND(AVG(r.resale_price), 0) AS avg_price
      FROM resale_transactions r
      LEFT JOIN towns t       ON r.town_id       = t.town_id
      LEFT JOIN flat_types ft ON r.flat_type_id  = ft.flat_type_id
      LEFT JOIN flat_models fm ON r.flat_model_id = fm.flat_model_id
      ${whereSql}
      GROUP BY t.town_name
      ORDER BY avg_price DESC;
      `,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error("avg-price-by-town error", err);
    res.status(500).json({ error: "db error" });
  }
});


// 6. Yearly trend (for the line chart) – respects filters
app.get("/api/metrics/yearly-trend", async (req, res) => {
  try {
    const { whereSql, params } = buildFilters(req.query);
    const result = await pool.query(
      `
      SELECT
        DATE_TRUNC('year', r.month) AS year,
        ROUND(AVG(r.resale_price), 0) AS avg_price,
        COUNT(*) AS total_txn
      FROM resale_transactions r
      LEFT JOIN towns t       ON r.town_id       = t.town_id
      LEFT JOIN flat_types ft ON r.flat_type_id  = ft.flat_type_id
      LEFT JOIN flat_models fm ON r.flat_model_id = fm.flat_model_id
      ${whereSql}
      GROUP BY DATE_TRUNC('year', r.month)
      ORDER BY year;
      `,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error("yearly-trend error", err);
    res.status(500).json({ error: "db error" });
  }
});


// 7. Price per SQM (ALL years, respects filters)
app.get("/api/metrics/price-per-sqm", async (req, res) => {
  try {
    const { whereSql, params } = buildFilters(req.query);
    const result = await pool.query(
      `
      SELECT ROUND(SUM(r.resale_price)::numeric / NULLIF(SUM(r.floor_area_sqm),0)) AS price_per_sqm
      FROM resale_transactions r
      LEFT JOIN towns t       ON r.town_id       = t.town_id
      LEFT JOIN flat_types ft ON r.flat_type_id  = ft.flat_type_id
      LEFT JOIN flat_models fm ON r.flat_model_id = fm.flat_model_id
      ${whereSql};
      `,
      params
    );
    res.json(result.rows[0] ?? { price_per_sqm: null });
  } catch (err) {
    console.error("price-per-sqm error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});




//Admin Data Management APIs

//1. list resales for data management table
app.get("/api/resales/table", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.resale_id,
        TO_CHAR(r.month, 'YYYY-MM') AS month,
        t.town_name,
        ft.flat_type_name,
        r.floor_area_sqm,
        r.storey_min,
        r.storey_max,
        r.resale_price,
        r.remaining_lease_years
      FROM resale_transactions r
      JOIN towns t ON r.town_id = t.town_id
      JOIN flat_types ft ON r.flat_type_id = ft.flat_type_id
      ORDER BY r.month DESC
      LIMIT 200;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});


// 2. create new resale from admin-data page
app.post("/api/resales", async (req, res) => {
  try {
    const {
      town,
      price,
      floorArea,
      floorRange,   // e.g. "10-15"
      flatType,
      leaseLeft
    } = req.body;

    // 1) look up town_id and flat_type_id
    const townRes = await pool.query(
      "SELECT town_id FROM towns WHERE town_name = $1",
      [town]
    );
    if (townRes.rows.length === 0) {
      return res.status(400).json({ error: "Unknown town" });
    }
    const town_id = townRes.rows[0].town_id;

    const ftRes = await pool.query(
      "SELECT flat_type_id FROM flat_types WHERE flat_type_name = $1",
      [flatType]
    );
    if (ftRes.rows.length === 0) {
      return res.status(400).json({ error: "Unknown flat type" });
    }
    const flat_type_id = ftRes.rows[0].flat_type_id;

    // 2) parse floor range "10-15"
    let storey_min = null;
    let storey_max = null;
    if (floorRange && floorRange.includes("-")) {
      const [minStr, maxStr] = floorRange.split("-");
      storey_min = parseInt(minStr, 10);
      storey_max = parseInt(maxStr, 10);
    }

    // 3) insert
    const insertRes = await pool.query(
      `
      INSERT INTO resale_transactions (
        month,
        town_id,
        flat_type_id,
        flat_model_id,
        block,
        street_name,
        storey_min,
        storey_max,
        floor_area_sqm,
        lease_commence_year,
        remaining_lease_years,
        resale_price
      )
      VALUES (
        CURRENT_DATE,     -- month
        $1,               -- town_id
        $2,               -- flat_type_id
        NULL,             -- flat_model_id
        'N/A',            -- block
        'N/A',            -- street_name
        $3,               -- storey_min
        $4,               -- storey_max
        $5,               -- floor_area_sqm
        NULL,             -- lease_commence_year
        $6,               -- remaining_lease_years
        $7                -- resale_price
      )
      RETURNING *;
      `,
      [
        town_id,
        flat_type_id,
        storey_min,
        storey_max,
        floorArea ? Number(floorArea) : null,
        leaseLeft ? Number(leaseLeft) : null,
        price ? Number(price) : null,
      ]
    );

    res.status(201).json(insertRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});


// ===== MongoDB users + insights =====
dotenv.config();

let _mongoClient = null;
let _db = null;
let Users = null;
let Insights = null;

async function initMongo() {
  if (_mongoClient) return;
  _mongoClient = new MongoClient(process.env.MONGODB_URI, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
  });
  await _mongoClient.connect();
  _db = _mongoClient.db("hdb_insights");
  Users = _db.collection("users");
  Insights = _db.collection("insights");
  console.log("✅ Mongo connected");
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing token" });
  try { req.user = jwt.verify(token, JWT_SECRET); return next(); }
  catch { return res.status(401).json({ error: "invalid token" }); }
}

// --- AUTH (MongoDB) ---
app.post("/api/auth/signup", async (req, res) => {
  await initMongo();
  const { username, email, password, phone } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "username & password required" });

  const existing = await Users.findOne({ username }, { collation: { locale: "en", strength: 2 } });
  if (existing) return res.status(400).json({ error: "username already exists" });

  // optional: basic phone sanitize (keep digits/spaces/+ only)
  const phoneClean = typeof phone === "string" ? phone.trim() : null;

  const passwordHash = await bcrypt.hash(password, 10);
  const r = await Users.insertOne({
    username,
    email: email ?? null,
    phone: phoneClean ?? null,
    passwordHash,
    role: "user",
    createdAt: new Date(),
    lastLoginAt: null
  });

  const token = jwt.sign({ id: r.insertedId, username, role: "user" }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: r.insertedId, username, role: "user", phone: phoneClean ?? null } });
});


app.post("/api/auth/login", async (req, res) => {
  await initMongo();
  const { username, password } = req.body || {};
  const u = await Users.findOne({ username }, { collation: { locale: "en", strength: 2 } });
  if (!u) return res.status(401).json({ error: "invalid credentials" });
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });
  await Users.updateOne({ _id: u._id }, { $set: { lastLoginAt: new Date() } });

  const token = jwt.sign({ id: u._id, username: u.username, role: u.role }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: u._id, username: u.username, role: u.role } });
});

// --- INSIGHTS (MongoDB) ---
app.post("/api/insights", auth, async (req, res) => {
  await initMongo();
  const { town, comment, rating, tags } = req.body || {};
  if (!town || !comment) return res.status(400).json({ error: "town & comment required" });

  const userObjectId = ObjectId.createFromHexString(req.user.id);

  const doc = {
    userId: userObjectId,
    username: req.user.username,
    town,
    comment,
    rating: rating ? Number(rating) : null,
    tags: Array.isArray(tags) ? tags : [],
    status: "pending",
    date: new Date(),
    createdAt: new Date(),
    updatedAt: null
  };
  const r = await Insights.insertOne(doc);
  res.json({ insertedId: r.insertedId, status: "pending" });
});

app.get("/api/insights", async (_req, res) => {
  await initMongo();
  const docs = await Insights.find({ status: "approved" })
    .sort({ date: -1 })
    .limit(100)
    .toArray();
  res.json(docs);
});

app.get("/api/insights/mine", auth, async (req, res) => {
  await initMongo();
  const userObjectId = ObjectId.createFromHexString(req.user.id);
  const docs = await Insights.find({ userId: userObjectId })
    .sort({ createdAt: -1 })
    .toArray();
  res.json(docs);
});

// Put this AFTER your Mongo vars and initMongo(), BEFORE app.listen(...)
app.get("/_debug/mongo", async (_req, res) => {
  try {
    await initMongo();

    // support both styles (_mongoClient/_db) or (mongoClient/mongoDb)
    const client = (typeof _mongoClient !== "undefined" && _mongoClient) || mongoClient;
    const db     = (typeof _db !== "undefined" && _db) || mongoDb;

    if (!client || !db) {
      return res.status(500).json({ error: "Mongo client/db not initialized" });
    }

    const admin = client.db().admin();
    const dbs = await admin.listDatabases();
    const count = await Users.countDocuments();
    const latest = await Users.find()
      .project({ username: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    res.json({
      connectedTo: process.env.MONGODB_URI,
      usingDatabase: db.databaseName,
      databases: dbs.databases.map(d => d.name),
      usersCount: count,
      latestUsers: latest
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Get current user (no passwordHash)
app.get("/api/auth/me", auth, async (req, res) => {
  await initMongo();
  const u = await Users.findOne(
    { _id: ObjectId.createFromHexString(req.user.id) },
    { projection: { passwordHash: 0 } }
  );
  if (!u) return res.status(404).json({ error: "user not found" });
  res.json(u);
});

// Update current user's basic profile
app.put("/api/account", auth, async (req, res) => {
  await initMongo();
  const { username, email, phone } = req.body || {};
  const _id = ObjectId.createFromHexString(req.user.id);

  // if username is changing, enforce uniqueness (case-insensitive)
  if (username && username !== req.user.username) {
    const exists = await Users.findOne(
      { username },
      { collation: { locale: "en", strength: 2 } }
    );
    if (exists && exists._id.toString() !== _id.toString()) {
      return res.status(400).json({ error: "username already exists" });
    }
  }

  const update = {
    ...(username ? { username } : {}),
    ...(email !== undefined ? { email } : {}),
    ...(phone !== undefined ? { phone } : {}),
    updatedAt: new Date()
  };

  await Users.updateOne({ _id }, { $set: update });

  // if username changed, reflect that in token-bearing client state
  const fresh = await Users.findOne(
    { _id },
    { projection: { passwordHash: 0 } }
  );
  res.json(fresh);
});

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'admin only' });
  }
  next();
}

/**
 * GET /api/admin/insights
 * List insights for moderation.
 * Query:
 *  - status: 'pending' | 'approved' | 'rejected' (default: pending)
 *  - q: optional text search over town/comment
 */
 app.get('/api/admin/insights', auth, requireAdmin, async (req, res) => {
  await initMongo();
  const { status = 'pending', q = '' } = req.query;

  const filter = { status };
  if (q) {
    filter.$or = [
      { comment: { $regex: q, $options: 'i' } },
      { town: { $regex: q, $options: 'i' } },
    ];
  }

  const docs = await Insights
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  res.json(docs);
});

/**
 * PATCH /api/admin/insights/:id
 * Body: { status: 'approved' | 'rejected' }
 */
app.patch('/api/admin/insights/:id', auth, requireAdmin, async (req, res) => {
  await initMongo();
  const { id } = req.params;
  const { status } = req.body || {};

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'invalid status' });
  }

  const r = await Insights.updateOne(
    { _id: ObjectId.createFromHexString(id) },
    { $set: { status, updatedAt: new Date() } }
  );

  res.json({ modifiedCount: r.modifiedCount });
});

/**
 * DELETE /api/admin/insights/:id
 * Permanently remove an insight.
 */
app.delete('/api/admin/insights/:id', auth, requireAdmin, async (req, res) => {
  await initMongo();
  const { id } = req.params;

  const r = await Insights.deleteOne({ _id: ObjectId.createFromHexString(id) });
  res.json({ deletedCount: r.deletedCount });
});

/**
 * GET /api/admin/insights/stats
 * Simple moderation counters.
 */
app.get('/api/admin/insights/stats', auth, requireAdmin, async (_req, res) => {
  await initMongo();
  const [pending, approved, rejected] = await Promise.all([
    Insights.countDocuments({ status: 'pending' }),
    Insights.countDocuments({ status: 'approved' }),
    Insights.countDocuments({ status: 'rejected' }),
  ]);
  res.json({ pending, approved, rejected });
});

// ========== Start server ==========
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
});
