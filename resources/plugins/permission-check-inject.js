export default ({ app }, inject) => {
  app.hasPermission = function (permission) {
    return this.$auth.user && this.$auth.user.position.permissions.find(permission => permission.value === permission);
  };
};
