<template>
  <div width="100%" class="fill-height">
    <v-row justify="end">
      <v-btn color="green darken-2" dark class="mt-2 mr-5 mb-2" @click="createNewWorkLog()">
        <i class="material-icons">add</i>
        <span class="pl-2"> Zalogovat čas </span>
      </v-btn>
    </v-row>
    <WorkLogDialog ref="workLogDialog" :confirm="resetFilters" />
    <v-card class="elevation-1">
      <v-row justify="start">
        <v-col v-if="isAdministration()" cols="2" class="ml-5">
          <v-select v-model="filter.authorId" :items="authorItems" label="Autor" clearable />
        </v-col>
        <v-col cols="2" class="ml-5">
          <v-select v-model="filter.costCategoryId" :items="costCategoryItems" label="Kategorie" clearable />
        </v-col>
        <v-col cols="auto">
          <v-radio-group class="mt-0 pl-4" hide-details :column="false" v-model="filter.dateRange">
            <v-radio
              v-for="option of dateRangeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
              class="mr-2"
            />
            <v-radio value="dates">
              <template v-slot:label>
                <DatePicker
                  v-model="filter.dates"
                  :disabled="filter.dateRange !== 'dates'"
                  label="Zahájení práce"
                  :clearable="false"
                  required
                  range
                />
              </template>
            </v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-alert border="right" color="green lighten-1" class="ma-2">
            Celkem odpracovaný čas za zvolené období: <b>{{ workLogs.timeSpentSum }}</b>
          </v-alert>
        </v-col>
      </v-row>
      <v-data-table
        :headers="headers"
        :items="workLogs.items"
        :items-per-page="100"
        :footer-props="{ 'items-per-page-options': [20, 50, 100, -1] }"
        item-key="id"
        fill-height
        single-expand
        must-sort
        class="elevation-1 fullscreen"
      >
        <template v-slot:item="{ item }">
          <tr>
            <td v-if="isAdministration()" class="text-left element pr-8">
              {{ item.author.fullName }}
            </td>
            <td class="text-left element pr-8">
              {{ item.started }}
            </td>
            <td class="text-right element pr-8">
              {{ item.timeSpent }}
            </td>
            <td class="text-left element">
              {{ item.description }}
            </td>
            <td class="text-left element">
              {{ item.costCategory.name }}
            </td>
            <td class="justify-center layout px-0">
              <v-icon small @click.stop="editItem(item)"> edit </v-icon>
              <v-icon small class="ml-2" @click.stop="deleteItem(item)"> delete </v-icon>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
    <v-row>
      <v-col cols="6" class="time-spent-sum pl-6" />
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import WorkLogDialog from '../components/workLogs/dialogs/WorkLogDialog';
import DatePicker from '../components/common/DatePicker';
import moment from 'moment';

export default {
  name: 'WorkLogs',
  components: {
    WorkLogDialog,
    DatePicker,
  },
  data() {
    return {
      filter: {
        authorId: '',
        costCategoryId: '',
        dates: [moment().startOf('month').format('YYYY-MM-DD'), moment().endOf('month').format('YYYY-MM-DD')],
        dateRange: 'currentMonth',
      },
      defaultFilter: {
        authorId: '',
        costCategoryId: '',
        dates: [moment().startOf('month').format('YYYY-MM-DD'), moment().endOf('month').format('YYYY-MM-DD')],
        dateRange: 'currentMonth',
      },
      expandedRowId: null,
      dateRangeOptions: [
        {
          label: 'Minulý týden',
          value: 'lastWeek',
        },
        {
          label: 'Aktuální týden',
          value: 'currentWeek',
        },
        {
          label: 'Minulý měsíc',
          value: 'lastMonth',
        },
        {
          label: 'Aktuální měsíc',
          value: 'currentMonth',
        },
      ],
    };
  },
  computed: {
    ...mapState(['workLogs', 'users', 'costCategories']),
    headers() {
      const headers = [
        {
          text: 'Autor',
          align: 'left',
          sortable: true,
          value: 'author.fullName',
          isVisible: this.isAdministration(),
        },
        {
          text: 'Zahájení práce',
          align: 'left',
          sortable: true,
          value: 'startedByNumber',
          isVisible: true,
        },
        {
          text: 'Strávený čas',
          align: 'right',
          sortable: true,
          value: 'timeSpentByNumber',
          isVisible: true,
        },
        {
          text: 'Popis',
          align: 'left',
          sortable: true,
          value: 'description',
          isVisible: true,
        },
        {
          text: 'Kategorie',
          align: 'left',
          sortable: true,
          value: 'costCategory.name',
          isVisible: true,
        },
        {
          text: 'Akce',
          align: 'center',
          sortable: false,
          value: 'action',
          isVisible: true,
        },
      ];

      return headers.filter(h => h.isVisible);
    },
    costCategoryItems() {
      const costCategories = this.isAdministration() ? this.costCategories.all : this.costCategories.my;
      return costCategories.map(category => ({
        text: category.name,
        value: category.id,
      }));
    },
    authorItems() {
      return this.users.items.map(user => {
        if (user) {
          return {
            text: `${user.firstName} ${user.lastName}`,
            value: user.id.toString(),
          };
        }
      });
    },
    computedFilter: function () {
      return Object.assign({}, this.filter);
    },
  },
  watch: {
    computedFilter: {
      handler(newVal, oldVal) {
        if (oldVal && newVal.dateRange !== oldVal.dateRange) {
          switch (newVal.dateRange) {
            case 'lastWeek':
              this.filter.dates = [
                moment().subtract(1, 'week').startOf('week').format('YYYY-MM-DD'),
                moment().subtract(1, 'week').endOf('week').format('YYYY-MM-DD'),
              ];
              break;
            case 'currentWeek':
              this.filter.dates = [
                moment().startOf('week').format('YYYY-MM-DD'),
                moment().endOf('week').format('YYYY-MM-DD'),
              ];
              break;
            case 'lastMonth':
              this.filter.dates = [
                moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
                moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
              ];
              break;
            case 'currentMonth':
              this.filter.dates = [
                moment().startOf('month').format('YYYY-MM-DD'),
                moment().endOf('month').format('YYYY-MM-DD'),
              ];
              break;
          }
        }
        if (this.filter.dates[0] && this.filter.dates[1]) {
          this.$store.dispatch('workLogs/getWorkLogs', this.filter);
        }
      },
      deep: true,
      immediate: true,
    },
  },
  async created() {
    const actions = [
      this.$store.dispatch('workLogs/getWorkLogs', this.filter),
      this.$store.dispatch('users/getUsers'),
      this.$store.dispatch('costCategories/getMyCostCategories'),
    ];
    if (this.isAdministration()) {
      actions.push(this.$store.dispatch('costCategories/getAllCostCategories'));
    }
    await Promise.all(actions);
  },
  methods: {
    async deleteItem(item) {
      const confirmed = confirm(`Opravdu chcete smazat tento worklog?`);

      if (confirmed) {
        await this.$store.dispatch('workLogs/deleteWorkLog', item.id);
      }
    },
    resetFilters() {
      this.filter = { ...this.defaultFilter };
    },
    createNewWorkLog() {
      this.$refs.workLogDialog.openDialog();
    },
    editItem(item) {
      this.$refs.workLogDialog.openDialog(item);
    },
  },
};
</script>

<style scoped>
.time-spent-sum {
  font-weight: bold;
  font-size: 1.3rem;
}
</style>
