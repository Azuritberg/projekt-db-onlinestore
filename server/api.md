### **Admin Endpoints:**

1. **Suppliers:**
   - `POST /suppliers` – Add a new supplier.
   - `GET /suppliers` – Get all suppliers.
   - `GET /suppliers/{id}` – Get supplier details.
   - `PUT /suppliers/{id}` – Update a supplier.
   - `DELETE /suppliers/{id}` – Delete a supplier.

2. **Products:**
   - `POST /products` – Add a new product.
   - `GET /products` – Get all products.
   - `GET /products/{id}` – Get product details.
   - `PUT /products/{id}` – Edit product details.
   - `DELETE /products/{id}` – Delete a product.

3. **Discounts:**
   - `POST /discounts` – Add a new discount.
   - `GET /discounts` – Get all discounts.
   - `GET /discounts/{id}` – Get discount details.
   - `PUT /discounts/{id}` – Edit a discount.
   - `DELETE /discounts/{id}` – Delete a discount.

4. **Order Management:**
   - `GET /orders` – Get all orders.
   - `GET /orders/{id}` – Get order details.
   - `PUT /orders/{id}/confirm` – Confirm an order.
   - `GET /orders/monthly-top` – Get products with max orders each month.

### **Customer Endpoints:**

2. **Products:**
   - `GET /products` – Get all products.
   - `GET /products/{id}` – Get product details.
   - `GET /products/discounted` – Get discounted products.
   - `GET /products/search` – Search for products by code, name, supplier, or price.

3. **Orders:**
   - `POST /orders` – Place a new order.
   - `GET /orders/{id}` – Get order details.
   - `GET /orders` – Get a list of customer orders.
   - `DELETE /orders/{id}` – Delete an order (if not confirmed).

### **Stock Management:**
   - `POST /products/{id}/update-quantity` – Update product quantity.
   - `GET /products/{id}/quantity` – Get product quantity.

### **Discount Management:**
   - `GET /products/discounts` – Get discounts for products.
   - `GET /products/discount-history/{id}` – Get discount history for a product.
