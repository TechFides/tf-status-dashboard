'use strict';

const User = use('App/Models/User');
const GoogleToken = use('App/Models/GoogleToken');
const Env = use('Env');

class GoogleLoginController {
  async redirect({ ally }) {
    await ally.driver('google').redirect();
  }

  async registerToken({request, response, ally}) {
    try {
      const { token } = request.all();

      const gUser = await ally.driver('google').getUserByToken(token);
      await this.registerGoogleUser(gUser);
    } catch (e) {
      response.status(401).send({ message: 'Unable to register a token.' });
    }
  }

  async callback({ ally, response }) {
    try {
      const gUser = await ally.driver('google').getUser();
      const googleToken = await this.registerGoogleUser(gUser);

      const vueAppUrl = Env.get('VUE_APP_URL');
      response.redirect(`${vueAppUrl}/submit-google-auth/?token=${googleToken.token}`);
    } catch (error) {
      return 'Unable to authenticate. Try again later';
    }
  }

  async registerGoogleUser(googleUser) {
    // user details to be saved
    const userDetails = {
      email: googleUser.getEmail(),
      first_name: googleUser.getName().split(' ').slice(0, -1).join(' '),
      last_name: googleUser.getName().split(' ').slice(-1).join(' '),
      username: googleUser.getNickname(),
      is_active: true,
    };

    // search for existing user
    const whereClauseForUsers = {
      email: googleUser.getEmail(),
    };

    const user = await User.findOrCreate(whereClauseForUsers, userDetails);

    // user details to be saved
    const googleTokenDetails = {
      token: googleUser.getAccessToken(),
      status: false,
      user_id: user.id,
    };

    // search for existing user
    const whereClauseForGoogleTokens = {
      token: googleUser.getAccessToken(),
    };

    return GoogleToken.findOrCreate(whereClauseForGoogleTokens, googleTokenDetails);
  }
}

module.exports = GoogleLoginController;
