export default ({ app }, inject) => {
  app.isAdministration = function () {
    return this.$auth.user && this.$auth.user.roles.some(role => role.slug === 'administration');
  };

  app.isRealization = function () {
    return this.$auth.user && this.$auth.user.roles.some(role => role.slug === 'realization');
  };

  app.isSales = function () {
    return this.$auth.user && this.$auth.user.roles.some(role => role.slug === 'sales');
  };

  app.isHR = function () {
    return this.$auth.user && this.$auth.user.roles.some(role => role.slug === 'HR');
  };
};
