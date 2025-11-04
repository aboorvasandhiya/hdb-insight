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


//Admin Data Management APIs

//7. list resales for data management table
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


// create new resale from admin-data page
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






// ========== Start server ==========
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
});
