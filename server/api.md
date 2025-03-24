# API 
## Products
GET /products - Returns all products
GET /products/${product_number} - Returns a specific product according to product number
GET /products?title=${title}&supplier=${supplier} etc. - Returns products after filters
POST (JSON) /products - Add a new product
    ```JSON{
        "product_number": pn,
        "title": title,
        "supplier": supplier,
        "price": price
        "qty": qty
        "discounts": []
    }```

PUT (JSON) /products/discounts/${product_number}
    ```JSON{
        [ {"discount_code": code, "from": date, "to": date} ]
    }```

PATCH (JSON) /products/quantity/${product_number}
    ```JSON{
       "add"/"remove": n 
    }```

DELETE /products/${product_number} - Deletes a product according to product number

## Orders
GET /orders - Returns all orders for the user (token via header)
GET /orders/all - Returns all orders (admin)
GET /orders/confirmed - Returns all confirmed orders (admin)
GET /orders/unconfirmed - Returns all unconfirmed orders ("placed") (admin)

POST (JSON) /orders - Place a new order
    ```JSON{
        "products": [ { "product_code", "product_supplier", "product_qty" } ]
    }```

PATCH /orders/${order_id} - Confirm order (as admin)
DELETE /orders/${order_id} - Delete/cancel an order (as the user)

## Discounts
GET /discounts - Returns all discounts
GET /discounts/${discount_code} - Get a specific discount according to code

POST (JSON) /discounts - Create a new discount
    ```JSON{
        "code": d_code, "amount": amount
    }```

## Suppliers
GET /suppliers - Return all suppliers
GET /suppliers/${supplier_name} - Return supplier according to their name
POST (JSON) /suppliers - Create a new supplier
    ```JSON{
        "supplier_name": name,
        "phone": phone,
        "address": address,
        "city": city,
        "country": country
    }```
