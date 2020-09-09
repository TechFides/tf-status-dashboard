import Vue from 'vue';

const AuthRoles = {};

AuthRoles.install = function (Vue, options) {
  Vue.prototype.isAdministration = function () {
    return this.$store.app.isAdministration();
  };
  Vue.prototype.isProduction = function () {
    return this.$store.app.isProduction();
  };
  Vue.prototype.isSales = function () {
    return this.$store.app.isSales();
  };
  Vue.prototype.isHR = function () {
    return this.$store.app.isHR();
  };
};

Vue.use(AuthRoles);
