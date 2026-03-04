const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Optional test
pool.query('SELECT NOW()')
  .then(() => console.log('Supabase connected!'))
  .catch(err => console.error('DB connection failed:', err));

app.get("/api/conflict", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM conflict ORDER BY start_date DESC");
    const conflicts = result.rows.map(row => ({
      ...row,
      equipment_lost: row.equipment_lost || [],
      sources: row.sources || [],
    }));
    res.json(conflicts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch conflicts" });
  }
});

app.get("/api/conflict/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM conflict WHERE id = $1", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Conflict not found" });

    const conflict = result.rows[0];
    conflict.equipment_lost = conflict.equipment_lost || [];
    conflict.sources = conflict.sources || [];

    res.json(conflict);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch conflict" });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});