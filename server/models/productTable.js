import database from "../database/db.js";

export async function createProductsTable() {
  try {
    const query = `CREATE TABLE IF NOT EXISTS products (
         id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
         name VARCHAR(255) NOT NULL unique,
         description TEXT,
         price int NOT NULL CHECK (price >= 20000),
         category_id UUID NOT NULL,
         ratings DECIMAL(3,2) DEFAULT 0 CHECK (ratings BETWEEN 0 AND 5),
         images JSONB DEFAULT '[]'::JSONB not null,
         stock INT NOT NULL CHECK (stock >= 0),
         created_by UUID NOT NULL,
         search_vector tsvector,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
         FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE);`;
    await database.query(query);
  } catch (error) {
    console.error("❌ Failed To Create Products Table.", error);
    process.exit(1);
  }
}
