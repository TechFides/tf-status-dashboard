'use strict';

const User = use('App/Models/User');
const GoogleToken = use('App/Models/GoogleToken');
const Env = use('Env');

class GoogleLoginController {
  async redirect ({ ally }) {
    await ally.driver('google').redirect();
  }

  async callback ({ ally, response }) {
    try {
      const gUser = await ally.driver('google').getUser();

      // user details to be saved
      const userDetails = {
        email: gUser.getEmail(),
        first_name: gUser.getName().split(' ').slice(0, -1).join(' '),
        last_name: gUser.getName().split(' ').slice(-1).join(' '),
        username: gUser.getNickname(),
      };

      // search for existing user
      const whereClauseForUsers = {
        email: gUser.getEmail(),
      };

      const user = await User.findOrCreate(whereClauseForUsers, userDetails);

      // user details to be saved
      const googleTokenDetails = {
        token: gUser.getAccessToken(),
        status: false,
        user_id: user.id,
      };

      // search for existing user
      const whereClauseForGoogleTokens = {
        token: gUser.getAccessToken(),
      };

      const googleToken = await GoogleToken.findOrCreate(whereClauseForGoogleTokens, googleTokenDetails);

      const vueAppUrl = Env.get('VUE_APP_URL');
      response.redirect(`${vueAppUrl}/submit-google-auth/?token=${googleToken.token}`);
    } catch (error) {
      return 'Unable to authenticate. Try again later';
    }
  }
}

module.exports = GoogleLoginController;
