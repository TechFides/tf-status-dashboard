<template>
  <v-layout
    column
    justify-center
    align-end
  >
    <v-dialog
      v-model="defaultTeamLeaderModalItem.isOpen"
      max-width="500px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ modalTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container grid-list-md>
            <v-layout
              wrap
              column
            >
              <v-flex
                xs12
                sm6
                md4
              >
                <v-select
                  v-model="teamLeaderModalItem.userId"
                  :items="formattedTeamleadersForSelect"
                  label="Vyberte vedoucího projektu"
                />
              </v-flex>
            </v-layout>

            <v-alert
              transition="fade-transition"
              :value="errors.error.isVisible"
              type="error"
              color="red darken-2"
            >
              {{ errors.error.message }}
            </v-alert>
          </v-container>
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
      </v-card>
    </v-dialog>

    <v-btn
      color="blue darken-2"
      dark
      class="button"
      @click="createNewProject()"
    >
      <i class="material-icons">add</i>
      Nový projekt
    </v-btn>

    <v-dialog
      v-model="modalItem.isOpen"
      max-width="500px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ modalTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container grid-list-md>
            <v-layout
              wrap
              column
            >
              <v-flex
                xs12
                sm6
                md4
              >
                <v-text-field
                  v-model="modalItem.code"
                  :rules="[rules.required]"
                  label="Projekt"
                />
              </v-flex>
              <v-flex
                xs12
                sm6
                md4
              >
                <v-text-field
                  v-model="modalItem.description"
                  label="Popis"
                />
              </v-flex>
              <v-flex
                xs12
                sm6
                md4
              >
                <v-text-field
                  v-model="modalItem.slackChannelName"
                  :rules="[rules.required]"
                  label="Název slack kanálu"
                />
              </v-flex>
              <v-flex
                xs12
                sm6
                md4
              >
                <v-checkbox
                  v-model="modalItem.isActive"
                  label="Aktivní"
                />
              </v-flex>
              <v-flex
                xs12
                sm6
                md4
              >
                <v-select
                  v-model="modalItem.meetingTimeId"
                  :items="formattedMeetingTimesForSelect"
                  label="Vyberte čas konání sitdownu"
                />
              </v-flex>
            </v-layout>

            <v-alert
              transition="fade-transition"
              :value="errors.error.isVisible"
              type="error"
              color="red darken-2"
            >
              {{ errors.error.message }}
            </v-alert>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            text
            @click.native="close"
          >
            Zrušit
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click.native="save"
          >
            Uložit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card class="elevation-1 fullscreen">
      <v-layout
        align-center
        justify-end
      >
        <v-flex xs4>
          <v-card-title>
            <v-text-field
              v-model="filteringText"
              append-icon="search"
              label="Hledej..."
              single-line
              hide-details
            />
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
      >
        <template
          v-slot:item="props"
        >
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
              <v-icon
                small
                class="mr-2"
                @click="addTeamleader(props.item)"
              >
                mdi-account-plus
              </v-icon>
              <v-icon
                small
                class="mr-2"
                @click="editItem(props.item)"
              >
                edit
              </v-icon>
              <v-icon
                small
                @click="deleteItem(props.item)"
              >
                delete
              </v-icon>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-layout>
</template>

<script>
import { mapState } from 'vuex';
import format from 'date-fns/format';

