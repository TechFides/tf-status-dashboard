import Vue from 'vue';

const AuthRoles = {};

AuthRoles.install = function (Vue, options) {
  Vue.prototype.isAdmin = function () {
    return this.$store.app.isAdmin();
  };
  Vue.prototype.isUser = function () {
    return this.$store.app.isUser();
  };
};

Vue.use(AuthRoles);
