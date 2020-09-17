export default ({ app }, inject) => {
  app.isAdministration = function () {
    return this.$auth.user && this.$auth.user.is_admin;
  };
};
