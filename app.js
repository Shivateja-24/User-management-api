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
      pan_num TEXT NOT NULL ,
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
// for testing if routing is working or not
app.get("/", (req, res) => {
  res.send("Get working");
});

app.post("/create_user", async (req, res) => {
  const { full_name, mob_num, pan_num, manager_id } = req.body;
  try {
    if (!full_name || !mob_num || !pan_num || !manager_id) {
      return res.status(400).send("All fields are required");
    }
    //Validating mobile number using regex
    const mob_num_regex = /^\+91\d{10}$/;
    if (!mob_num_regex.test(mob_num)) {
      return res
        .status(400)
        .send("Invalid phone number format. Use +91 followed by 10 digits.");
    }
    //Validating Pan number
    const pan = pan_num.toUpperCase(); //incase smallercase is given
    const pan_num_regex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!pan_num_regex.test(pan)) {
      return res.status(400).send("Invalid PAN number format.");
    }
    //Validating manager exists and is_active,
    const checkManagerQuery = `SELECT * FROM managers where manager_id=? AND is_active=1`;
    const managerRes = await db.get(checkManagerQuery, [manager_id]);
    if (!managerRes) {
      return res.status(400).send("Manager doesn't exist or is not active");
    }

    //checking duplicate entries
    const checkDuplicateQuery = `SELECT * from users where (mob_num=? or pan_num=?) and is_active=1`;
    const existingUser = await db.get(checkDuplicateQuery, [mob_num, pan]);
    if (existingUser) {
      return res
        .status(400)
        .send("User with same mobile number or PAN number already exists");
    }

    //inserting the user data to users table i.e create user
    const userId = uuidv4();
    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();

    const insert_user_query = `INSERT INTO users (user_id,full_name,mob_num,pan_num,manager_id,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?)`;
    await db.run(insert_user_query, [
      userId,
      full_name,
      mob_num,
      pan,
      manager_id,
      createdAt,
      updatedAt,
    ]);
    res
      .status(200)
      .json({ message: "User created successfully", user_id: userId });
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Internal server error.");
  }
});

app.post("/get_users", async (req, res) => {
  try {
    const { user_id, mob_num, manager_id, is_active } = req.body;
    let query = `Select * from users`;
    let param = null;

    if (user_id) {
      query = `SELECT * from users where user_id=?`;
      param = user_id;
    } else if (mob_num) {
      const mob_regex = /^\+91\d{10}$/;
      if (!mob_regex.test(mob_num)) {
        return res
          .status(400)
          .send("Invalid phone number format. Use +91 followed by 10 digits");
      }
      query = `Select * from users where mob_num=?`;
      param = mob_num;
    } else if (manager_id) {
      query = `Select * from users where manager_id=?`;
      param = manager_id;
    } else if (is_active === "1" || is_active === "0") {
      query = `Select * from users where is_active=?`;
      param = Number(is_active);
    }
    const users = param ? await db.all(query, [param]) : await db.all(query);
    res.status(200).json({ users });
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Internal server error");
  }
});

app.delete("/delete_users", async (req, res) => {
  try {
    const { user_id, mob_num } = req.body;
    let query = "";
    let param = "";
    if (user_id) {
      query = `Select * from users where user_id=?`;
      param = user_id;
    } else if (mob_num) {
      const mob_regex = /^\+91\d{10}$/;
      if (!mob_regex) {
        return res
          .status(400)
          .send("Invalid phone number format. Use +91 followed by 10 digits");
      }
      query = `Select * from users where mob_num=?`;
      param = mob_num;
    }
    const user = await db.get(query, [param]);
    if (!user) {
      return res.status(400).send("User not Found");
    }
    const deleteQuery = user_id
      ? `delete from users where user_id=?`
      : `delete from users where mob_num=?`;
    await db.run(deleteQuery, [param]);
    res.status(200).send("User deleted successfully");
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Internal Error");
  }
});

app.put("/update_users", async (req, res) => {
  const { user_ids, update_data } = req.body;
  if (user_ids.length === 0) {
    return res.status(400).send("User ids required");
  }
  if (Object.keys(update_data).length < 1) {
    return res.status(400).send("User Updated data required");
  }
  try {
    const { full_name, mob_num, pan_num, manager_id } = update_data;
    if (mob_num) {
      const mob_num_regex = /^\+91\d{10}$/;
      if (!mob_num_regex.test(mob_num)) {
        return res
          .status(400)
          .send("Invalid phone number format. Use +91 followed by 10 digits.");
      }
    }
    //Validating Pan number
    if (pan_num) {
      const pan = pan_num.toUpperCase(); //incase smallercase is given
      const pan_num_regex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
      if (!pan_num_regex.test(pan)) {
        return res.status(400).send("Invalid PAN number format.");
      }
      update_data.pan_num = pan;
    }
    if (manager_id) {
      const managerQuery = `SELECT * FROM managers WHERE manager_id = ? AND is_active = 1`;
      const managerExists = await db.get(managerQuery, [manager_id]);
      if (!managerExists) {
        return res
          .status(400)
          .send("Provided manager_id is invalid or inactive");
      }
    }

    // If only manager_id is being updated then proceeding to bulk update
    if (Object.keys(update_data).length === 1 && manager_id) {
      for (const id of user_ids) {
        const user = await db.get(
          `SELECT * FROM users WHERE user_id = ? AND is_active = 1`,
          [id]
        );
        if (!user) {
          return res.status(404).send(`User with user_id ${id} not found`);
        }

        // Marking current as inactive
        await db.run(
          `UPDATE users SET is_active = 0, updated_at = ? WHERE user_id = ?`,
          [new Date().toISOString(), id]
        );

        // Insert new row with new manager_id and same data
        const newUserId = uuidv4();
        const insertQuery = `
          INSERT INTO users (user_id, full_name, mob_num, pan_num, manager_id, created_at, updated_at, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `;
        await db.run(insertQuery, [
          newUserId,
          user.full_name,
          user.mob_num,
          user.pan_num,
          manager_id,
          new Date().toISOString(),
          new Date().toISOString(),
        ]);
      }
      return res
        .status(200)
        .send("Users' manager_id updated (new row created)");
    }

    // If full update (not just manager_id)
    for (const id of user_ids) {
      const user = await db.get(
        `SELECT * FROM users WHERE user_id = ? AND is_active = 1`,
        [id]
      );
      if (!user) {
        return res.status(404).send(`User with user_id ${id} not found`);
      }

      const updateQuery = `
        UPDATE users
        SET
          full_name = COALESCE(?, full_name),
          mob_num = COALESCE(?, mob_num),
          pan_num = COALESCE(?, pan_num),
          manager_id = COALESCE(?, manager_id),
          updated_at = ?
        WHERE user_id = ?
      `;

      await db.run(updateQuery, [
        full_name || user.full_name,
        mob_num || user.mob_num,
        pan_num || user.pan_num,
        manager_id || user.manager_id,
        new Date().toISOString(),
        id,
      ]);
    }

    res.status(200).send("User(s) updated successfully");
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Internal Server Error");
  }
});
