<template>
  <v-app light>
    <v-navigation-drawer v-model="drawer" :mini-variant.sync="miniVariant" :clipped="clipped" fixed app>
      <v-list>
        <v-list-item v-for="(item, i) in items" :key="i" router :to="item.to" exact>
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app :clipped-left="clipped" color="black" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <login-dialog />
    </v-app-bar>
    <v-main>
      <no-ssr>
        <nuxt />
      </no-ssr>
    </v-main>
    <v-snackbar :value="notification.items.isVisible" :color="notification.items.color" :multi-line="true">
      {{ notification.items.message }}
      <v-btn dark text @click="closeNotification"> Close </v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import LoginDialog from '../components/LoginDialog';
import { mapState, mapMutations } from 'vuex';

export default {
  components: {
    LoginDialog,
  },
  data() {
    return {
      clipped: true,
      drawer: false,
      fixed: false,
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'TF-Hub',
    };
  },
  computed: {
    ...mapState(['notification']),
    items() {
      const items = [
        { icon: 'apps', title: 'Dashboard', to: '/', name: 'dashboard' },
        { icon: 'radio_button_unchecked', title: 'Sitdown', to: '/sitdown', name: 'sitdown' },
        { icon: 'laptop_windows', title: 'Projekty', to: '/projects', name: 'projects' },
        { icon: 'mdi-palm-tree -checked', title: 'Nepřítomnosti', to: '/office-absences', name: 'office-absences' },
        { icon: 'bar_chart', title: 'The Game', to: '/game', name: 'game' },
        { icon: 'mdi-timer-outline', title: 'Logování práce', to: '/work-logs', name: 'work-logs' },
        { icon: 'face', title: 'Uživatelé', to: '/users', name: 'users' },
        { icon: 'mdi-account-hard-hat ', title: 'Pozice', to: '/positions', name: 'positions' },
        { icon: 'tag_faces', title: 'Heatmap', to: '/heatmap', name: 'heatmap' },
        { icon: 'schedule', title: 'Časy konání sitdownu', to: '/meeting-times', name: 'meeting-times' },
        { icon: 'settings', title: 'Nastavení', to: '/configuration', name: 'configuration' },
      ];

      return items.filter(item => {
        if (typeof item.name === 'undefined') {
          return true;
        }

        if (this.$auth.user && this.$auth.user.is_admin) {
          return true;
        }

        if (this.$auth.user && this.$auth.user.position && this.$auth.user.position.permissions.length) {
          return this.$auth.user.position.permissions.some(permission => item.name === permission.value);
        }

        return false;
      });
    },
  },
  methods: {
    closeNotification() {
      this.$store.commit('notification/clearNotification');
    },
  },
};
</script>
