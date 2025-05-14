const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());

const { v4: uuidv4 } = require("uuid");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "user-management.db");

let db = null;

const createTables = async () => {
  await db.run(`
    CREATE TABLE IF NOT EXISTS managers (
      manager_id TEXT PRIMARY KEY,
      is_active INTEGER DEFAULT 1
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      mob_num TEXT NOT NULL,
      pan_num TEXT NOT NULL,
      manager_id TEXT,
      created_at TEXT,
      updated_at TEXT,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY(manager_id) REFERENCES managers(manager_id)
    )
  `);
  console.log("table created successfully");
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    await createTables();
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//console.log(uuidv4());
//26f0ab44-d1f5-492a-b1f2-7adac3b3d2e9
//NOTE: This manager_id is inserted manually to allow validation in /create_user endpoint.
// This endpoint is added temporarily to insert a manager into the 'managers' table.
// It's required to have at least one active manager to validate 'manager_id' while creating users.
// In a real-world application, managers would be added through a separate admin workflow.
app.post("/add_manager", async (req, res) => {
  const { manager_id, is_active } = req.body;
  try {
    const add_manager_query = `INSERT INTO managers(manager_id, is_active) VALUES (?,?)`;
    const dbResponse = await db.run(add_manager_query, [
      manager_id,
      is_active ? 1 : 0,
    ]);
    res.status(200).send("Manager added successfully");
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Failed to add manager, manager_id already exists");
  }
});

app.get("/", (req, res) => {
  res.send("Get working");
});

app.post("/create_user", async (req, res) => {
  const { full_name, mob_num, pan_num, manager_id } = req.body;
  res.send("user data is taken from request");
});
