import database from "../database/db.js";

export async function createDiscountsTable() {
  try {
    const query = `create table if not exists discounts (
        id UUID default gen_random_uuid() primary key,
        code varchar(50) not null,
        value int not null,
        start_date DATE not null,
        end_date DATE not null,
        created_at Timestamp default current_timestamp
        );`;
    await database.query(query);
  } catch (error) {
    console.log("Cannot create discount Table", error);
    process.exit(1);
  }
}
