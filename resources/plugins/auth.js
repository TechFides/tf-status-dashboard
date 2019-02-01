import Vue from 'vue';

const AuthRoles = {};

AuthRoles.install = function (Vue, options) {
  Vue.prototype.isAdmin = function () {
    return this.$auth.user && this.$auth.user.roles.some(role => role.slug === 'admin');
  };
  Vue.prototype.isUser = function () {
    return this.$auth.user && this.$auth.user.roles.some(role => role.slug === 'user');
  };
};

Vue.use(AuthRoles);
