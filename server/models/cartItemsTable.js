import database from "../database/db.js";

export async function createCartItemsTable() {
  try {
    const query = `CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
`;

    await database.query(query);
  } catch (error) {
    console.error("Cannot create CartTableItem ", error);
    process.exit(1);
  }
}
