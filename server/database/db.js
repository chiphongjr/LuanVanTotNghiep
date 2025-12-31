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
// export default database;


import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Client } = pkg;

const database = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // cần khi kết nối DB online
  },
});

try {
  await database.connect();
  console.log("Connect db successfully");
} catch (error) {
  console.error("Connect db fail", error);
  process.exit(1);
}

export default database;
