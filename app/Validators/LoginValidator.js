'use strict';

class LoginValidator {
  get rules() {
    return {
      username: `max:255|min:1`,
      password: 'max:255|min:1',
      token: 'min:1',
    };
  }
}

module.exports = LoginValidator;
