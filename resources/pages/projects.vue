<template>
  <v-layout column justify-center align-end>
    <v-btn @click="createNewProject()" color="primary" dark>
      <i class="material-icons">add</i>
      Nový projekt
    </v-btn>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ modalTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap column>
              <v-flex xs12 sm6 md4>
                <v-text-field :rules="[rules.required]" v-model="modalItem.code" label="Projekt"></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-text-field v-model="modalItem.description" label="Popis"></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-checkbox
                  label="Aktivní"
                  v-model="modalItem.isActive"
                ></v-checkbox>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-select
                  :items="formattedMeetingTimesForSelect"
                  v-model="modalItem.meetingTimeId"
                  label="Select meeting time"
                ></v-select>
              </v-flex>
            </v-layout>

            <v-alert
              transition="fade-transition"
              :value="error.isVisible"
              type="error"
            >
              {{ error.message }}
            </v-alert>

          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click.native="close">Zrušit</v-btn>
          <v-btn color="blue darken-1" flat @click.native="save">Uložit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card class='elevation-1 fullscreen'>
      <v-layout align-center justify-end>
        <v-flex xs4>
          <v-card-title>
            <v-text-field v-model="filteringText" append-icon="search" label="Hledej..." single-line hide-details>
            </v-text-field>
          </v-card-title>
        </v-flex>
      </v-layout>

      <v-data-table
        :headers='headers'
        :items='filteredProject'
        item-key="code"
        hide-actions
        fill-height
      >
        <template slot='items' slot-scope='props'>
          <td class='text-xs-center element'>{{ props.item.code }}</td>
          <td class='text-xs-center element'>{{ props.item.description }}</td>
          <td class='text-xs-center element'>{{ isProjectActive(props.item.isActive, false) }}</td>
          <td class="text-xs-right">{{ props.item.meetingTime.text }}</td>
          <td class="justify-center layout px-0">
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
          
        </template>
      </v-data-table>
    </v-card>
  </v-layout>
</template>

<script>
import { mapState } from 'vuex';
import format from 'date-fns/format';

export default {
  async fetch ({ store, params }) {
    await Promise.all([
      store.dispatch('getMeetingTimes'),
      store.dispatch('getAllProjects'),
    ]);
  },
  computed: {
    ...mapState([
      'allProjects',
      'error',
      'meetingTimes',
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
          text: 'Sitdown',
          align: 'center',
          sortable: false,
          value: 'meetingTimeId',
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
      return this.allProjects.filter((element) => {
        const description = element.description === null ? '' : element.description.toUpperCase();
        const uppercasedFilterText = this.filteringText.toUpperCase();

        return element.code.match(uppercasedFilterText) ||
          this.isProjectActive(element.isActive, true).match(uppercasedFilterText) ||
          description.match(uppercasedFilterText);
      });
    },
    formattedMeetingTimesForSelect () {
      return [
        {text: 'Zvolte sitdown', value: null},
        ...this.meetingTimes.map(meetingTime => ({
          text: `${meetingTime.name} (${meetingTime.week_day} ${meetingTime.time})`,
          value: meetingTime.id,
        })),
      ];
    },
  },
  data () {
    return {
      pagination: { sortBy: 'code' },
      dialog: false,
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
      },
      defaultModalItem: {
        id: null,
        code: '',
        description: '',
        isActive: true,
        meetingTimeId: null,
      },
      filteringText: '',
    };
  },
  methods: {
    createNewProject () {
      this.modalTitle = 'Nový projekt';
      this.dialog = true;
    },
    editItem (item) {
      this.modalItem = {
        id: item.id,
        code: item.code,
        description: item.description,
        isActive: item.isActive,
        meetingTimeId: item.meetingTime.value,
      };

      this.modalTitle = 'Upravit projekt';
      this.dialog = true;
    },
    async deleteItem (item) {
      const confirmed = confirm(`Opravdu chcete smazat projekt ${item.code}?`);

      if (confirmed) {
        await this.$store.dispatch('deleteProject', item.id);
        await this.$store.dispatch('getAllProjects');
      }
    },
    close () {
      this.dialog = false;
      this.modalItem = { ...this.defaultModalItem };
    },
    async save () {
      const action = this.modalItem.id ? 'editProject' : 'createProject';
      await this.$store.dispatch(action, this.modalItem);
      await this.$store.dispatch('getProjects');
      await this.$store.dispatch('getAllProjects');
      !this.error.isVisible && this.close();
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
  font-size: 1.5em !important;
}

.header {
  font-size: 2em !important;
}

</style>
