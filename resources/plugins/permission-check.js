import Vue from 'vue';

const PermissionCheck = {};

PermissionCheck.install = function (Vue, options) {
  Vue.prototype.hasPermission = function (permission) {
    return this.$store.app.hasPermission(permission);
  };
};

Vue.use(PermissionCheck);
