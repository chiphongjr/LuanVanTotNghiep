import database from "../database/db.js";

export async function createCartTable() {
  try {
    const query = `CREATE TABLE IF NOT EXISTS carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`;

    await database.query(query);
  } catch (error) {
    console.error("Cannot create CartTables ", error);
    process.exit(1);
  }
}
