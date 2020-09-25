<template>
  <v-dialog
    v-model="isOpen"
    max-width="500px"
  >
    <v-card>
      <v-card-title>
        <span class="headline">Nastavit vedoucího projektu</span>
      </v-card-title>
      <v-form
        ref="form"
        lazy-validation
        @submit.prevent
      >
        <v-card-text>
          <v-row class="pl-4 pr-4">
            <v-select
              v-model="teamLeaderModalItem.userId"
              :items="formattedTeamleadersForSelect"
              label="Vyberte vedoucího projektu"
            />
          </v-row>
          <v-row class="pl-4 pr-4">
            <v-alert
              transition="fade-transition"
              :value="errors.error.isVisible"
              type="error"
              color="red darken-2"
            >
              {{ errors.error.message }}
            </v-alert>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            text
            @click.native="closeTeamleaderModal"
          >
            Zrušit
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click.native="saveTeamleaderModal"
          >
            Uložit
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'TeamLeaderDialog',
  data() {
    return {
      isOpen: false,
      teamLeaderModalItem: {
        projectId: null,
        userId: 0,
      },
      defaultTeamLeaderModalItem: {
        projectId: null,
        userId: 0,
      },
    };
  },
  computed: {
    ...mapState(['errors', 'users']),
    formattedTeamleadersForSelect() {
      return [
        { text: 'Žádný', value: 0 },
        ...this.users.items.map(user => ({
          text: `${user.firstName} ${user.lastName}`,
          value: user.id,
        })),
      ];
    },
  },
  methods: {
    openDialog(teamLeader) {
      this.isOpen = true;
      if (teamLeader) {
        this.teamLeaderModalItem = {
          projectId: teamLeader.id,
          userId: teamLeader.teamLeader.id ? teamLeader.teamLeader.id : this.defaultTeamLeaderModalItem.userId,
        };
      }
    },
    closeTeamleaderModal() {
      if (this.$refs.form.validate()) {
        this.isOpen = false;
        this.teamLeaderModalItem = { ...this.defaultTeamLeaderModalItem };
        this.$store.commit('errors/clearErrorState');
      }
    },
    async saveTeamleaderModal() {
      this.$refs.form.resetValidation();
      await this.$store.dispatch('projects/addTeamLeader', this.teamLeaderModalItem);
      !this.errors.error.isVisible && this.closeTeamleaderModal();
    },
  },
};
</script>

<style scoped></style>
