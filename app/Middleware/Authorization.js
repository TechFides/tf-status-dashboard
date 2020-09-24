'use strict';
const Logger = use('Logger');

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Authorization {
  async handle({ request, response, auth }, next, properties) {
    // call next to advance the request
    const user = auth.user.toJSON();
    const isAdmin = user.is_admin;
    Logger.debug(JSON.stringify(user, null, 2));
    Logger.debug(`[Authorization] user is admin: ${isAdmin}`);
    Logger.info(JSON.stringify(properties, null, 2));
    if (properties[0] === 'admin' && isAdmin) {
      await next();
    } else {
      await next();
      response.status(403).send('Forbidden');
    }
  }
}

module.exports = Authorization;
