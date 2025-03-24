export class Session {
  constructor() {
    this.admin = false;
    this.user = null;
    this.cart = [];
  }

  addToCart(code, name, supplier, price, quantity, discount_amount = null) {
    this.cart.push({ code, name, supplier, price, quantity, discount_amount });
  }

  removeFromCart(idx) {
    if (this.cart[idx]) {
      this.cart.splice(idx, 1);
    }
  }

  grantAdmin() {
    this.admin = true;
  }

  revokeAdmin() {
    this.admin = false;
  }

  isAdmin() {
    return this.admin;
  }

  logOut() {
    this.user = null;
  }

  loggedIn() {
    return this.user ? true : false;
  }
}
