<template>
  <div
    class="full-height"
  >
    <v-layout
      row
      reverse
      align-end
    >
      <v-dialog
        v-model="userInfoDialog.isOpen"
        max-width="450px"
        transition="scale-transition"
        :persistent="true"
      >
        <v-card>
          <v-card-title>
            <span class="headline">Přidat bonus XP</span>
          </v-card-title>

          <v-form ref="form">
            <v-card-text>
              <v-container grid-list-md>
                <v-layout
                  wrap
                >
                  <v-flex
                    xs12
                  >
                    <v-text-field
                      v-model="userInfoDialog.bonusXp"
                      type="number"
                      label="Bonus Xp"
                    />
                  </v-flex>
                </v-layout>
              </v-container>
              <v-alert
                transition="fade-transition"
                :value="error.isVisible"
                type="error"
                color="red darken-2"
              >
                {{ error.message }}
              </v-alert>
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
          </v-form>
        </v-card>
      </v-dialog>
      <v-flex
        md1
        class="pad"
      >
        <v-dialog
          ref="dialogMonth"
          v-model="statisticsMonthDialog.isOpen"
          :return-value.sync="statisticsMonthDialog.month"
          persistent
          width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <div class="month-picker">
              <v-text-field
                v-model="statisticsMonthDialog.month"
                label="Měsíc"
                append-icon="event"
                readonly
                v-bind="attrs"
                v-on="on"
              />
            </div>
          </template>
          <v-date-picker
            v-model="statisticsMonthDialog.month"
            scrollable
            type="month"
            header-color="blue darken-2"
            color="blue darken-2"
          >
            <v-spacer />
            <v-btn
              text
              color="primary"
              @click="statisticsMonthDialog.isOpen = false"
            >
              Zrušit
            </v-btn>
            <v-btn
              text
              color="primary"
              @click="updateMonth($refs.dialogMonth)"
            >
              OK
            </v-btn>
          </v-date-picker>
        </v-dialog>
      </v-flex>
    </v-layout>

    <v-layout
      column
      justify-center
      align-end
    >
      <v-data-table
        :headers="headers"
        :items="projectStatistics.userStatistics"
        :items-per-page="999"
        item-key="id"
        hide-default-footer
        fill-height
        single-expand
        must-sort
        class="elevation-1 fullscreen"
        @item-expanded="getRowId"
      >
        <template
          v-slot:item="{item, expand, isExpanded}"
        >
          <tr
            class="expanded-row"
            @click.stop="expand(!isExpanded)"
          >
            <td class="text-left element">
              {{ item.userName }}
            </td>
            <td class="text-right element pr-8">
              {{ item.bonusXp }}
            </td>
            <td class="text-right element pr-8">
              {{ item.sumXpProjects }}
            </td>
            <td class="text-right element pr-8">
              {{ item.sumHoursWorked }}
            </td>
            <td
              class="text-right element pr-8"
              :class="{ 'hero-element': isHeroOfMonth(item.id)}"
            >
              {{ item.monthXp }}
            </td>
            <td class="text-right element pr-8">
              {{ item.previousXp }}
            </td>
            <td
              class="text-right element pr-8"
              :class="{ 'hero-element': isHeroOfGame(item.id)}"
            >
              {{ item.totalXp }}
            </td>
            <td class="text-right element pr-8">
              {{ item.currentLevel }}
            </td>
            <td class="text-right element pr-8">
              {{ item.newLevel }}
            </td>
            <td
              v-if="isAdmin()"
              class="text-center px-0"
            >
              <v-icon
                color="green lighten-1"
                class="justify-center"
                @click.stop="addExp(item)"
              >
                mdi-plus-circle-outline
              </v-icon>
            </td>
            <td class="text-left px-0">
              <v-icon
                class="mr-2"
              >
                {{ isExpanded ? "mdi-chevron-up" : "mdi-chevron-down" }}
              </v-icon>
            </td>
          </tr>
        </template>
        <template
          v-slot:expanded-item="{ headers }"
        >
          <td
            :colspan="headers.length"
            class="pr-0 pl-0"
          >
            <div
              v-if="userDetailItems.length === 0"
              class="no-available-data"
            >
              {{ 'Žádná data k dispozici' }}
            </div>
            <table
              v-if="userDetailItems.length"
              class="expanded-row-body"
            >
              <thead>
                <tr>
                  <th
                    v-for="h in expandedHeaders"
                    :key="h.text"
                    :class="h.align"
                    class="pl-4 pr-6"
                  >
                    {{ h.text }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, itemIndex) in userDetailItems"
                  :key="itemIndex"
                >
                  <td class="text-left border-bottom">
                    {{ item.code }}
                  </td>
                  <td class="text-right border-bottom">
                    {{ item.timeSpent }}
                  </td>
                  <td class="text-left border-bottom">
                    {{ item.projectExpModifierName }}
                  </td>
                  <td class="text-right border-bottom">
                    {{ item.coefficient }}%
                  </td>
                  <td
                    v-for="(i, index) in item.projectRatings"
                    :key="index"
                    class="text-right border-bottom"
                  >
                    {{ i.rating }}
                  </td>
                  <td class="text-right border-bottom pr-6">
                    {{ item.projectsXp }}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </template>
      </v-data-table>
    </v-layout>
    <v-layout
      row
      justify-center
    >
      <v-tooltip
        bottom
        :disabled="!projectStatistics.jiraSynchronization.status"
      >
        <template v-slot:activator="{ on, attrs }">
          <div
            v-bind="attrs"
            v-on="on"
          >
            <v-btn
              v-show="isAdmin() && checkSyncButton"
              class="my-2 standup-button"
              color="primary"
              :disabled="!!projectStatistics.jiraSynchronization.status"
              @click="fetchJiraData()"
            >
              <v-progress-circular
                v-if="projectStatistics.jiraSynchronization.status"
                :size="25"
                class="mr-2"
                color="grey lighten-1"
                indeterminate
              />
              <v-icon
                v-if="!projectStatistics.jiraSynchronization.status"
                class="mr-2"
              >
                mdi-download
              </v-icon>
              Synchronizace dat
            </v-btn>
          </div>
        </template>
        <span>
          Probíhá synchronizace. Počkejte prosím...
        </span>
      </v-tooltip>
    </v-layout>
    <div
      v-if="projectStatistics.jiraSynchronization.status"
      class="column-align"
    >
      <div class="synchronization-info-wrapper">
        <div class="row-align blue-color">
          Synchronizece začala:
          <div class="synchronization-info">
            {{ projectStatistics.jiraSynchronization.startSyncTime }}
          </div>
        </div>
        <div class="row-align blue-color">
          Synchronizece naposledy trvala:
          <div class="synchronization-info">
            {{ projectStatistics.jiraSynchronization.lastDuration }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { format } from 'date-fns';

export default {
  data () {
    return {
      statisticsMonthDialog: {
        isOpen: false,
        month: `${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
      },
      userInfoDialog: {
        id: null,
        previousXp: null,
        bonusXp: null,
        isOpen: false,
        sumXpProjects: null,
        sumHoursWorked: null,
      },
      expandedRowId: null,
      selectedDate: new Date(),
    };
  },
  computed: {
    ...mapState([
      'projectStatistics',
      'error',
    ]),
    headers: function () {
      const headers = [
        {
          text: 'Jméno',
          align: 'left',
          sortable: true,
          value: 'userName',
          isVisible: true,
        },
        {
          text: 'Bonus XP',
          align: 'right',
          sortable: true,
          value: 'bonusXp',
          isVisible: true,
        },
        {
          text: 'Celkem XP za projekty',
          align: 'right',
          sortable: true,
          value: 'sumXpProjects',
          isVisible: true,
        },
        {
          text: 'XP za odpracované hodiny',
          align: 'right',
          sortable: true,
          value: 'sumHoursWorked',
          isVisible: true,
        },
        {
          text: 'XP za měsíc',
          align: 'right',
          sortable: true,
          value: 'monthXp',
          isVisible: true,
        },
        {
          text: 'Celkem XP minulý měsíc',
          align: 'right',
          sortable: true,
          value: 'previousXp',
          isVisible: true,
        },
        {
          text: 'Celkem XP',
          align: 'right',
          sortable: true,
          value: 'totalXp',
          isVisible: true,
        },
        {
          text: 'Stávající level',
          align: 'right',
          sortable: true,
          value: 'currentLevel',
          isVisible: true,
        },
        {
          text: 'Nový level',
          align: 'right',
          sortable: true,
          value: 'newLevel',
          isVisible: true,
        },
        {
          text: 'Přidat bonus XP',
          align: 'center',
          sortable: false,
          value: 'addExpAction',
          isVisible: this.isAdmin(),
        },
        {
          text: '',
          align: 'center',
          sortable: false,
          value: 'expandAction',
          isVisible: true,
        },
      ];

      return headers.filter(h => h.isVisible);
    },
    expandedHeaders () {
      const projectsStandupDates = this.getProjectsStandupDates();
      let standupDate = [
        {
          text: '',
          value: '',
          isVisible: false,
        },
      ];

      if (projectsStandupDates) {
        standupDate = projectsStandupDates.map(p => ({
          text: p.date,
          align: 'text-right',
          sortable: false,
          value: p.date,
          isVisible: true,
        }));
      }

      const expandedHeaders = [
        {
          text: 'Projekty',
          align: 'text-left',
          sortable: true,
          value: 'code',
          isVisible: true,
        },
        {
          text: 'Hodiny',
          align: 'text-right',
          sortable: true,
          value: 'timeSpent',
          isVisible: true,
        },
        {
          text: 'Typ vedoucího týmu',
          align: 'text-left',
          sortable: true,
          value: 'projectExpModifierName',
          isVisible: true,
        },
        {
          text: 'koeficient',
          align: 'text-right',
          sortable: true,
          value: 'timeSpent',
          isVisible: true,
        },
        ...standupDate,
        {
          text: 'XP za projekty',
          align: 'text-right',
          sortable: true,
          value: 'projectsXp',
          isVisible: true,
        },
      ];

      return expandedHeaders.filter(h => h.isVisible);
    },

    userDetailItems () {
      const userDetail = this.projectStatistics.userStatistics.find(u => u.id === this.expandedRowId);
      return userDetail.userDetail;
    },

    checkSyncButton() {
      const selectedDate = new Date(this.selectedDate);
      selectedDate.setDate(2);

      const dateMonthAgo = new Date();
      dateMonthAgo.setMonth(dateMonthAgo.getMonth() - 1);
      dateMonthAgo.setDate(1);

      return selectedDate >= dateMonthAgo;
    },
  },
  async fetch ({ store }) {
    const now = new Date();
    const params = {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };

    await store.dispatch('getProjectStatistics', params);
  },
  methods: {
    addExp(user) {
      this.userInfoDialog = {
        id: user.id,
        previousXp: user.previousXp,
        bonusXp: user.bonusXp,
        sumXpProjects: user.sumXpProjects,
        sumHoursWorked: user.sumHoursWorked,
      };

      this.userInfoDialog.isOpen = true;
    },

    close () {
      this.userInfoDialog = {
        id: null,
        previousXp: null,
        bonusXp: null,
        sumXpProjects: null,
        sumHoursWorked: null,
        isOpen: false,
      };
      this.$store.commit('clearErrorState');
    },

    async save () {
      const [year, month] = this.statisticsMonthDialog.month.split('-');
      const d = {
        year: Number(year),
        month: Number(month),
      };

      const userBonusXp = {
        id: this.userInfoDialog.id,
        bonusXp: Number(this.userInfoDialog.bonusXp),
        totalXp: this.userInfoDialog.previousXp + Number(this.userInfoDialog.bonusXp),
        monthXp: this.userInfoDialog.sumXpProjects + this.userInfoDialog.sumHoursWorked + Number(this.userInfoDialog.bonusXp),
        date: d,
      };

      await this.$store.dispatch('addUserBonusXp', userBonusXp);
      !this.error.isVisible && this.close();
    },

    isHeroOfMonth(user) {
      return this.projectStatistics.heroesOfMonth.find(h => h.id === user);
    },

    isHeroOfGame(user) {
      return this.projectStatistics.heroesOfGame.find(h => h.id === user);
    },

    getRowId(row) {
      this.expandedRowId = row.item.id;
    },

    getProjectsStandupDates() {
      let standupDates;
      if (this.projectStatistics.standups.length > 0) {
        standupDates = this.projectStatistics.standups.map(p => ({
          date: this.formatMonth(p.date),
        }));
      }

      return standupDates;
    },

    async fetchJiraData() {
      const [year, month] = this.statisticsMonthDialog.month.split('-');
      const params = {
        date: {
          year: Number(year),
          month: Number(month),
        },
        status: 1,
      };

      await this.$store.dispatch('getJiraData', params);
    },

    formatMonth (date) {
      const d = new Date(date);

      return format(d, 'DD. MM.');
    },

    updateMonth (monthInput) {
      if (!this.statisticsMonthDialog.month) {
        this.statisticsMonthDialog.isOpen = false;
        return;
      }

      monthInput.save(this.statisticsMonthDialog.month);
      this.selectedDate = this.statisticsMonthDialog.month;

      const [year, month] = this.statisticsMonthDialog.month.split('-');
      const selectedDate = {
        year: Number(year),
        month: Number(month),
      };

      this.$store.dispatch('getProjectStatistics', selectedDate);
      this.statisticsMonthDialog.isOpen = false;
    },
  },
};
</script>

<style scoped>
  .fullscreen {
    width: 100%;
    height: 100%;
  }

  .hero-element {
    color: #0091EA;
    font-weight: bold;
  }

  .element {
    font-size: 1.3em !important;
  }

  .month-picker {
    margin-right: 20px;
  }

  .standup-button {
    background-color: #1976D2 !important;
  }

  .full-height {
    height: 100%;
  }

  .synchronization-info-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .column-align {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  .row-align {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: row;
  }

  .blue-color {
    color: #0091EA;
  }

  .header {
    font-size: 2em !important;
  }

  .synchronization-info {
    font-weight: bold;
    margin-left: 0.5rem;
  }

  .expanded-row {
    cursor: pointer !important;
  }

  .expanded-row-body {
    border-bottom: 1px solid rgba(0,0,0,.12);
    border-top: 1px solid rgba(0,0,0,.12);
  }

  .no-available-data {
    display: flex;
    justify-content: center;
    color: rgba(0,0,0,.38);
    height: 48px;
    align-items: center;
  }

  .border-bottom {
    border-bottom: 1px solid rgba(0,0,0,.12) !important;
  }

</style>
