"use strict";


import { navigation } from "./navigation.js";


export function renderAdminProductPage() {
  document.body.innerHTML = "";

  const main = document.createElement("main");
  main.id = "adminProductPage";

  // == HEADER ==
  const titleContainer = document.createElement("div");
  titleContainer.className = "title-DB-container";

  const title = document.createElement("h1");
  title.innerHTML = `Admin <span>Products</span>`;

  const topLogout = document.createElement("div");
  topLogout.className = "top-button-logout";

  const logoutBtn = document.createElement("button");
  logoutBtn.className = "logout";
  logoutBtn.textContent = "Logout";


  //LOGOUT
  logoutBtn.addEventListener("click", async function () {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error("No token found, user is not logged in.");
      navigation.adminLogin();
      return;
    }

    try {
      const response = await fetch("/logout", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.status === 200) {
        console.log("Logout successful!");
        localStorage.removeItem('token');
        navigation.adminLogin();
      } else {
        console.error("Logout failed. Server status:", response.status);
      }

    } catch (error) {
      console.error("Error during logout:", error);
    }
  });


  const cartContainer = document.createElement("div");
  cartContainer.className = "cart-item";

  const cartText = document.createElement("div");
  cartText.className = "cart";
  cartText.textContent = "Cart";

  const cartCount = document.createElement("div");
  cartCount.className = "items-in-cart";
  cartCount.textContent = "0";

  cartContainer.appendChild(cartText);
  cartContainer.appendChild(cartCount);
  topLogout.appendChild(logoutBtn);
  topLogout.appendChild(cartContainer);
  titleContainer.appendChild(title);
  titleContainer.appendChild(topLogout);

  // == FORM ==
  const formContainer = document.createElement("div");
  formContainer.id = "placeItemsForm";

  const inputField = document.createElement("div");
  inputField.className = "input-item-field";

  // Översta raden
  const inputTop = document.createElement("div");
  inputTop.className = "input-top";

  const productNumber = document.createElement("input");
  productNumber.type = "text";
  productNumber.placeholder = "Product number";
  productNumber.id = "product-number";

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.placeholder = "Title";
  titleInput.id = "title";

  const searchBtn = document.createElement("button");
  searchBtn.className = "search-btn";
  searchBtn.textContent = "Search";

  inputTop.appendChild(productNumber);
  inputTop.appendChild(titleInput);
  inputTop.appendChild(searchBtn);

  // Undre raden
  const inputBottom = document.createElement("div");
  inputBottom.className = "input-bottom";

  const priceMin = document.createElement("input");
  priceMin.type = "text";
  priceMin.placeholder = "Price/Min";
  priceMin.id = "price-min";

  const lineBetween = document.createElement("span");
  lineBetween.className = "line-between-price";
  lineBetween.textContent = "-";

  const priceMax = document.createElement("input");
  priceMax.type = "text";
  priceMax.placeholder = "Price/Max";
  priceMax.id = "price-max";

  const supplier = document.createElement("input");
  supplier.type = "text";
  supplier.placeholder = "Supplier";
  supplier.id = "supplier";

  inputBottom.appendChild(priceMin);
  inputBottom.appendChild(lineBetween);
  inputBottom.appendChild(priceMax);
  inputBottom.appendChild(supplier);

  inputField.appendChild(inputTop);
  inputField.appendChild(inputBottom);
  formContainer.appendChild(inputField);

  // == ADMIN HANTERINGSKNAPPAR ==
  const productListManageAdmin = document.createElement("div");
  productListManageAdmin.className = "product-list-manage-admin";

  const manageItems = [
    "Add new product",
    "Manage orders",
    "Manage suppliers",
    "Manage discounts",
  ];
  manageItems.forEach((text) => {
    const manageBtn = document.createElement("button");
    manageBtn.className = "manage-btn";
    manageBtn.textContent = text;
    productListManageAdmin.appendChild(manageBtn);
  });

  // == PRODUKTLISTA ==
  const itemContainer = document.createElement("div");
  itemContainer.id = "item-container-costumer";

  const productListHeader = document.createElement("div");
  productListHeader.className = "product-list-header-admin";

  const headers = ["Product number", "Title", "Supplier", "Price"];
  headers.forEach((text) => {
    const headerDiv = document.createElement("div");
    headerDiv.className = "product-col-top";
    headerDiv.textContent = text;
    productListHeader.appendChild(headerDiv);
  });

  // Produktlista
  const productListContainer = document.createElement("div");
  productListContainer.className = "product-list-container";

  const sampleProducts = [
    { id: 1001, name: "Product A", supplier: "Supplier X", price: "$10.99" },
    { id: 1002, name: "Product B", supplier: "Supplier Y", price: "$15.50" },
    { id: 1003, name: "Product C", supplier: "Supplier Z", price: "$7.99" },
    { id: 1004, name: "Product D", supplier: "Supplier W", price: "$12.50" },
    { id: 1001, name: "Product A", supplier: "Supplier X", price: "$10.99" },
    { id: 1002, name: "Product B", supplier: "Supplier Y", price: "$15.50" },
    { id: 1003, name: "Product C", supplier: "Supplier Z", price: "$7.99" },
    { id: 1004, name: "Product D", supplier: "Supplier W", price: "$12.50" },
    { id: 1001, name: "Product A", supplier: "Supplier X", price: "$10.99" },
    { id: 1002, name: "Product B", supplier: "Supplier Y", price: "$15.50" },
    { id: 1003, name: "Product C", supplier: "Supplier Z", price: "$7.99" },
    { id: 1004, name: "Product D", supplier: "Supplier W", price: "$12.50" },
    { id: 1001, name: "Product A", supplier: "Supplier X", price: "$10.99" },
    { id: 1002, name: "Product B", supplier: "Supplier Y", price: "$15.50" },
    { id: 1003, name: "Product C", supplier: "Supplier Z", price: "$7.99" },
    { id: 1004, name: "Product D", supplier: "Supplier W", price: "$12.50" },
  ];

  sampleProducts.forEach((product) => {
    const productItem = document.createElement("div");
    productItem.className = "product-item";

    const productId = document.createElement("div");
    productId.className = "product-col";
    productId.textContent = product.id;

    const productName = document.createElement("div");
    productName.className = "product-col";
    productName.textContent = product.name;

    const productSupplier = document.createElement("div");
    productSupplier.className = "product-col";
    productSupplier.textContent = product.supplier;

    const productPrice = document.createElement("div");
    productPrice.className = "product-col";
    productPrice.textContent = product.price;

    const productActions = document.createElement("div");
    productActions.className = "product-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.textContent = "Edit";

    const quantity = document.createElement("span");
    quantity.className = "quantity";
    quantity.textContent = "Qty";

    const discountsBtn = document.createElement("button");
    discountsBtn.className = "discounts-btn";
    discountsBtn.textContent = "Discounts";

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Remove";

    productActions.appendChild(editBtn);
    productActions.appendChild(quantity);
    productActions.appendChild(discountsBtn);
    productActions.appendChild(removeBtn);

    productItem.appendChild(productId);
    productItem.appendChild(productName);
    productItem.appendChild(productSupplier);
    productItem.appendChild(productPrice);
    productItem.appendChild(productActions);

    productListContainer.appendChild(productItem);
  });

  itemContainer.appendChild(productListHeader);
  itemContainer.appendChild(productListContainer);

  main.appendChild(titleContainer);
  main.appendChild(formContainer);
  main.appendChild(productListManageAdmin);
  main.appendChild(itemContainer);
  document.body.appendChild(main);
}
