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
const { Pool } = pkg;

const database = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

database
  .connect()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });

export default database;

