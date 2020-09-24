'use strict';

const UserModel = use('App/Models/User');
const GoogleToken = use('App/Models/GoogleToken');

class AuthController {
  async login({ request, response, auth }) {
    const { username, password, gToken } = request.all();
    try {
      let newToken = '';
      let user = '';

      if (gToken) {
        const googleTokenQuery = await GoogleToken.query()
          .where({ token: gToken })
          .andWhere({ status: false })
          .first();

        user = await UserModel.query()
          .where({ id: googleTokenQuery.user_id })
          .first();
        const { token } = await auth.generate(user);
        newToken = token;

        await GoogleToken.query()
          .where({ token: gToken })
          .andWhere({ status: false })
          .update({ status: true });
      } else {
        const { token } = await auth.attempt(username, password);
        newToken = token;
        user = await UserModel.query()
          .with('position', builder => {
            builder.with('permissions');
          })
          .where({ username: username, is_active: true })
          .first();
      }
      console.log({
        newToken,
        ...user.toJSON(),
      });
      return {
        newToken,
        ...user.toJSON(),
      };
    } catch (e) {
      response.status(401).send({ message: 'Invalid credentials' });
    }
  }

  async logout({ request, response, auth }) {
    return { message: 'logout' };
  }

  async me({ request, response, auth }) {
    try {
      const user = await auth.getUser();

      const data = await UserModel.query()
        .with('position', builder => {
          builder.with('permissions');
        })
        .where('username', user.username)
        .first();

      return { data: data };
    } catch (e) {
      response.status(401).send({ message: 'Invalid credentials' });
    }
  }
}

module.exports = AuthController;
