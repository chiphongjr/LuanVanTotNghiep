import { createUserTable } from "../models/userTable.js";
import { createOrderItemTable } from "../models/orderItemsTable.js";
import { createOrdersTable } from "../models/ordersTable.js";
import { createPaymentsTable } from "../models/paymentsTable.js";
import { createProductReviewsTable } from "../models/productReviewsTable.js";
import { createProductsTable } from "../models/productTable.js";
import { createShippingInfoTable } from "../models/shippinginfoTable.js";
import { createCartItemsTable } from "../models/cartItemsTable.js";
import { createCartTable } from "../models/cartTable.js";
import { createCategoryTable } from "../models/categoryTable.js";
import { createDiscountsTable } from "../models/discountTable.js";

export const createTables = async () => {
  try {
    await createUserTable();
    await createCategoryTable();
    await createProductsTable();
    await createProductReviewsTable();
    await createDiscountsTable();
    await createOrdersTable();
    await createOrderItemTable();
    await createShippingInfoTable();
    await createPaymentsTable();
    await createCartTable();
    await createCartItemsTable();
    console.log("All Tables Created Successfully.");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};
