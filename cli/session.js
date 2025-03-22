export class Session {
  constructor() {
    this.admin = false;
    this.user = null;
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
}
