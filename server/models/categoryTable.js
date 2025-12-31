import database from "../database/db.js";

export async function createCategoryTable() {
  try {
    const query = `
    CREATE TABLE IF NOT EXISTS categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

    await database.query(query);
  } catch (error) {
    console.error("Cannot create categoryTable", error);
    process.exit(1);
  }
}
