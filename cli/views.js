import { input, print } from "./utils.js";
import { sql } from "./main.js";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

export const views = {
  start: async (session, setView) => {
    print("Select an option by typing its number and pressing Enter", "info");
    print("1 Admin");
    print("2 Customer");
    print("0 Quit");
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
    print("Customer Portal", "h2");
    print("1 Log in");
    print("2 Register");
    print("0 Go back");

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
    print("Customer Log in", "h2");
    print("Input your email and password separated by a semicolon", "info");
    print("Example: name@mail.com:password", "info");
    print("0 Cancel");

    let ch = await input();
    if (ch === "0") {
      setView("customerStart");
    } else {
      if (!ch.includes(":")) {
        print(
          "Invalid input. Make sure your input follows the expected format",
          "error",
        );
        await input();
        return;
      }

      ch = ch.split(":");
      if (ch.length < 2) {
        console.log(ch.length);
        print(
          "Invalid input. Make sure your input follows the expected format",
          "error",
        );
        await input();
        return;
      }

      const res = await sql`
    SELECT customer_mail_address, customer_password FROM Customer WHERE customer_mail_address = ${ch[0]};
  `;
      if (!res.length) {
        print("Wrong username or password\nPress enter to try again", "error");
        await input();
        return;
      }

      const user = res[0];
      if (!(await bcrypt.compare(ch[1], user["customer_password"]))) {
        print("Wrong username or password\nPress enter to try again", "error");
        await input();
        return;
      }

      session.user = user["customer_mail_address"];
      session.revokeAdmin();
      setView("main");
    }
  },
  customerRegister: async (_, setView) => {
    print("Customer Register", "h2");
    print("0 Cancel");

    print("Enter your email:", "interactive");
    const email = await input();
    if (email === "0") {
      setView("customerStart");
      return;
    }

    print("Enter your password:", "interactive");
    const password = await input();
    if (password === "0") {
      setView("customerStart");
      return;
    }

    print("Enter your first name:", "interactive");
    const fName = await input();
    if (fName === "0") {
      setView("customerStart");
      return;
    }

    print("Enter your last name:", "interactive");
    const lName = await input();
    if (lName === "0") {
      setView("customerStart");
      return;
    }

    print("Enter your address:", "interactive");
    const address = await input();
    if (address === "0") {
      setView("customerStart");
      return;
    }

    print("Enter your city:", "interactive");
    const city = await input();
    if (city === "0") {
      setView("customerStart");
      return;
    }

    print("Enter your country:", "interactive");
    const country = await input();
    if (country === "0") {
      setView("customerStart");
      return;
    }

    print("Enter your phone:", "interactive");
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

    const msg = await sql`SELECT register_customer(
        ${nc.email},
        ${nc.password},
        ${nc.fName},
        ${nc.lName},
        ${nc.address},
        ${nc.city},
        ${nc.country},
        ${nc.phone}
    ) AS message;`;

    print(msg[0].message, "msg");
    await input();
    setView("customerStart");
  },
  main: async (session, setView) => {
    print("Main menu", "h2");
    print(
      "Logged in as: " +
        (session.isAdmin() ? "Admin" : (session.user ?? "unknown")),
      "msg",
    );

    if (!session.isAdmin()) {
      print("cart View your cart");
      print("orders View your orders");
    }
    print("sale View products currently on sale");
    print("1 View products");
    if (session.isAdmin()) {
      print("2 Manage discounts");
      print("3 Manage suppliers");
      print("4 Confirm orders");
    }

    print("0 Go back");
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
    } else if (ch === "sale") {
      setView("viewSales");
    } else {
      print(
        "Invalid input. Make sure your input follows the expected format",
        "error",
      );
    }
  },
  cart: async (session, setView) => {
    print("Cart", "h2");
    print(
      "To change the quantity of a product in your cart, type its index followed by the amount you want to change",
      "info",
    );
    print("Example: 2+4", "info");
    print("To remove a product, type 'delete' followed by its index", "info");
    print("To place your order, type 'place'", "info");
    print("0 Go back");

    const res = await sql`
  SELECT p.product_name,
         cart.product_supplier_name,
         cart.product_quantity,
         sp.product_price,
         (sp.product_price * cart.product_quantity) AS price,
         sp.id AS idx,
         COALESCE(MAX(d.discount_amount), 0) AS discount,  -- Highest discount percentage
         COUNT(d.discount_code) AS discount_count  -- Number of active discounts
  FROM get_or_create_cart(${session.user}) AS cart
  JOIN supplier_product sp 
    ON cart.product_code = sp.product_code 
    AND cart.product_supplier_name = sp.supplier_name 
  JOIN product p 
    ON p.product_code = sp.product_code
  LEFT JOIN product_discount pd 
    ON sp.product_code = pd.product_code 
    AND pd.discount_date_start <= NOW() 
    AND pd.discount_date_end >= NOW()
  LEFT JOIN discount d 
    ON pd.discount_code = d.discount_code
  GROUP BY sp.id, sp.supplier_name, sp.product_code, sp.product_price, sp.product_quantity, p.product_name, cart.product_quantity, cart.product_supplier_name
  ORDER BY sp.id`;

    if (!res.length || !res[0].product_name) {
      console.log("Cart is empty");
    } else {
      print(
        "Index | Supplier | Product | Qty | Price | Discount | Final Price",
        "msg",
      );
      for (const product of res) {
        const discountNotice =
          product.discount_count > 0
            ? `(${product.discount_count} discounts applied)`
            : "";
        const finalPrice = product.price * (1 - product.discount / 100); // Apply discount

        console.log(
          `${product.idx} | ${product.product_supplier_name} | ${product.product_name} | ${product.product_quantity}pcs | ${(product.price / 100).toFixed(2)}$ | ${product.discount}% ${discountNotice} | ${(finalPrice / 100).toFixed(2)}$`,
        );
      }
    }
    //  const res = await sql`select p.product_name,
    //    cart.product_supplier_name,
    //    cart.product_quantity,
    //    sp.product_price,
    //    (sp.product_price * cart.product_quantity) as price,
    //    sp.id as idx from get_or_create_cart(${session.user}) as cart
    //    JOIN supplier_product sp
    //    ON cart.product_code = sp.product_code
    //    AND cart.product_supplier_name = sp.supplier_name
    //    JOIN product p
    //    ON p.product_code = sp.product_code;
    //`;
    //  //
    //  // TODO: APPLY DISCOUNTS
    //  //
    //  if (!res.length || !res[0].product_name) {
    //    console.log("Cart is empty");
    //  } else {
    //    print("Index | Supplier | Product | Qty | Price", "msg");
    //    for (const product of res) {
    //      console.log(
    //        `${product.idx} | ${product.product_supplier_name} | ${product.product_name} | ${product.product_quantity}pcs | ${product.price / 100}$`,
    //      );
    //    }
    //  }

    let ch = await input();
    if (ch === "0") {
      setView("main");
    } else if (ch === "place") {
      if (res.length && res[0].product_name) {
        const msg = await sql`UPDATE customer_order
          SET order_state = 'placed'
          WHERE order_state = 'shopping'
          AND customer_mail_address = ${session.user}
        `;
        if (msg.count) {
          print("Your order has been successfully placed", "msg");
          await input();
        } else {
          print("Could not place your order", "error");
          await input();
        }
      } else {
        print("Cannot place order with empty cart", "error");
        await input();
      }
    } else {
      // TODO: CHECK INDEXOF + OR - HERE INSTEAD
      if (ch.indexOf("+") !== -1) {
        ch = ch.split("+");
        if (ch[0] && ch[1]) {
          const idx = ch[0];
          const amount = ch[1];
          const msg =
            await sql`SELECT modify_cart_quantity(${session.user}, ${idx}, ${amount}) AS message`;
          print(msg[0].message, "msg");
          await input();
        } else {
          print(
            "Invalid input. Make sure your input follows the expected format",
            "error",
          );
          await input();
        }
      } else if (ch.indexOf("-") !== -1) {
        ch = ch.split("-");
        if (ch[0] && ch[1]) {
          const idx = ch[0];
          const amount = -ch[1];
          const msg =
            await sql`SELECT modify_cart_quantity(${session.user}, ${idx}, ${amount}) AS message`;
          print(msg[0].message, "msg");
          await input();
        } else {
          print(
            "Invalid input. Make sure your input follows the expected format",
            "error",
          );
          await input();
        }
      } else {
        ch = ch.split(" ");
        if (ch[0] === "delete" && ch[1]) {
          const idx = ch[1];
          const msg =
            await sql`SELECT remove_product_from_cart(${session.user}, ${idx}) AS message`;
          print(msg[0].message, "msg");
          await input();
        } else {
          print(
            "Invalid input. Make sure your input follows the expected format",
            "error",
          );
          await input();
        }
      }
    }
  },
  orders: async (session, setView) => {
    print("Orders", "h2");
    print("To view an order, type 'view' followed by the order id", "info");
    print(
      "To cancel an unconfirmed order, type 'cancel' followed by the order id",
      "info",
    );
    print("0 Go back");
    const res = await sql`
      SELECT * FROM Customer_Order WHERE customer_mail_address = ${session.user};
`;
    if (!res.length) {
      console.log("No orders found");
    } else {
      print("Order state | Order ID | Order date", "msg");
      for (const order of res) {
        console.log(
          `${order.order_state} | ${order.order_id} | ${order.order_date}`,
        );
      }
    }

    let ch = await input();
    if (ch === "0") {
      setView("main");
    } else {
      ch = ch.split(" ");
      if (ch[0] === "view" && ch[1]) {
        setView("viewOrder", ch[1]);
      } else if (ch[0] === "cancel" && ch[1]) {
        const msg = await sql`SELECT cancel_order(${ch[1]}) as message`;
        console.log(msg[0].message);
        await input();
      } else {
        print(
          "Invalid input. Make sure your input follows the expected format",
          "error",
        );
      }
    }
  },
  viewOrder: async (_, setView, id) => {
    const res =
      await sql`SELECT p.product_name, si.product_supplier_name, si.product_quantity, co.order_date, co.order_state FROM customer_order co JOIN customer_product_shopping_item si ON co.order_id = si.order_id JOIN product p ON si.product_code = p.product_code WHERE co.order_id = ${id}`;
    if (res.length) {
    } else {
      print("Could not find order", "error");
    }
    print(`Viewing order: ${id}`, "msg");
    print(`Order state: ${res[0].order_state}`, "msg");
    print(`Order placed ${res[0].order_date}`, "msg");
    print("0 Go back");
    //
    // TODO: ADD PRICE
    //
    print("Supplier | Product | Qty | Price");
    for (const product of res) {
      console.log(
        `${product.product_supplier_name} | ${product.product_name} | ${product.product_quantity}pcs | PRICE`,
      );
    }

    const ch = await input();
    if (ch === 0) {
      setView("orders");
    } else {
      print(
        "Invalid input. Make sure your input follows the expected format",
        "error",
      );
    }
  },
  viewSales: async (session, setView, data) => {
    let filters = [];
    let page = 0;

    if (data && data.filters) {
      filters = data.filters;
    }

    if (data && data.page) {
      page = data.page;
    }

    print("Products", "h2");
    print(`Current page: ${page + 1}`, "msg");
    print("[n]ext Next page");
    print("[p]rev Previous page");
    print("0 Go back");

    if (session.isAdmin()) {
      print(
        "To create a new product, type 'create' followed by its name separated by a colon",
        "info",
      );
      print("Example: create memory module", "info");
      print(
        "To add a discount to a product, type 'discount' followed by the products index",
        "info",
      );
      print(
        "To delete a product, type 'delete' followed by the products index",
        "info",
      );
      print(
        "To change the quantity of a product, type 'qty' followed by the products index",
        "info",
      );
    } else {
      print(
        "To add a product to your cart, type 'add' followed by the products index and the quantity you want to add separated by a colon",
        "info",
      );
      print("Example: add 23:2", "info");
    }

    print(
      "To filter for products, type 'search' followed by the filters separated by comma",
      "info",
    );
    print("Example: search name:harddrive,minprice:12.00", "info");
    print(
      "Available filters: code, name, supplier, minprice, maxprice",
      "info",
    );

    if (filters.length > 0) {
      print("Currently applied filters:", "interactive");
      for (const { name, value } of filters) {
        console.log(`${name}: ${value}`);
      }
    }

    // Build dynamic filtering conditions
    let whereClauses = sql``;
    if (filters.length > 0) {
      whereClauses = sql`WHERE `;
      filters.forEach((filter, index) => {
        const filterClause = sql`
        ${
          filter.name === "code"
            ? sql`sp.product_code::TEXT ILIKE ${"%" + filter.value + "%"}`
            : filter.name === "name"
              ? sql`p.product_name ILIKE ${"%" + filter.value + "%"}`
              : filter.name === "supplier"
                ? sql`sp.supplier_name ILIKE ${"%" + filter.value + "%"}`
                : filter.name === "minprice"
                  ? sql`sp.product_price >= ${parseFloat(filter.value) * 100}`
                  : filter.name === "maxprice"
                    ? sql`sp.product_price <= ${parseFloat(filter.value) * 100}`
                    : sql``
        }
      `;

        if (index > 0) {
          whereClauses = sql`${whereClauses} AND ${filterClause}`;
        } else {
          whereClauses = sql`${whereClauses} ${filterClause}`;
        }
      });
    }

    const res = await sql`
  SELECT sp.id as idx,
         sp.supplier_name as supplier,
         sp.product_code as code,
         sp.product_price as price,  -- Original price in cents
         sp.product_quantity as quantity,
         p.product_name as name,
         COALESCE(MAX(d.discount_amount), 0) AS discount,  -- Highest discount percentage
         COUNT(d.discount_code) AS discount_count  -- Number of active discounts
  FROM supplier_product sp
  JOIN product p ON sp.product_code = p.product_code
  LEFT JOIN product_discount pd ON sp.product_code = pd.product_code 
    AND pd.discount_date_start <= NOW() 
    AND pd.discount_date_end >= NOW()
  LEFT JOIN discount d ON pd.discount_code = d.discount_code
  ${whereClauses}
  GROUP BY sp.id, sp.supplier_name, sp.product_code, sp.product_price, sp.product_quantity, p.product_name
  HAVING COUNT(d.discount_code) > 0  -- Only include products with active discounts
  ORDER BY sp.id
  LIMIT 20 OFFSET ${20 * page}
`;

    print(
      "Index | Code | Supplier | Name | Stock | Price | Discount | Final Price",
      "msg",
    );

    for (const {
      idx,
      supplier,
      code,
      price,
      quantity,
      name,
      discount,
      discount_count,
    } of res) {
      const discountNotice =
        discount_count > 0 ? `(${discount_count} discounts applied)` : "";
      const finalPrice = price * (1 - discount / 100); // Apply percentage discount

      console.log(
        `${idx} | ${code} | ${supplier} | ${name} | ${quantity}pcs | ${(price / 100).toFixed(2)}$ | ${discount}% ${discountNotice} | ${(finalPrice / 100).toFixed(2)}$`,
      );
    }
    // Handle user input
    let ch = await input();
    if (ch === "0") {
      setView("main");
    } else if (ch === "n" || ch === "next") {
      setView("viewProducts", { filters, page: page + 1 });
    } else if (ch === "p" || ch === "prev") {
      setView("viewProducts", { filters, page: Math.max(0, page - 1) });
    }

    ch = ch.split(" ");

    if (ch[0] === "search" && ch[1]) {
      const _f = ch[1].split(",");
      const f = [];
      for (const e of _f) {
        const [key, value] = e.split(":");
        if (value) {
          f.push({ name: key, value });
        }
      }
      setView("viewProducts", { filters: f, page: 0 });
    }

    if (session.isAdmin()) {
      if (ch[0] === "discount" && ch[1]) {
        setView("applyDiscount", ch[1]);
      } else if (ch[0] === "delete" && ch[1]) {
        setView("deleteProduct", ch[1]);
      } else if (ch[0] === "qty" && ch[1]) {
        setView("qtyProduct", ch[1]);
      } else if (ch[0] === "create" && ch[1]) {
        const pName = ch.slice(1).join(" ");
        const msg =
          await sql`INSERT INTO product (product_name) VALUES (${pName})`;
        if (msg.count) {
          print("Product created", "msg");
          await input();
        } else {
          print("Could not create product", "error");
          await input();
        }
      }
    } else if (!session.isAdmin()) {
      if (ch[0] === "add" && ch[1]) {
        const [idx, qty] = ch[1].split(":");
        const msg =
          await sql`SELECT add_product_to_cart(${session.user}, ${idx}, ${qty}) AS message`;
        print(msg[0].message, "msg");
        await input();
        return;
      }
    }

    print(
      "Invalid input. Make sure your input follows the expected format",
      "error",
    );
  },
  viewProducts: async (session, setView, data) => {
    let filters = [];
    let page = 0;

    if (data && data.filters) {
      filters = data.filters;
    }

    if (data && data.page) {
      page = data.page;
    }

    print("Products", "h2");
    print(`Current page: ${page + 1}`, "msg");
    print("[n]ext Next page");
    print("[p]rev Previous page");
    print("0 Go back");

    if (session.isAdmin()) {
      print(
        "To create a new product, type 'create' followed by its name separated by a colon",
        "info",
      );
      print("Example: create memory module", "info");
      print(
        "To add a discount to a product, type 'discount' followed by the products index",
        "info",
      );
      print(
        "To delete a product, type 'delete' followed by the products index",
        "info",
      );
      print(
        "To change the quantity of a product, type 'qty' followed by the products index",
        "info",
      );
    } else {
      print(
        "To add a product to your cart, type 'add' followed by the products index and the quantity you want to add separated by a colon",
        "info",
      );
      print("Example: add 23:2", "info");
    }

    print(
      "To filter for products, type 'search' followed by the filters separated by comma",
      "info",
    );
    print("Example: search name:harddrive,minprice:12.00", "info");
    print(
      "Available filters: code, name, supplier, minprice, maxprice",
      "info",
    );

    if (filters.length > 0) {
      print("Currently applied filters:", "interactive");
      for (const { name, value } of filters) {
        console.log(`${name}: ${value}`);
      }
    }

    // Build dynamic filtering conditions
    let whereClauses = sql``;
    if (filters.length > 0) {
      whereClauses = sql`WHERE `;
      filters.forEach((filter, index) => {
        const filterClause = sql`
        ${
          filter.name === "code"
            ? sql`sp.product_code::TEXT ILIKE ${"%" + filter.value + "%"}`
            : filter.name === "name"
              ? sql`p.product_name ILIKE ${"%" + filter.value + "%"}`
              : filter.name === "supplier"
                ? sql`sp.supplier_name ILIKE ${"%" + filter.value + "%"}`
                : filter.name === "minprice"
                  ? sql`sp.product_price >= ${parseFloat(filter.value) * 100}`
                  : filter.name === "maxprice"
                    ? sql`sp.product_price <= ${parseFloat(filter.value) * 100}`
                    : sql``
        }
      `;

        if (index > 0) {
          whereClauses = sql`${whereClauses} AND ${filterClause}`;
        } else {
          whereClauses = sql`${whereClauses} ${filterClause}`;
        }
      });
    }

    const res = await sql`
  SELECT sp.id as idx,
         sp.supplier_name as supplier,
         sp.product_code as code,
         sp.product_price as price,  -- Original price in cents
         sp.product_quantity as quantity,
         p.product_name as name,
         COALESCE(MAX(d.discount_amount), 0) AS discount,  -- Highest discount percentage
         COUNT(d.discount_code) AS discount_count  -- Number of active discounts
  FROM supplier_product sp
  JOIN product p ON sp.product_code = p.product_code
  LEFT JOIN product_discount pd ON sp.product_code = pd.product_code 
    AND pd.discount_date_start <= NOW() 
    AND pd.discount_date_end >= NOW()
  LEFT JOIN discount d ON pd.discount_code = d.discount_code
  ${whereClauses}
  GROUP BY sp.id, sp.supplier_name, sp.product_code, sp.product_price, sp.product_quantity, p.product_name
  ORDER BY sp.id
  LIMIT 20 OFFSET ${20 * page}
`;
    print(
      "Index | Code | Supplier | Name | Stock | Price | Discount | Final Price",
      "msg",
    );

    for (const {
      idx,
      supplier,
      code,
      price,
      quantity,
      name,
      discount,
      discount_count,
    } of res) {
      const discountNotice =
        discount_count > 0 ? `(${discount_count} discounts applied)` : "";
      const finalPrice = price * (1 - discount / 100); // Apply percentage discount

      console.log(
        `${idx} | ${code} | ${supplier} | ${name} | ${quantity}pcs | ${(price / 100).toFixed(2)}$ | ${discount}% ${discountNotice} | ${(finalPrice / 100).toFixed(2)}$`,
      );
    }
    // Handle user input
    let ch = await input();
    if (ch === "0") {
      setView("main");
    } else if (ch === "n" || ch === "next") {
      setView("viewProducts", { filters, page: page + 1 });
    } else if (ch === "p" || ch === "prev") {
      setView("viewProducts", { filters, page: Math.max(0, page - 1) });
    }

    ch = ch.split(" ");

    if (ch[0] === "search" && ch[1]) {
      const _f = ch[1].split(",");
      const f = [];
      for (const e of _f) {
        const [key, value] = e.split(":");
        if (value) {
          f.push({ name: key, value });
        }
      }
      setView("viewProducts", { filters: f, page: 0 });
    }

    if (session.isAdmin()) {
      if (ch[0] === "discount" && ch[1]) {
        setView("applyDiscount", ch[1]);
      } else if (ch[0] === "delete" && ch[1]) {
        setView("deleteProduct", ch[1]);
      } else if (ch[0] === "qty" && ch[1]) {
        setView("qtyProduct", ch[1]);
      } else if (ch[0] === "create" && ch[1]) {
        const pName = ch.slice(1).join(" ");
        const msg =
          await sql`INSERT INTO product (product_name) VALUES (${pName})`;
        if (msg.count) {
          print("Product created", "msg");
          await input();
        } else {
          print("Could not create product", "error");
          await input();
        }
      }
    } else if (!session.isAdmin()) {
      if (ch[0] === "add" && ch[1]) {
        const [idx, qty] = ch[1].split(":");
        const msg =
          await sql`SELECT add_product_to_cart(${session.user}, ${idx}, ${qty}) AS message`;
        print(msg[0].message, "msg");
        await input();
        return;
      }
    }

    print(
      "Invalid input. Make sure your input follows the expected format",
      "error",
    );
  },
  applyDiscount: async (_, setView, idx) => {
    print("Apply discount", "h2");
    print("0 Go back");
    const res =
      await sql`SELECT * from supplier_product sp JOIN product p ON sp.product_code = p.product_code WHERE id = ${idx}`;
    if (res.length) {
      print(`Selected product code: ${res[0].product_code}`, "msg");
      print(
        "To choose the discount to apply, input the name of the discount, followed by your desired start date and end date separated with colons",
        "info",
      );
      print("Dates must be formatted YYYY-MM-DD", "info");
      print("Example: XMAS:2025-12-02:20205-12-31", "info");
      print("Discount name | Discount amount", "msg");
      const d = await sql`SELECT * FROM discount;`;
      for (const { discount_code, discount_amount } of d) {
        console.log(`${discount_code} | ${discount_amount}%`);
      }
    } else {
      print(`Could not find product with index ${idx}`, "error");
      await input();
      setView("viewProducts");
    }

    let ch = await input();
    if (ch === "0") {
      setView("viewProducts");
    }

    if (res.length) {
      ch = ch.split(":");
      if (ch.length === 3) {
        const code = ch[0];
        const startDate = ch[1];
        const endDate = ch[2];
        const msg =
          await sql`SELECT apply_discount_to_product(${res[0].product_code}, ${code}, ${startDate}, ${endDate}) AS message`;
        print(msg[0].message, "msg");
        await input();
      }
    }
  },
  deleteProduct: async (_, setView, idx) => {
    print("Delete product", "h2");
    print("[y]es Delete product");
    print("[n]o Abort deletion");
    print("0 Go back");
    const res =
      await sql`SELECT * from supplier_product sp JOIN product p ON sp.product_code = p.product_code WHERE id = ${idx}`;
    if (res.length) {
      print(
        `Selected product: ${res[0].product_code} | ${res[0].supplier_name} | ${res[0].product_name}`,
        "msg",
      );
      print(
        "This will also remove the product from any pending orders and customer shopping carts that have not been confirmed",
        "info",
      );
    } else {
      print(`Could not find product with index ${idx}`, "error");
      await input();
      setView("viewProducts");
    }

    const ch = await input();
    if (ch === "0") {
      setView("viewProducts");
    } else if (ch === "y" || ch === "yes") {
      const msg =
        await sql`SELECT delete_product_from_supplier(${res[0].supplier_name}, ${res[0].product_code}) AS message`;
      print(msg[0].message, "msg");
      await input();
      setView("viewProducts");
    } else if (ch === "n" || ch === "no") {
      setView("viewProducts");
    } else {
      print(
        "Invalid input. Make sure your input follows the expected format",
        "error",
      );
      await input();
    }
  },
  qtyProduct: async (_, setView, idx) => {
    print("Change quantity", "h2");
    print("0 Go back");
    const res =
      await sql`SELECT * from supplier_product sp JOIN product p ON sp.product_code = p.product_code WHERE id = ${idx}`;
    if (res.length) {
      print(
        `Selected product: ${res[0].product_code} | ${res[0].supplier_name} | ${res[0].product_name}`,
        "msg",
      );
      print(`Current stock: ${res[0].product_quantity}`, "msg");
    } else {
      print(`Could not find product with index ${idx}`, "error");
      await input();
      setView("viewProducts");
    }
    print(
      "Input the amount (positive or negative integer) you wish to change the stock by",
      "info",
    );
    print("Example: -5", "info");
    let ch = await input();
    if (ch === "0") {
      setView("viewProducts");
    } else if (ch[0] === "+" || (ch[0] === "-" && ch.length >= 2)) {
      const msg =
        await sql`SELECT update_supplier_product_quantity(${idx}, ${ch}) AS message`;
      print(msg[0].message, "msg");
      console.log(msg[0].message);
      await input();
      setView("viewProducts");
    } else {
      print(
        "Invalid input. Make sure your input follows the expected format",
        "error",
      );
    }
  },
  manageDiscounts: async (_, setView) => {
    print("Manage discounts", "h2");
    print("1 List discounts");
    print("2 Add a new discount");
    print("0 Go back");
    const ch = await input();
    if (ch === "1") {
      setView("listDiscounts");
    } else if (ch === "2") {
      setView("addDiscount");
    } else if (ch === "0") {
      setView("main");
    } else {
      print(
        "Invalid input. Make sure your input follows the expected format",
        "error",
      );
    }
  },
  listDiscounts: async (_, setView) => {
    print("Discounts", "h2");
    print("0 Go back");
    print(
      "To see the history of a discount, type 'history' followed by the discount code",
      "info",
    );
    print("Discount name | Discount amount", "msg");
    const res = await sql`SELECT * FROM discount;`;
    for (const { discount_code, discount_amount } of res) {
      console.log(`${discount_code} | ${discount_amount}%`);
    }
    const ch = await input();
    if (ch.split(" ")[0] === "history" && ch.split(" ")[1]) {
      const discountCode = ch.split(" ")[1];
      setView("discountHistory", discountCode);
    } else if (ch === "0") {
      setView("manageDiscounts");
    } else {
      print(
        "Invalid input. Make sure your input follows the expected format",
        "error",
      );
    }
  },
  discountHistory: async (_, setView, discountCode) => {
    print("Discount history", "h2");
    print("0 Go back");
    print(`Current discount: ${discountCode}`, "msg");

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

      print(
        "Code | Product | Price after discount | Start date | End date",
        "msg",
      );
      for (const e of res) {
        const startDate = formatDate(e.discount_date_start);
        const endDate = formatDate(e.discount_date_end);
        const price = e.product_price / 100;
        console.log(
          `${e.product_code} | ${e.product_name} | ${(price * (1 - e.discount_amount / 100)).toFixed(2)} (${e.discount_amount}% off) | ${startDate} - ${endDate}`,
        );
      }
    } else {
      print("No history found", "error");
      await input();
      setView("listDiscounts");
    }

    let ch = await input();
    if (ch === "0") {
      setView("listDiscounts");
      return;
    } else {
      print(
        "Invalid input. Make sure your input follows the expected format",
        "error",
      );
    }
  },

  addDiscount: async (_, setView) => {
    print("Add new discount", "h2");
    print("0 Go back");
    print(
      "To add a new discount, type the name and the amount (1 - 100) separated by a colon",
      "info",
    );
    print("Example: BLACKFRIDAY:75", "info");
    const ch = await input();
    if (ch.indexOf(":") !== -1) {
      const discountCode = ch.split(":")[0];
      const discountAmount = ch.split(":")[1];
      if (discountCode && discountAmount) {
        const msg = await sql`
  SELECT add_discount(${discountCode}, ${discountAmount}) AS message;
`;

        print(msg[0].message, "msg");
        await input();
      }
    } else if (ch === "0") {
      setView("manageDiscounts");
    }
  },
  manageSuppliers: async (_, setView) => {
    print("Manage suppliers", "h2");
    print("1 Add new supplier");
    print("2 List suppliers");
    print("0 Go back");
    const ch = await input();

    if (ch === "1") {
      setView("addSupplier");
    } else if (ch === "2") {
      setView("viewSuppliers");
    } else if (ch === "0") {
      setView("main");
    } else {
      print(
        "Invalid input. Make sure your input follows the expected format",
        "error",
      );
    }
  },
  addSupplier: async (_, setView) => {
    print("Add new supplier", "h2");
    print("0 Go back");
    print("Enter supplier name:", "interactive");

    const name = await input();
    if (name === "0") {
      setView("manageSuppliers");
      return;
    }

    print("Enter supplier phone number:", "interactive");
    const phone = await input();
    if (phone === "0") {
      setView("manageSuppliers");
      return;
    }

    print("Enter supplier address:", "interactive");
    const address = await input();
    if (address === "0") {
      setView("manageSuppliers");
      return;
    }

    print("Enter supplier city:", "interactive");
    const city = await input();
    if (city === "0") {
      setView("manageSuppliers");
      return;
    }

    print("Enter supplier country:", "interactive");
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

    const msg = await sql`
  SELECT register_supplier(${ns.name}, ${ns.phone}, ${ns.address}, ${ns.city}, ${ns.country}) AS message;
`;

    print(msg[0].message, "msg");
    await input();
  },
  viewSuppliers: async (_, setView, page = 0) => {
    print("Suppliers", "h2");
    print("[n]ext Next page");
    print("[p]rev Previous page");
    print("0 Go back");
    print(`Current page: ${page + 1}`, "msg");
    print(
      "To add a product to a supplier, type 'add' followed by the supplier name",
      "info",
    );
    const res = await sql`SELECT * FROM supplier LIMIT 20 OFFSET ${20 * page};`;
    print("Name | Address | City | Country | Phone number", "msg");
    for (const {
      supplier_name,
      supplier_phone_number,
      supplier_address,
      supplier_city,
      supplier_country,
    } of res) {
      console.log(
        `${supplier_name} | ${supplier_address} | ${supplier_city} | ${supplier_country} | ${supplier_phone_number}`,
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
      const cName = ch.slice(1).join(" ");
      setView("addProductToSupplier", {
        supplierName: cName,
        filters: null,
      });
    } else {
      print(
        "Invalid input. Make sure your input follows the expected format",
        "error",
      );
    }
  },
  addProductToSupplier: async (
    _,
    setView,
    { supplierName, filters = [], page = 0 },
  ) => {
    filters = filters ?? [];
    page = page ?? 0;
    print("Add product to supplier", "h2");
    print(`Selected supplier: ${supplierName}`, "msg");
    print("[n]ext Next page");
    print("[p]rev Previous page");
    print("0 Go back");
    print(
      "Type the index of the product you want to add, followed by the price (in cents) and quantity separated with colons",
      "info",
    );
    print("Example: 2:1599:5", "info");
    print(
      "To filter for products, type 'search' followed by the filters separated by comma",
      "info",
    );
    print("Example: search name:harddrive", "info");
    print("Available filters: code, name", "info");

    if (filters.length > 0) {
      print("Currently applied filters:", "interactive");
      for (const { name, value } of filters) {
        console.log(`${name}: ${value}`);
      }
    }

    // Build dynamic filtering conditions
    let whereClauses = sql``;
    if (filters.length > 0) {
      whereClauses = sql`WHERE `;
      filters.forEach((filter, index) => {
        const filterClause = sql`
        ${
          filter.name === "code"
            ? sql`p.product_code::TEXT ILIKE ${"%" + filter.value + "%"}`
            : filter.name === "name"
              ? sql`p.product_name ILIKE ${"%" + filter.value + "%"}`
              : sql``
        }
      `;

        if (index > 0) {
          whereClauses = sql`${whereClauses} AND ${filterClause}`;
        } else {
          whereClauses = sql`${whereClauses} ${filterClause}`;
        }
      });
    }

    const res = await sql`
    SELECT p.product_code as code,
           p.product_name as name
    FROM product p 
    ${whereClauses}
    ORDER BY p.product_code
    LIMIT 20 OFFSET ${20 * page}
  `;

    print("Code | Name", "msg");
    for (const { code, name } of res) {
      console.log(`${code} | ${name}`);
    }

    let ch = await input();
    if (ch === "0") {
      setView("viewSuppliers");
    } else if (ch === "n" || ch === "next") {
      setView("addProductToSupplier", {
        supplierName,
        filters,
        page: page + 1,
      });
    } else if (ch === "p" || ch === "prev") {
      setView("addProductToSupplier", {
        supplierName,
        filters,
        page: Math.max(0, page - 1),
      });
    } else if (ch.indexOf("search") !== -1) {
      ch = ch.split(" ");
      if (ch[0] === "search" && ch[1]) {
        const _f = ch[1].split(",");
        const f = [];
        for (const e of _f) {
          const [key, value] = e.split(":");
          if (value) {
            f.push({ name: key, value });
          }
        }
        setView("addProductToSupplier", { supplierName, filters: f, page: 0 });
      }
    } else {
      ch = ch.split(":");
      if (ch[0] && ch[1] && ch[2]) {
        const idx = ch[0];
        const price = ch[1];
        const qty = ch[2];
        const productRes = await sql`
      SELECT product_code FROM supplier_product WHERE id = ${idx}
    `;

        if (productRes.length === 0) {
          print("Product not found", "error");
          return;
        }

        const productCode = productRes[0].product_code;
        const msg = await sql`
      INSERT INTO supplier_product (supplier_name, product_code, product_price, product_quantity) VALUES
      (${supplierName}, ${productCode}, ${price}, ${qty})
    `;
        if (msg.count) {
          print("Product successfully added to supplier", "msg");
          await input();
          setView("viewSuppliers");
        } else {
          print("Product could not be added to supplier", "error");
          await input();
          setView("viewSuppliers");
        }
      } else {
        print(
          "Invalid input. Make sure your input follows the expected format",
          "error",
        );
      }
    }
  },
  confirmOrders: async (_, setView) => {
    print("Confirm orders", "h2");
    print("0 Go back");
    print("To confirm an order, type 'confirm' followed by its ID", "info");
    const res =
      await sql`SELECT * FROM customer_order WHERE order_state = 'placed'`;
    print("Order ID | Customer | Date", "msg");
    for (const order of res) {
      console.log(
        `${order.order_id} | ${order.customer_mail_address} | ${order.order_date}`,
      );
    }
    let ch = await input();
    if (ch === "0") {
      setView("main");
    }
    ch = ch.split(" ");
    if (ch[0] === "confirm" && ch[1]) {
      const msg = await sql`SELECT confirm_order(${ch[1]}) AS message`;
      console.log(msg[0].message);
      await input();
    }
  },
};
