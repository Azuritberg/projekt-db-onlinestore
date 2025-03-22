import { input } from "./utils.js";
//import { sql } from "./sql.js";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

export const views = {
  start: async (session, setView) => {
    console.log("=== ONLINE STORE CLI ===");
    console.log("Are you an admin or a customer?");
    console.log("1. Admin");
    console.log("2. Customer");
    console.log("0. Exit program");
    const ch = await input();
    if (ch === "1") {
      session.grantAdmin();
      setView("main");
    } else if (ch === "2") {
      session.revokeAdmin();
      //setView("customerStart");
    } else if (ch === "0") {
      Deno.exit();
    }
  },
  customerStart: async (_, setView) => {
    console.log("=== CUSTOMER ===");
    console.log("Do you want to log in or register?");
    console.log("1. Log in");
    console.log("2. Register");
    console.log("0. Go back");
    const ch = await input();
    if (ch === "1") {
      setView("customerLogin");
    } else if (ch === "2") {
      setView("customerRegister");
    } else if (ch === "0") {
      setView("start");
    }
  },
  customerLogin: async (_, setView) => {
    console.log("=== CUSTOMER LOGIN ===");
    console.log("Input your email and password separated by a semicolon (:)");
    console.log("Example: email:password");
    console.log("Type 0 to cancel the log in");
    const credentials = await input();
    if (credentials === "0") {
      setView("customerLogin");
    } else {
      //      const user = await sql`
      //SELECT customer_mail_address, customer_password FROM Customer WHERE customer_mail_address = ${data.email};
      //`;

      if (!(await bcrypt.compare(data.password, user["customer_password"]))) {
        // FAILED
        return;
      }

      session.user = user["customer_mail_address"];
    }
  },
  customerRegister: async (_, setView) => {
    console.log("=== CUSTOMER REGISTER ===");
    console.log("Type 0 at any time to cancel the registration process");

    console.log("Input your email:");
    const email = await input();
    if (email === "0") {
      setView("customerStart");
      return;
    }

    console.log("Input your password:");
    const password = await input();
    if (password === "0") {
      setView("customerStart");
      return;
    }

    console.log("Input your first name:");
    const fName = await input();
    if (fName === "0") {
      setView("customerStart");
      return;
    }

    console.log("Input your last name:");
    const lName = await input();
    if (lName === "0") {
      setView("customerStart");
      return;
    }

    console.log("Input your address:");
    const address = await input();
    if (address === "0") {
      setView("customerStart");
      return;
    }

    console.log("Input your city:");
    const city = await input();
    if (city === "0") {
      setView("customerStart");
      return;
    }

    console.log("Input your country:");
    const country = await input();
    if (country === "0") {
      setView("customerStart");
      return;
    }

    const newCredentials = {
      email,
      password,
      fName,
      lName,
      address,
      city,
      country,
    };

    console.log("Not implemented");
  },
  main: async (session, setView) => {
    console.log("Logged in as: " + session.isAdmin() ? "Admin" : session.user);
    if (!session.isAdmin()) {
      console.log("To view your cart, type 'cart'");
      console.log("To view your orders, type 'orders'");
    }
    console.log("1. View products");
    if (session.isAdmin()) {
      console.log("2. Manage Discounts");
      console.log("3. Manage Suppliers");
      console.log("4. Confirm Orders");
      console.log("0. Exit");
    }
    const ch = await input();
    if (ch === "cart" && !session.isAdmin()) {
      setView("cart");
    } else if (ch === "orders" && !session.isAdmin()) {
      setView("orders");
    } else if (ch === "1") {
      setView("viewProducts");
    } else if (ch === "2" && session.isAdmin()) {
      setView("manageDiscounts");
    } else if (ch === "3" && session.isAdmin()) {
      setView("manageSuppliers");
    } else if (ch === "4" && session.isAdmin()) {
      setView("confirmOrders");
    } else if (ch === "0") {
      // session.logOut();
      setView("start");
    }
  },
  viewProducts: async (session, setView, filters) => {
    console.log("=== PRODUCTS ===");
    if (session.isAdmin()) {
      console.log(
        "Type 'discount' followed by the product code to add a discount",
      );
      console.log(
        "Type 'delete' followed by the product code to delete a product",
      );
      console.log(
        "Type 'qty' followed by the product code to change the quantity of a product",
      );
    }

    if (!session.isAdmin()) {
      console.log(
        "Type 'add' followed by the product code to add a product to your cart",
      );
    }

    console.log(
      "\nTo filter for products, type 'search' followed by the filter type and its value separated with a colon (:)",
    );
    console.log("Filters are separated by a comma");
    console.log("Do not use any spaces in your filter list");
    console.log("Available filters: code, name, supplier, minprice, maxprice");
    console.log("Example: name:harddrive,minprice:12.00");
    if (filters && filters.length > 0) {
      console.log("[ACTIVE FILTERS]");
      for (const { name, value } of filters) {
        console.log(`${name}: ${value}`);
      }
    }
    console.log("Type 0 to go back");
    console.log("\n${PRODUCT_LIST}");
    let ch = await input();
    if (ch === "0") {
      setView("main");
    }
    ch = ch.split(" ");

    if (ch[0] === "search" && ch[1]) {
      const _f = ch[1].split(",");
      const f = [];
      for (const e of _f) {
        f.push({ name: e.split(":")[0], value: e.split(":")[1] });
      }
      setView("viewProducts", f);
    }

    if (session.isAdmin()) {
      if (ch[0] === "discount" && ch[1]) {
        setView("applyDiscount", ch[1]);
      } else if (ch[0] === "delete" && ch[1]) {
        setView("deleteProduct", ch[1]);
      } else if (ch[0] === "qty" && ch[1]) {
        setView("qtyProduct", ch[1]);
      }
    } else if (!session.isAdmin()) {
      if (ch[0] === "add" && ch[1]) {
        setView("addToCart", ch[1]);
      }
    }
  },
  applyDiscount: async (_, setView, productCode) => {
    console.log("=== APPLY DISCOUNT ===");
    console.log("Current product:", productCode);
    console.log(
      "Separated by colons (:), Input the name, start date and end date of the discount you want to apply to product ${PRODUCT_NAME}",
    );
    console.log("Date must be formatted like YYYYMMDD");
    console.log("Example: XMAS:20251201:20251231");
    console.log("Type 0 to go back");
    console.log("\n${DISCOUNT_LIST}");
    let ch = await input();

    if (ch === "0") {
      setView("viewProducts");
    }

    ch = ch.split(":");
    if (ch.length === 3) {
      const start = ch[1];
    } else if (ch === "0") {
      setView("");
    }
  },
  deleteProduct: async (_, setView, productCode) => {
    console.log("=== DELETE PRODUCT ===");
    console.log("Current product:", productCode);
    console.log("[y]es/[n]o?");
    console.log("Type 0 to go back");
    const ch = await input();
    if (ch === "0") {
      setView("viewProducts");
    } else if (ch === "y" || ch === "yes") {
      console.log("Not implemented");
    } else if (ch === "n" || ch === "no") {
      console.log("Not implemented");
    }
  },
  qtyProduct: async (_, setView, productCode) => {
    console.log("=== CHANGE QUANTITY ===");
    console.log("Current product:", productCode);
    console.log("Current quantity: ${QUANTITY}");
    console.log(
      "Input the amount to change (can be a positive or negative integer):",
    );
    console.log("Type 0 to go back");
    const ch = await input();
    if (ch === "0") {
      setView("viewProducts");
    } else {
      console.log("Not implemented");
    }
  },
  manageDiscounts: async (_, setView) => {
    console.log("=== MANAGE DISCOUNTS ===");
    console.log("1. List discounts");
    console.log("2. Add a new discount");
    console.log("0. Go back");
    const ch = await input();
    if (ch === "1") {
      setView("listDiscounts");
    } else if (ch === "2") {
      setView("addDiscount");
    } else if (ch === "0") {
      setView("main");
    }
  },
  listDiscounts: async (_, setView) => {
    console.log("=== DISCOUNTS ===");
    console.log(
      "To see a discounts history, type 'history' followed by the discount code",
    );
    console.log("Type 0 to go back");
    console.log("\n${DISCOUNT_LIST}");
    const ch = await input();
    if (ch.split(" ")[0] === "history" && ch.split(" ")[1]) {
      const discountCode = ch.split(" ")[1];
      setView("discountHistory", discountCode);
    } else if (ch === "0") {
      setView("manageDiscounts");
    }
  },
  discountHistory: async (_, setView, discountCode) => {
    console.log(`=== DISCOUNT HISTORY ===`);
    console.log("Current discount:", discountCode);
    console.log("Type 0 to go back");
    console.log("\n${DISCOUNT_HISTORY}");
    const ch = await input();
    if (ch === "0") {
      setView("listDiscounts");
    }
  },
  addDiscount: async (_, setView) => {
    console.log("=== NEW DISCOUNT ===");
    console.log(
      "Type the discount name with the percentage amount separated by a colon (:)",
    );
    console.log("Percentage must be between 1 and 100");
    console.log("Example: BLACKFRIDAY:75");
    console.log("Type 0 to got back");
    const ch = await input();
    if (ch.indexOf(":") !== -1) {
      const name = ch.split(":")[0];
      const amount = ch.split(":")[1];
      if (name && amount) {
        // SQL ADD DISCOUNT
      }
    } else if (ch === "0") {
      setView("manageDiscounts");
    }
  },
  manageSuppliers: async (_, setView) => {
    console.log("=== MANAGE SUPPLIERS ===");
    console.log("1. Add new supplier");
    console.log("2. List suppliers");
    console.log("0. Go back");
    const ch = await input();

    if (ch === "1") {
      setView("addSupplier");
    } else if (ch === "2") {
      setView("viewSuppliers");
    } else if (ch === "0") {
      setView("main");
    }
  },
  addSupplier: async (_, setView) => {
    console.log("=== ADD SUPPLIER ===");
    console.log("Type 0 at any time to cancel the registration process");

    console.log("Input supplier name:");
    const name = await input();
    if (name === "0") {
      setView("manageSuppliers");
      return;
    }

    console.log("Input their phone number (10 characters):");
    const phone = await input();
    if (phone === "0") {
      setView("manageSuppliers");
      return;
    }

    console.log("Input their address:");
    const address = await input();
    if (address === "0") {
      setView("manageSuppliers");
      return;
    }

    console.log("Input their city:");
    const city = await input();
    if (city === "0") {
      setView("manageSuppliers");
      return;
    }

    console.log("Input their country:");
    const country = await input();
    if (country === "0") {
      setView("manageSuppliers");
      return;
    }

    const newSupplier = {
      name,
      phone,
      address,
      city,
      country,
    };

    // SQL QUERY
    console.log("Not implemented");
  },
  viewSuppliers: async (_, setView) => {
    console.log("=== SUPPLIERS ===");
    console.log(
      "Type 'add' followed by the supplier name to add a product to that supplier",
    );
    console.log("Type 0 to go back");
    console.log("\n${SUPPLIER_LIST}");
    const ch = await input();
    if (ch === "0") {
      setView("manageSuppliers");
    } else if (ch.split(" ")[0] === "add" && ch.split(" ")[1]) {
      setView("addProductToSupplier", {
        supplierName: ch.split(" ")[1],
        filters: null,
      });
    }
  },
  addProductToSupplier: async (_, setView, { supplierName, filters }) => {
    console.log("=== ADD PRODUCT TO SUPPLIER ===");
    console.log("Selected supplier:", supplierName);
    console.log("Type the code of the product you want to add");
    console.log(
      "\nTo filter for products, type 'search' followed by the filter type and its value separated with a colon (:)",
    );
    console.log("Filters are separated by a comma");
    console.log("Do not use any spaces in your filter list");
    console.log("Available filters: code, name, supplier, minprice, maxprice");
    console.log("Example: name:harddrive,minprice:12.00");
    if (filters && filters.length > 0) {
      console.log("[ACTIVE FILTERS]");
      for (const { name, value } of filters) {
        console.log(`${name}: ${value}`);
      }
    }
    console.log("Type 0 to go back");

    console.log("${PRODUCT_LIST}");
    const ch = await input();
    if (ch === "0") {
      setView("viewSuppliers");
    } else if (ch) {
      console.log("Not implemented");
    }
  },
  confirmOrders: async (_, setView) => {
    console.log("=== CONFIRM ORDERS ===");
    console.log("Type 'confirm' followed by the order id to confirm an order");
    console.log("Type 0 to go back");
    console.log("\n${UNCOMFIRMED_ORDER_LIST}");
    let ch = await input();
    if (ch === "0") {
      setView("main");
    }
    ch = ch.split(" ");
    if (ch[0] === "confirm" && ch[1]) {
      console.log("Not implemented");
    }
  },
};
