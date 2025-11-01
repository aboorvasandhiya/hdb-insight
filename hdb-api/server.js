import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;

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

// ========== Routes ==========

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


//4. Total Transactions
app.get("/api/metrics/total-transactions", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) AS total FROM resale_transactions;");
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


// 6. Yearly trend (for the line chart)
app.get("/api/metrics/yearly-trend", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        DATE_TRUNC('year', r.month) AS year,
        ROUND(AVG(r.resale_price), 0) AS avg_price,
        COUNT(*) AS total_txn
      FROM resale_transactions r
      GROUP BY DATE_TRUNC('year', r.month)
      ORDER BY year;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error" });
  }
});




// ========== Start server ==========
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
});
