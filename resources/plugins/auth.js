import Vue from 'vue';

const AuthRoles = {};

AuthRoles.install = function (Vue, options) {
  Vue.prototype.isAdministration = function () {
    return this.$store.app.isAdministration();
  };
  Vue.prototype.isRealization = function () {
    return this.$store.app.isRealization();
  };
  Vue.prototype.isSales = function () {
    return this.$store.app.isSales();
  };
  Vue.prototype.isHR = function () {
    return this.$store.app.isHR();
  };
};

Vue.use(AuthRoles);
