"use strict";


//import { renderAdminProductPage } from "./adminProductPage.js";
//import { renderCostumerLoginPage } from "./loginCostumerPage.js";
//import { renderCustomerProductPage } from "./customerProductPage.js";

import { navigation } from "./navigation.js";


export function renderAdminLoginPage() {

    document.body.innerHTML = "";

    const main = document.createElement("main");
    main.id = "adminLoginPage";

    // Titel, Loginform, Top buttons container
    const titleDB = document.createElement("div");
    titleDB.className = "title-DB";

    const titleSpan = document.createElement("h1");
    titleSpan.innerHTML = `Online Store <span>Database</span>`;
    titleDB.appendChild(titleSpan);

    const loginForm = document.createElement("div");
    loginForm.id = "loginForm";

    const topButtons = document.createElement("div");
    topButtons.className = "top-buttons";

    const adminButton = document.createElement("button");
    adminButton.className = "admin";
    adminButton.textContent = "Admin";

    const customerButton = document.createElement("button");
    customerButton.className = "costumer";
    customerButton.textContent = "Customer";

    topButtons.appendChild(adminButton);
    topButtons.appendChild(customerButton);


    // Input fields, Bottom buttons container
    const inputField = document.createElement("div");
    inputField.className = "input-field";

    const usernameInput = document.createElement("input");
    usernameInput.type = "text";
    usernameInput.placeholder = "Username";
    usernameInput.id = "username";

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.placeholder = "Password";
    passwordInput.id = "password";

    inputField.appendChild(usernameInput);
    inputField.appendChild(passwordInput);

    const bottomButton = document.createElement("div");
    bottomButton.className = "bottom-button";

    const loginButton = document.createElement("button");
    loginButton.className = "login";
    loginButton.textContent = "Login";

    const registerButton = document.createElement("button");
    registerButton.className = "register";
    registerButton.textContent = "Register";

    bottomButton.appendChild(loginButton);
    bottomButton.appendChild(registerButton);

    loginForm.appendChild(topButtons);
    loginForm.appendChild(inputField);
    loginForm.appendChild(bottomButton);

    main.appendChild(titleDB);
    main.appendChild(loginForm);

    document.body.appendChild(main);

    setupEventListeners(adminButton, customerButton, loginButton, registerButton, usernameInput, passwordInput);
}

// Funktion => lägga till eventlisteners
function setupEventListeners(adminButton, customerButton, loginButton, registerButton, usernameInput, passwordInput) {
    let userType = "admin";
    adminButton.classList.add("active");

    adminButton.addEventListener("click", function () {
        userType = "admin";
        adminButton.classList.add("active");
        customerButton.classList.remove("active");
    });

    customerButton.addEventListener("click", function () {
        userType = "customer";
        customerButton.classList.add("active");
        adminButton.classList.remove("active");
        navigation.customerLogin();
        //renderCostumerLoginPage();
    });

    loginButton.addEventListener("click", async function () {
        const email = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (email === "" || password === "") {
            console.error("Please enter both email and password.");
            return;
        }

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password })
            });

            if (response.status === 200) {
                const data = await response.json();
                console.log("Login successful! Token:", data.token);

                if (userType === "admin") {
                    navigation.adminProducts();
                    //renderAdminProductPage();
                } else if (userType === "customer") {
                    navigation.customerProducts();
                    //renderCostumerProductPage();
                }

            } else if (response.status === 401) {
                console.error("Incorrect email or password.");
            } else {
                console.error("An error occurred during login. 401 Unauthorized");
            }

        } catch (error) {
            console.error('Error:', error);
            console.error("Server error, please try again later.");
        }
    });

    registerButton.addEventListener("click", async function () {
        const email = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (email === "" || password === "") {
            console.error("Please fill in both email and password to register.");
            return;
        }

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, fName, lName, address, city, country,
                    phoneNumber })
            });

            if (response.status === 200) {
                console.log("Registration successful! You can now log in.");
            } else if (response.status === 400) {
                console.error("Email already registered. 400 Bad request.");
            } else if (response.status === 500) {
                console.error("500 Internal server error, try again.");
            } else {
                console.error("Unexpected error during registration.");
            }

        } catch (error) {
            console.error('Error:', error);
            console.error("Server error, please try again later.");
        }
    });
}

renderAdminLoginPage();






