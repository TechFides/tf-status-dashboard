export default ({ app }, inject) => {
  app.hasPermission = function (permission) {
    const user = this.$auth.$state.user;
    return user && user.position.permissions.find(userPermission => userPermission.value === permission);
  };
};
