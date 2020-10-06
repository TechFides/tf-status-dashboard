<template>
  <v-layout column justify-center align-end>
    <v-btn color="blue darken-2" dark class="button" @click="createNewProject()">
      <i class="material-icons">add</i>
      Nový projekt
    </v-btn>

    <v-card class="elevation-1 fullscreen">
      <v-layout align-center justify-end>
        <v-flex xs4>
          <v-card-title>
            <v-text-field v-model="filteringText" append-icon="search" label="Hledej..." single-line hide-details />
          </v-card-title>
        </v-flex>
      </v-layout>

      <v-data-table
        :headers="headers"
        :items="filteredProject"
        :items-per-page="999"
        item-key="code"
        hide-default-footer
        fill-height
        :sort-by="sortBy"
      >
        <template v-slot:item="props">
          <tr>
            <td class="text-center element">
              {{ props.item.code }}
            </td>
            <td class="text-center element">
              {{ props.item.description }}
            </td>
            <td class="text-center element">
              {{ isProjectActive(props.item.isActive, false) }}
            </td>
            <td class="text-center">
              {{ props.item.meetingTime.text }}
            </td>
            <td class="text-center element">
              {{ props.item.teamLeader.name }}
            </td>
            <td class="text-center element">
              {{ props.item.slackChannelName }}
            </td>
            <td class="justify-center layout px-0">
              <v-icon small class="mr-2" @click="addTeamleader(props.item)"> mdi-account-plus </v-icon>
              <v-icon small class="mr-2" @click="editProject(props.item)"> edit </v-icon>
              <v-icon small @click="deleteProject(props.item)"> delete </v-icon>
            </td>
          </tr>
        </template>
      </v-data-table>
      <ProjectDialog ref="refProjectDialog" />
      <TeamLeaderDialog ref="refTeamLeaderDialog" />
    </v-card>
  </v-layout>
</template>

<script>
import { mapState } from 'vuex';
import format from 'date-fns/format';
import ProjectDialog from '../components/project/dialogs/ProjectDialog';
import TeamLeaderDialog from '../components/project/dialogs/TeamLeaderDialog';

export default {
  components: {
    ProjectDialog,
    TeamLeaderDialog,
  },
  data() {
    return {
      sortBy: 'code',
      filteringText: '',
    };
  },
  computed: {
    ...mapState(['projects', 'errors']),
    headers: function () {
      return [
        {
          text: 'Projekt',
          align: 'center',
          sortable: true,
          value: 'code',
        },
        {
          text: 'Popis',
          align: 'center',
          sortable: true,
          value: 'description',
        },
        {
          text: 'Aktivní',
          align: 'center',
          sortable: true,
          value: 'isActive',
        },
        {
          text: 'Čas konání sitdownu',
          align: 'center',
          sortable: false,
          value: 'meetingTimeId',
        },
        {
          text: 'Vedoucí projektu',
          align: 'center',
          sortable: false,
          value: 'teamLeader',
        },
        {
          text: 'Slack kanál',
          align: 'center',
          sortable: false,
          value: 'slackChannelName',
        },
        {
          text: 'Akce',
          align: 'center',
          sortable: false,
          value: 'actions',
        },
      ];
    },
    filteredProject() {
      return this.projects.all.filter(element => {
        const description = element.description ? element.description.toUpperCase() : '';
        const teamLeader = element.teamLeader.name.toUpperCase();
        const slackChannelName = element.slackChannelName ? element.slackChannelName.toUpperCase() : '';
        const uppercasedFilterText = this.filteringText.toUpperCase();

        return (
          element.code.match(uppercasedFilterText) ||
          this.isProjectActive(element.isActive, true).match(uppercasedFilterText) ||
          description.match(uppercasedFilterText) ||
          teamLeader.match(uppercasedFilterText) ||
          slackChannelName.match(uppercasedFilterText)
        );
      });
    },
  },
  async fetch({ store, params }) {
    await Promise.all([
      store.dispatch('meetingTimes/getMeetingTimes'),
      store.dispatch('projects/getAllProjects'),
      store.dispatch('users/getUsers'),
    ]);
  },
  methods: {
    createNewProject() {
      this.$refs.refProjectDialog.openDialog();
    },
    editProject(project) {
      this.$refs.refProjectDialog.openDialog(project);
    },
    async deleteProject(item) {
      const confirmed = confirm(`Opravdu chcete smazat projekt ${item.code}?`);

      if (confirmed) {
        await this.$store.dispatch('projects/deleteProject', item.id);
        await this.$store.dispatch('projects/getAllProjects');
      }
    },
    addTeamleader(teamLeader) {
      this.$refs.refTeamLeaderDialog.openDialog(teamLeader);
    },
    formatDate(date) {
      if (!date) {
        return '';
      }

      const d = new Date(date);

      return format(d, 'DD/MM/YYYY');
    },
    isProjectActive(isActive, toUpper) {
      const result = isActive ? 'ano' : 'ne';

      return toUpper ? result.toUpperCase() : result.toLowerCase();
    },
  },
};
</script>

<style scoped>
.fullscreen {
  width: 100%;
  height: 100%;
}

.element {
  font-size: 1.3em !important;
}

.button {
  margin: 6px 8px;
}

.header {
  font-size: 2em !important;
}
</style>
