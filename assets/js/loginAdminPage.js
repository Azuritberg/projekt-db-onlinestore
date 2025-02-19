"use strict";

function renderAdminLoginPage() {

    document.body.innerHTML = "";

    // Skapa <main> element
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

    // Anropa funktion => lägga till event listeners
    setupEventListeners(adminButton, customerButton, loginButton, registerButton, usernameInput, passwordInput);
}

// Funktion => lägga till event listeners
function setupEventListeners(adminButton, customerButton, loginButton, registerButton, usernameInput, passwordInput) {
    let userType = "admin"; // Standardläge är "admin"


    adminButton.classList.add("active");
    // customerButton.classList.add("inactive");

    adminButton.addEventListener("click", function () {
        userType = "admin";
        adminButton.classList.add("active");
        //adminButton.classList.remove("inactive");
        //customerButton.classList.add("inactive");
        customerButton.classList.remove("active");

    });

    customerButton.addEventListener("click", function () {
        userType = "customer";
        customerButton.classList.add("active");
        //customerButton.classList.remove("inactive");
        //adminButton.classList.add("inactive");
        adminButton.classList.remove("active");
    });

    loginButton.addEventListener("click", function () {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (username === "" || password === "") {
            alert("Vänligen fyll i både användarnamn och lösenord.");
            return;
        }

        // Eventuell inloggning
        if (userType === "admin" && username === "admin" && password === "admin123") {
            alert("Inloggad som Admin!");
            window.location.href = "....html"; // Omdirigerar till admin-sida
        } else if (userType === "customer" && username === "customer" && password === "customer123") {
            alert("Inloggad som Kund!");
            window.location.href = ".....html"; // Omdirigerar till costumer-sida
        } else {
            alert("Fel användarnamn eller lösenord.");
        }
    });

    // Registreringsknapp?
    registerButton.addEventListener("click", function () {
        alert("Går till registreringssida...");
        window.location.href = "register.html"; // Ändra till din registreringssida
    });
}


renderAdminLoginPage();
