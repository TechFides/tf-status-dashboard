'use strict';
const UserModel = use('App/Models/User');

class Authorization {
  async handle({ request, response, auth }, next, properties) {
    // call next to advance the request
    const userModel = await UserModel.query()
      .with('position', builder => {
        builder.with('permissions');
      })
      .where('id', auth.user.id)
      .first();
    const userData = userModel.toJSON();
    let userPermissions = [];
    if (userData.position) {
      userPermissions = userData.position.permissions.map(p => p.value);
    }

    const requiredPermission = properties[0];

    const hasUserRequiredPermission = userPermissions.includes(requiredPermission);
    if (userData.is_admin) {
      await next();
    } else if (hasUserRequiredPermission) {
      await next();
    } else {
      throw new Error('Forbidden');
    }
  }
}

module.exports = Authorization;
