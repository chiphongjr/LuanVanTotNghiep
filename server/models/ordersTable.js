import database from "../database/db.js";
export async function createOrdersTable() {
  try {
    const query = `CREATE TABLE IF NOT EXISTS orders (
         id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
         buyer_id UUID NOT NULL,
         total_price int NOT NULL CHECK (total_price >= 20000),
         order_status VARCHAR(50) DEFAULT 'Processing' CHECK (order_status IN ('Processing','Shipped', 'Delivered', 'Cancelled')),
         paid_at TIMESTAMP CHECK (paid_at IS NULL OR paid_at <= CURRENT_TIMESTAMP),
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         discount_id UUID,
         final_price int not null check (final_price >=20000),
         ghn_order_code varchar(50),
        shipping_fee int default 0,
         FOREIGN KEY (discount_id) REFERENCES discounts(id) on delete restrict,
         FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE RESTRICT);`;
    await database.query(query);
  } catch (error) {
    console.error("❌ Failed To Create Orders Table.", error);
    process.exit(1);
  }
}
