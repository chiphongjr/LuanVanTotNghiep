// import pkg from "pg";

// const { Client } = pkg;

// const database = new Client({
//   user: "postgres",
//   host: "localhost",
//   database: process.env.DB_NAME,
//   password: "Phong20042003",
//   port: 5432,
// });

// try {
//   await database.connect();
//   console.log("Connect db successfully");
// } catch (error) {
//   console.error("Connect db fail", error);
//   process.exit(1);
// }

import pkg from "pg";
const { Client } = pkg;

const isRenderDB = process.env.DB_URL?.includes("render.com");

const database = new Client({
  connectionString: process.env.DB_URL,
  ssl: isRenderDB
    ? { rejectUnauthorized: false }
    : false,
});

export default database;


