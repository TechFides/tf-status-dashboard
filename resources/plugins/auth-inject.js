export default ({ app }, inject) => {
  app.isAdministration = function () {
    return this.$auth.user && this.$auth.user.roles.some(role => role.slug === 'administration');
  };

  app.isProduction = function () {
    return this.$auth.user && this.$auth.user.roles.some(role => role.slug === 'production');
  };

  app.isSales = function () {
    return this.$auth.user && this.$auth.user.roles.some(role => role.slug === 'sales');
  };

  app.isHR = function () {
    return this.$auth.user && this.$auth.user.roles.some(role => role.slug === 'HR');
  };
};
