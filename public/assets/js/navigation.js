


import { renderAdminLoginPage } from "./loginAdminPage.js";
import { renderCostumerLoginPage } from "./loginCostumerPage.js";
import { renderAdminProductPage } from "./adminProductPage.js";
import { renderCustomerProductPage } from "./costumerProductPage.js";

export const navigation = {
    adminLogin: renderAdminLoginPage,
    customerLogin: renderCostumerLoginPage,
    adminProducts: renderAdminProductPage,
    customerProducts: renderCustomerProductPage
};