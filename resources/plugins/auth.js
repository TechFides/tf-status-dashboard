import Vue from 'vue';

const AuthRoles = {};

AuthRoles.install = function (Vue, options) {
  Vue.prototype.isAdministration = function () {
    return this.$store.app.isAdministration();
  };
};

Vue.use(AuthRoles);
