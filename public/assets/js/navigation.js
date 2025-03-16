


import { renderAdminLoginPage } from "./loginAdminPage.js";
import { renderCustomerLoginPage } from "./loginCustomerPage.js";
import { renderAdminProductPage } from "./adminProductPage.js";
import { renderCustomerProductPage } from "./customerProductPage.js";

export const navigation = {
    adminLogin: renderAdminLoginPage,
    customerLogin: renderCustomerLoginPage,
    adminProducts: renderAdminProductPage,
    customerProducts: renderCustomerProductPage
};