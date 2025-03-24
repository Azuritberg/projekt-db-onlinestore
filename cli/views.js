import { input } from "./utils.js";
import { sql } from "./main.js";
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
      setView("customerStart");
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
  customerLogin: async (session, setView) => {
    console.log("=== CUSTOMER LOGIN ===");
    console.log("Input your email and password separated by a semicolon (:)");
    console.log("Example: email:password");
    console.log("Type 0 to cancel the log in");

    const ch = await input();
    if (ch === "0") {
      setView("customer");
      return;
    }

    if (!ch.includes(":")) {
      console.log("Invalid format. Try again.");
      return;
    }

    const credentials = ch.split(":");
    if (!credentials[0] || !credentials[1]) {
      console.log("Invalid input. Try again.");
      return;
    }

    const res = await sql`
    SELECT customer_mail_address, customer_password FROM Customer WHERE customer_mail_address = ${credentials[0]};
  `;

    if (!res.length) {
      console.log("Wrong username/password");
      console.log("Press enter to try again");
      await input();
      return;
    }

    const user = res[0];
    if (!(await bcrypt.compare(credentials[1], user["customer_password"]))) {
      console.log("Wrong username/password");
      console.log("Press enter to try again");
      await input();
      return;
    }

    session.user = user["customer_mail_address"];
    session.revokeAdmin();
    setView("main");
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

    console.log("Input your phone:");
    const phone = await input();
    if (phone === "0") {
      setView("customerStart");
      return;
    }

    const nc = {
      email,
      password: await bcrypt.hash(password),
      fName,
      lName,
      address,
      city,
      country,
      phone,
    };

    const res = await sql`SELECT register_customer(
        ${nc.email},
        ${nc.password},
        ${nc.fName},
        ${nc.lName},
        ${nc.address},
        ${nc.city},
        ${nc.country},
        ${nc.phone}
    ) AS message;`;

    console.log(res[0].message);
    console.log("Press enter to confirm");
    await input();
    setView("customerLogin");
  },
  main: async (session, setView) => {
    console.log(
      "Logged in as: " + (session.isAdmin() ? "Admin" : session.user),
    );
    if (!session.isAdmin()) {
      console.log("To view your cart, type 'cart'");
      console.log("To view your orders, type 'orders'");
    }
    console.log("1. View products");
    if (session.isAdmin()) {
      console.log("2. Manage Discounts");
      console.log("3. Manage Suppliers");
      console.log("4. Confirm Orders");
    }
    console.log("0. Exit");
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
      session.logOut();
      setView("start");
    }
  },
  cart: async (session, setView) => {
    console.log("=== CART ===");
    console.log(
      "To increase/decrease the quantity of a product in your cart, type its index followed by a + or - and the amount",
    );
    console.log(
      "Example: 2 + 4 would increase the product quantity of the second product by four",
    );
    console.log("To remove a product, type delete followed by its index");
    console.log("Example: delete 2");
    console.log("Type 0 to go back");

    if (!session.cart.length) {
      console.log("Your cart is empty");
    } else if (session.cart.length) {
      for (let i = 0; i < session.cart.length; i++) {
        const { code, name, supplier, price, discount_amount, quantity } =
          session.cart[i];
        if (discount_amount) {
          console.log(
            `[${code}] ${name} - ${supplier} ${(price * (1 - discount_amount / 100)).toFixed(2)} (${quantity}pcs)`,
          );
        } else {
          console.log(
            `[${code}] ${name} - ${supplier} ${price / 100}$ (${quantity}pcs)`,
          );
        }
      }
    }

    let ch = await input();
    if (ch === "0") {
      setView("main");
    } else {
      ch = ch.split(" ");
      if (ch[0] === "delete" && ch[1] && ch[1] >= 0) {
        session.removeFromCart(ch[1]);
        setView("cart");
      } else if (ch.indexOf("+") !== -1 && ch[0] !== "+" && ch[2]) {
        const idx = ch[0];
        const amount = ch[2];
      } else if (ch.indexOf("-") !== -1 && ch[0] !== "-" && ch[2]) {
        const idx = ch[0];
        const amount = ch[2];
      }
    }
  },
  orders: async (_, setView) => {},
  viewProducts: async (session, setView, data) => {
    let filters = [];
    let page = 0;

    if (data && data.filters) {
      filters = data.filters;
    }

    if (data && data.page) {
      page = data.page;
    }

    console.log("=== PRODUCTS ===");
    console.log("Current page: ", page + 1);
    console.log("Type [n]ext/[p]rev to change page");
    if (session.isAdmin()) {
      console.log("Type 'discount' followed by the index to add a discount");
      console.log("Type 'delete' followed by the index to delete a product");
      console.log(
        "Type 'qty' followed by the index to change the quantity of a product",
      );
    }

    if (!session.isAdmin()) {
      console.log(
        "Type 'add' followed by the index (first number) and a quantity to add a product to your cart. Index and quantity should be separated with a semicolon (:)",
      );
      console.log("Example: add 23:2");
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

    const res = await sql`
      SELECT sp.id as idx,
      sp.supplier_name as supplier,
      sp.product_code as code,
      sp.product_price as price,
      sp.product_quantity as quantity,
      p.product_name as name
      FROM supplier_product sp JOIN product p ON sp.product_code = p.product_code
      ORDER BY sp.id
      LIMIT 20
      OFFSET ${20 * page};
    `;

    for (const { idx, supplier, code, price, quantity, name } of res) {
      console.log(
        `${idx}. [${code}] ${name} - ${supplier} ${price / 100}$ (${quantity} in stock)`,
      );
    }
    let ch = await input();
    if (ch === "0") {
      setView("main");
    } else if (ch === "n" || ch === "next") {
      setView("viewProducts", { filters, page: page + 1 });
    } else if (ch === "p" || ch === "prev") {
      setView("viewProducts", { filters, page: page - 1 < 0 ? 0 : page - 1 });
    }

    ch = ch.split(" ");

    if (ch[0] === "search" && ch[1]) {
      const _f = ch[1].split(",");
      const f = [];
      for (const e of _f) {
        f.push({ name: e.split(":")[0], value: e.split(":")[1] });
      }
      setView("viewProducts", { filters: f });
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
        const product_code = ch[1];
        const qty = ch[2];
      }
    }
  },
  applyDiscount: async (_, setView, idx) => {
    console.log("=== APPLY DISCOUNT ===");
    const res =
      await sql`SELECT * from supplier_product sp JOIN product p ON sp.product_code = p.product_code WHERE id = ${idx}`;
    if (res.length) {
      console.log(
        `Selected product: [${res[0].product_code}] ${res[0].product_name} - ${res[0].supplier_name}`,
      );
      console.log(
        "Separated by colons (:), Input the name, start date and end date of the discount you want to apply to product ${PRODUCT_NAME}",
      );
      console.log("Date must be formatted like YYYYMMDD");
      console.log("Example: XMAS:20251201:20251231");
      console.log("Type 0 to go back");
      console.log("\n[Discount name - discount amount]");
      const d = await sql`SELECT * FROM discount;`;
      for (const { discount_code, discount_amount } of d) {
        console.log(`${discount_code} - ${discount_amount}%`);
      }
    } else {
      console.log("Could not find product with index", idx);
    }
    let ch = await input();

    if (ch === "0") {
      setView("viewProducts");
    }

    if (res.length) {
      ch = ch.split(":");
      if (ch.length === 3) {
      }
    }
  },
  deleteProduct: async (_, setView, idx) => {
    console.log("=== DELETE PRODUCT ===");
    const res =
      await sql`SELECT * from supplier_product sp JOIN product p ON sp.product_code = p.product_code WHERE id = ${idx}`;
    if (res.length) {
      console.log(
        `Selected product: [${res[0].product_code}] ${res[0].product_name} - ${res[0].supplier_name}`,
      );
      console.log("Delete it?");
      console.log("[y]es/[n]o?");
    } else {
      console.log("Could not find product with index", idx);
    }
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
  qtyProduct: async (_, setView, idx) => {
    console.log("=== CHANGE QUANTITY ===");
    const res =
      await sql`SELECT * from supplier_product sp JOIN product p ON sp.product_code = p.product_code WHERE id = ${idx}`;
    if (res.length) {
      console.log(
        `Selected product: [${res[0].product_code}] ${res[0].product_name} - ${res[0].supplier_name}`,
      );
      console.log(`Current quantity: ${res[0].product_quantity}`);
    } else {
      console.log("Could not find product with index", idx);
    }
    console.log(
      "Input the amount to change (can be a positive or negative integer):",
    );
    console.log("Example: -5");
    console.log("Type 0 to go back");
    let ch = await input();
    if (ch === "0") {
      setView("viewProducts");
    } else if (ch[0] === "+" || (ch[0] === "-" && ch.length >= 2)) {
      const res =
        await sql`SELECT update_supplier_product_quantity(${idx}, ${ch}) AS message`;
      console.log(res[0].message);
      console.log("Press any key to continue");
      await input();
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
    console.log("Type 0 to go back\n");
    console.log("[Discount name - discount amount]");
    const res = await sql`SELECT * FROM discount;`;
    for (const { discount_code, discount_amount } of res) {
      console.log(`${discount_code} - ${discount_amount}%`);
    }
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

    const res = await sql`
    SELECT 
      pd.product_code,
      p.product_name,
      d.discount_amount,
      sp.product_price,
      pd.discount_date_start,
      pd.discount_date_end
    FROM 
      product_discount pd 
    JOIN 
      discount d ON pd.discount_code = d.discount_code 
    JOIN 
      product p ON p.product_code = pd.product_code 
    JOIN
      supplier_product sp ON p.product_code = sp.product_code
    WHERE 
      pd.discount_code = ${discountCode};
  `;

    if (res.length) {
      const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}${month}${day}`;
      };

      for (const e of res) {
        const startDate = formatDate(e.discount_date_start);
        const endDate = formatDate(e.discount_date_end);
        const price = e.product_price / 100;
        console.log(
          `[${e.product_code}] ${e.product_name} - ${(price * (1 - e.discount_amount / 100)).toFixed(2)} (${e.discount_amount}% off) (${startDate} - ${endDate})`,
        );
      }
    } else {
      console.log("No history found");
    }

    let ch = await input();
    if (ch === "0") {
      setView("listDiscounts");
      return;
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
      const discountCode = ch.split(":")[0];
      const discountAmount = ch.split(":")[1];
      if (discountCode && discountAmount) {
        const res = await sql`
  SELECT add_discount(${discountCode}, ${discountAmount}) AS message;
`;

        console.log(res[0].message);
        await input();
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

    const ns = {
      name,
      phone,
      address,
      city,
      country,
    };

    const res = await sql`
  SELECT register_supplier(${ns.name}, ${ns.phone}, ${ns.address}, ${ns.city}, ${ns.country}) AS message;
`;

    console.log(res[0].message);
    await input();

    console.log("Not implemented");
  },
  viewSuppliers: async (_, setView, page = 0) => {
    console.log("=== SUPPLIERS ===");
    console.log("Current page: ", page + 1);
    console.log("Type [n]ext/[p]rev to change page");
    console.log(
      "Type 'add' followed by the supplier name to add a product to that supplier",
    );
    console.log("Type 0 to go back");
    const res = await sql`SELECT * FROM supplier LIMIT 20 OFFSET ${20 * page};`;
    for (const {
      supplier_name,
      supplier_phone_number,
      supplier_address,
      supplier_city,
      supplier_country,
    } of res) {
      console.log(
        `${supplier_name} - ${supplier_address}, ${supplier_city}, ${supplier_country} (${supplier_phone_number})`,
      );
    }
    let ch = await input();
    if (ch === "0") {
      setView("manageSuppliers");
    } else if (ch === "n" || ch === "next") {
      setView("viewSuppliers", page + 1);
      return;
    } else if (ch === "p" || ch === "prev") {
      setView("viewSuppliers", page - 1 < 0 ? 0 : page - 1);
      return;
    }

    ch = ch.split(" ");
    if (ch[0] === "add" && ch[1]) {
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
