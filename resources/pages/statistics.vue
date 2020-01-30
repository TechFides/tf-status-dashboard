<template>
  <div>
    <v-layout
      row
      reverse
      align-end
    >
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
        :items="projectStatistics"
        :expanded.sync="expanded"
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
              {{ item.userName }}
            </td>
            <td class="text-center element">
              {{ item.userName }}
            </td>
            <td class="text-center element">
              {{ item.userName }}
            </td>
            <td class="text-center element">
              {{ item.userName }}
            </td>
            <td class="text-center element">
              {{ item.userName }}
            </td>
            <td class="text-center px-0">
              <v-icon
                class="mr-2"
                @click="getProjectsStandupDates()"
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
          v-slot:expanded-item="{ headers}"
        >
          <td
            :colspan="headers.length"
          >
            <v-data-table
              :headers="expandedHeaders"
              :items="projectStatistics"
              item-key="id"
              hide-default-footer
              fill-height
              must-sort
              class="elevation-1 fullscreen"
            >
              <template
                v-slot:item="{item}"
              >
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

export default {
  data () {
    return {
      expanded: [],
      statisticsMonthDialog: {
        isOpen: false,
        month: null,
      },
    };
  },
  computed: {
    ...mapState([
      'projectStatistics',
    ]),
    headers: function () {
      return [
        {
          text: 'Jméno',
          align: 'center',
          sortable: true,
          value: 'projectCode',
        },
        {
          text: 'Extra XP',
          align: 'center',
          sortable: true,
          value: 'exps',
        },
        {
          text: 'XP za měsíc',
          align: 'center',
          sortable: true,
          value: 'exps',
        },
        {
          text: 'Celkem XP',
          align: 'center',
          sortable: true,
          value: 'exps',
        },
        {
          text: 'Stávající level',
          align: 'center',
          sortable: true,
          value: 'exps',
        },
        {
          text: 'Nový level',
          align: 'center',
          sortable: true,
          value: 'exps',
        },
        {
          text: 'Přidat extra XP',
          align: 'center',
          sortable: false,
          value: 'actions',
        },
        {
          text: '',
          align: 'center',
          sortable: false,
          value: 'expand',
        },
      ];
    },
    expandedHeaders () {
      const projectsStandupDates = this.getProjectsStandupDates();
      const standupDate = projectsStandupDates.map(p => ({
        text: p.date,
        align: 'center',
        sortable: false,
        value: p.week,
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
  },
  async fetch ({ store }) {
    const now = new Date();
    const params = {
      month: now.getMonth(),
      year: now.getFullYear(),
    };

    await store.dispatch('getProjectStatistics', params);
  },
  methods: {
    addExp() {
      console.log(this.expanded);
    },

    getProjectsStandupDates() {
      const filteredUserStatistics = this.projectStatistics.filter(userStat => userStat.id === this.expanded[0].id);
      const standupDates = filteredUserStatistics[0].project[0].projectRating.map(p => ({
        date: p.date,
      }));

      return standupDates;
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
        month: Number(month) - 1,
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
