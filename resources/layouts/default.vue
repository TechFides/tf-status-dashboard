<template>
  <v-app light>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant.sync="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          router
          :to="item.to"
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      app
      :clipped-left="clipped"
      color="black"
      dark
    >
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
    <v-snackbar
      :value="notification.items.isVisible"
      :color="notification.items.color"
      :multi-line="true"
    >
      {{ notification.items.message }}
      <v-btn
        dark
        text
        @click="closeNotification"
      >
        Close
      </v-btn>
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
  data () {
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
    ...mapState([
      'notification',
    ]),
    items () {
      const items = [
        { icon: 'apps', title: 'Dashboard', to: '/' },
        { icon: 'radio_button_unchecked', title: 'Standup', to: '/standup', availableFor: ['administration', 'production']  },
        { icon: 'laptop_windows', title: 'Projekty', to: '/projects', availableFor: ['administration'] },
        { icon: 'mdi-palm-tree -checked', title: 'Nepřítomnosti', to: '/office-absences', availableFor: ['administration', 'production', 'sales', 'HR'] },
        { icon: 'bar_chart', title: 'The Game', to: '/statistics', availableFor: ['administration', 'production'] },
        { icon: 'mdi-timer-outline', title: 'Logování práce', to: '/work-logs', availableFor: ['administration', 'sales', 'HR'] },
        { icon: 'face', title: 'Uživatelé', to: '/users', availableFor: ['administration'] },
        { icon: 'tag_faces', title: 'Heatmap', to: '/heatmap', availableFor: ['administration'] },
        { icon: 'schedule', title: 'Časy konání sitdownu', to: '/meeting-times', availableFor: ['administration'] },
        { icon: 'settings', title: 'Nastavení', to: '/settings', availableFor: ['administration'] },
      ];

      return items.filter(item => {
        if (typeof item.availableFor === 'undefined') {
          return true;
        }

        if (this.$auth.user) {
          return this.$auth.user.roles.some(role => item.availableFor.includes(role.slug));
        }

        return false;
      });
    },
  },
  methods: {
    closeNotification () {
      this.$store.commit('notification/clearNotification');
    },
  },
};
</script>
