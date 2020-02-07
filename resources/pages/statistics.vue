<template>
  <div>
    <v-layout
      row
      reverse
      align-end
    >
      <v-dialog
        v-model="dialog"
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
                      v-model="userInfo.bonusXp"
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
        @item-expanded="getRowId"
        :items-per-page="999"
        item-key="id"
        hide-default-footer
        fill-height
        single-expand
        must-sort
        class="elevation-1 fullscreen"
      >
        <template
          v-slot:item="{item, expand, isExpanded}"
        >
          <tr>
            <td class="text-center element">
              {{ item.userName }}
            </td>
            <td class="text-center element">
              {{ item.bonusXp }}
            </td>
            <td class="text-center element">
              {{ item.sumXpProjects }}
            </td>
            <td class="text-center element">
              {{ item.sumHoursWorked }}
            </td>
            <td class="text-center element">
              {{ item.XpPerMonth }}
            </td>
            <td class="text-center element">
              {{ item.totalXp }}
            </td>
            <td class="text-center element">
              {{ item.currentLevel }}
            </td>
            <td class="text-center element">
              {{ item.newLevel }}
            </td>
            <td
              class="text-center px-0"
              v-if="isAdmin()"
            >
              <v-icon
                class="mr-2"
                @click="addExp(item)"
              >
                mdi-plus
              </v-icon>
            </td>
            <td class="text-left px-0">
              <v-icon
                class="mr-2"
                @click="expand(!isExpanded)"
              >
                {{isExpanded ? "mdi-chevron-up" : "mdi-chevron-down"}}
              </v-icon>
            </td>
          </tr>
        </template>
        <template
          v-slot:expanded-item="{ headers }"
        >
          <td
            :colspan="headers.length"
          >
            <v-data-table
              :headers="expandedHeaders"
              :items="userDetailItems"
              item-key="id"
              hide-default-footer
              fill-height
              must-sort
              class="elevation-1 fullscreen"
            >
              <template
                v-slot:item="{item}"
              >
                <tr>
                  <td class="text-center">
                    {{ item.code }}
                  </td>
                  <td class="text-center">
                    {{ item.timeSpent }}
                  </td>
                  <td class="text-center">
                    {{ item.coefficient }}%
                  </td>
                  <td
                    v-for="(i, itemIndex) in item.projectRatings"
                    :key="itemIndex"
                    class="text-center"
                  >
                    {{ i.rating }}
                  </td>
                  <td class="text-center">
                    {{ item.projectsXp }}
                  </td>
                </tr>
              </template>
            </v-data-table>
          </td>
        </template>
      </v-data-table>
    </v-layout>
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
        month: null,
      },
      userInfo: {
        id: null,
        currentXp: null,
        bonusXp: null,
      },
      dialog: false,
    };
  },
  computed: {
    ...mapState([
      'projectStatistics',
      'error',
    ]),
    headers: function () {
      return [
        {
          text: 'Jméno',
          align: 'center',
          sortable: true,
          value: 'userName',
        },
        {
          text: 'Bonus XP',
          align: 'center',
          sortable: true,
          value: 'bonusXp',
        },
        {
          text: 'Celkem XP za projekty',
          align: 'center',
          sortable: true,
          value: 'projectsXp',
        },
        {
          text: 'Odpracované hodiny',
          align: 'center',
          sortable: true,
          value: 'projectsHours',
        },
        {
          text: 'XP za měsíc',
          align: 'center',
          sortable: true,
          value: 'xPPerMonth',
        },
        {
          text: 'Celkem XP',
          align: 'center',
          sortable: true,
          value: 'xPSum',
        },
        {
          text: 'Stávající level',
          align: 'center',
          sortable: true,
          value: 'actualLvl',
        },
        {
          text: 'Nový level',
          align: 'center',
          sortable: true,
          value: 'newLvl',
        },
        {
          text: 'Přidat bonus XP',
          align: 'center',
          sortable: false,
          value: 'addExpAction',
        },
        {
          text: '',
          align: 'center',
          sortable: false,
          value: 'expandAction',
        },
      ];
    },
    expandedHeaders () {
      const projectsStandupDates = this.getProjectsStandupDates();
      const standupDate = projectsStandupDates.map(p => ({
        text: p.date,
        align: 'center',
        sortable: false,
        value: p.date,
      }));

      return [
        {
          text: 'Projekty',
          align: 'center',
          sortable: true,
          value: 'projectCode',
        },
        {
          text: 'Hodiny',
          align: 'center',
          sortable: true,
          value: 'timeSpent',
        },
        {
          text: 'koeficient',
          align: 'center',
          sortable: true,
          value: 'timeSpent',
        },
        ...standupDate,
        {
          text: 'XP za projekty',
          align: 'center',
          sortable: true,
          value: 'projectsXp',
        },
      ];
    },

    userDetailItems () {
      const userDetail = this.projectStatistics.userStatistics.filter(u => u.id === this.expandedRowId);

      return userDetail[0].userDetail;
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
      this.userInfo = {
        id: user.id,
        currentXp: user.currentXp,
      };

      this.dialog = true;
    },

    close () {
      this.dialog = false;
      this.userInfo = {
        id: null,
        currentXp: null,
        bonusXp: null,
      };
      this.$store.commit('clearErrorState');
    },

    async save () {
      const userBonusXp = {
        id: this.userInfo.id,
        bonusXp: Number(this.userInfo.bonusXp),
        totalXp: this.userInfo.currentXp + Number(this.userInfo.bonusXp),
        date: new Date(),
      };

      await this.$store.dispatch('addUserBonusXp', userBonusXp);
      !this.error.isVisible && this.close();
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

  .element {
    font-size: 1.3em !important;
  }

  .month-picker {
    margin-right: 20px;
  }

  .header {
    font-size: 2em !important;
  }
</style>