export default {
  data () {
    return {
      pagination: { sortBy: 'code' },
      modalTitle: '',
      rules: {
        required: value => !!value || 'Povinné.',
      },
      modalItem: {
        id: null,
        code: '',
        description: '',
        isActive: true,
        meetingTimeId: null,
        slackChannelName: null,
        isOpen: false,
      },
      defaultModalItem: {
        id: null,
        code: '',
        description: '',
        isActive: true,
        meetingTimeId: null,
        slackChannelName: null,
        isOpen: false,
      },
      teamLeaderModalItem: {
        projectId: null,
        userId: 0,
        isOpen: false,
      },
      defaultTeamLeaderModalItem: {
        projectId: null,
        userId: 0,
        isOpen: false,
      },
      filteringText: '',
    };
  },
  computed: {
    ...mapState([
      'projects',
      'errors',
      'meetingTimes',
      'users',
    ]),
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
    filteredProject () {
      return this.projects.all.filter((element) => {
        const description = element.description ? element.description.toUpperCase() : '';
        const teamLeader = element.teamLeader.name.toUpperCase();
        const slackChannelName = element.slackChannelName ? element.slackChannelName.toUpperCase() : '';
        const uppercasedFilterText = this.filteringText.toUpperCase();

        return element.code.match(uppercasedFilterText) ||
          this.isProjectActive(element.isActive, true).match(uppercasedFilterText) ||
          description.match(uppercasedFilterText) ||
          teamLeader.match(uppercasedFilterText) ||
          slackChannelName.match(uppercasedFilterText);
      });
    },
    formattedMeetingTimesForSelect () {
      return [
        {text: 'Žádný', value: null},
        ...this.meetingTimes.items.map(meetingTime => ({
          text: meetingTime.dayAndTime,
          value: meetingTime.id,
        })),
      ];
    },
    formattedTeamleadersForSelect () {
      return [
        {text: 'Žádný', value: 0},
        ...this.users.items.map(user => ({
          text: `${user.firstName} ${user.lastName}`,
          value: user.id,
        })),
      ];
    },
  },
  async fetch ({ store, params }) {
    await Promise.all([
      store.dispatch('meetingTimes/getMeetingTimes'),
      store.dispatch('projects/getAllProjects'),
      store.dispatch('users/getUsers'),
    ]);
  },
  methods: {
    createNewProject () {
      this.modalTitle = 'Nový projekt';
      this.modalItem.isOpen = true;
    },
    addTeamleader(item) {
      this.teamLeaderModalItem = {
        projectId: item.id,
        userId: item.teamLeader.id ? item.teamLeader.id : this.defaultTeamLeaderModalItem.userId,
      };

      this.modalTitle = 'Nastavit vedoucího projektu';
      this.defaultTeamLeaderModalItem.isOpen = true;
    },
    editItem (item) {
      this.modalItem = {
        id: item.id,
        code: item.code,
        description: item.description,
        isActive: item.isActive,
        meetingTimeId: item.meetingTime.value,
        slackChannelName: item.slackChannelName,
      };

      this.modalTitle = 'Upravit projekt';
      this.modalItem.isOpen = true;
    },
    async deleteItem (item) {
      const confirmed = confirm(`Opravdu chcete smazat projekt ${item.code}?`);

      if (confirmed) {
        await this.$store.dispatch('projects/deleteProject', item.id);
        await this.$store.dispatch('projects/getAllProjects');
      }
    },
    close () {
      this.modalItem.isOpen = false;
      this.modalItem = { ...this.defaultModalItem };
      this.$store.commit('errors/clearErrorState');
    },
    async save () {
      const action = this.modalItem.id ? 'projects/editProject' : 'projects/createProject';
      await this.$store.dispatch(action, this.modalItem);
      await this.$store.dispatch('projects/getProjects');
      await this.$store.dispatch('projects/getAllProjects');
      !this.errors.error.isVisible && this.close();
    },
    closeTeamleaderModal () {
      this.defaultTeamLeaderModalItem.isOpen = false;
      this.teamleaderModalItem = {...this.defaultTeamLeaderModalItem};
      this.$store.commit('errors/clearErrorState');
    },
    async saveTeamleaderModal() {
      const teamLeader = this.teamLeaderModalItem;
      await this.$store.dispatch('projects/addTeamLeader', teamLeader);
      !this.errors.error.isVisible && this.closeTeamleaderModal();
    },
    formatDate (date) {
      if (!date) {
        return '';
      }

      const d = new Date(date);

      return format(d, 'DD/MM/YYYY');
    },
    isProjectActive (isActive, toUpper) {
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
