const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

app.post("/users/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userExistsornot = `
SELECT * FROM user WHERE username='${username}';`;

  const dbuser = await db.get(selectUserQuery);

  if (dbuser === undefined) {
    const createUserQuery = `
    INSERT INTO 
    user(username,name,password,gender,location)
    VALUES(
        '${username}',
        '${name}',
        '${hashedPassword}',
        '${gender}',
        '${location}'
    );`;
    await db.run(createUserQuery);
    response.send("User created successfully");
  } else {
    response.send("User already exists");
  }
});

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const userRegisteredornot = `
    SELECT * FROM user WHERE username='${username}';
    `;

  const userRegisteredornotResponse = await db.get(userRegisteredornot);

  if (userRegisteredornotResponse === undefined) {
    response.send("User not registered");
  } else {
    const comparepasskey = await bcrypt.compare(
      password,
      userRegisteredornotResponse.password
    );
    if (comparepasskey === true) {
      response.send("Login Success");
    } else {
      response.send("Invalid password");
    }
  }
});
