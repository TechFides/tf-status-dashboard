
export default ({ app }, inject) => {
  app.isAdmin = function () {
    return this.$auth.user && this.$auth.user.roles.some(role => role.slug === 'admin');
  };

  app.isUser = function () {
    return this.$auth.user && this.$auth.user.roles.some(role => role.slug === 'user');
  };
};

