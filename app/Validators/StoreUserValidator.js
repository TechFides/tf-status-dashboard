'use strict';

class StoreUserValidator {
  get rules () {
    const userId = this.ctx.params.id;

    return {
      firstName: `required|max:255|min:1`,
      lastName: 'required|max:255|min:1',
      isActive: 'required|boolean',
      username: `required|max:255|min:1|unique:users,username,id,${userId}`,
    };
  }
}

module.exports = StoreUserValidator;
