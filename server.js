const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require('dotenv').config(); // if using .env for DATABASE_URL

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// GET all conflicts
app.get("/api/conflict", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM conflict ORDER BY start_date DESC"
    );

    const conflicts = result.rows.map((row) => ({
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

// GET a single conflict by ID
app.get("/api/conflict/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM conflict WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Conflict not found" });

    const conflict = result.rows[0];
    conflict.equipment_lost = conflict.equipment_lost || {};
    conflict.sources = conflict.sources || [];

    res.json(conflict);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch conflict" });
  }
});

// Start server accessible externally
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});