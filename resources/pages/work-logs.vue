<template>
  <div
    width="100%"
    class="fill-height"
  >
    <v-row justify="end">
      <v-btn
        color="blue darken-2"
        dark
        class="mt-2 mr-5 mb-2"
        @click="createNewWorkLog()"
      >
        <i class="material-icons">add</i>
        <span class="pl-2">
          Zalogovat čas
        </span>
      </v-btn>
    </v-row>
    <WorkLogDialog
      ref="workLogDialog"
    />
    <v-card class="elevation-1">
      <v-row
        justify="start"
      >
        <v-col
          v-if="isAdmin()"
          cols="2"
          class="ml-5"
        >
          <v-select
            v-model="filter.authorId"
            :items="authorItems"
            label="Autor"
            clearable
          />
        </v-col>
        <v-col
          cols="2"
          class="ml-5"
        >
          <v-select
            v-model="filter.costCategoryId"
            :items="costCategoryItems"
            label="Kategorie"
            clearable
          />
        </v-col>
        <v-col cols="2">
          <DatePicker
            v-model="filter.dates"
            label="Zahájení práce"
            :clearable="false"
            required
            range
          />
        </v-col>
      </v-row>
      <v-data-table
        :headers="headers"
        :items="workLogs.items"
        :items-per-page="100"
        :footer-props="{'items-per-page-options': [20, 50, 100, -1]}"
        item-key="id"
        fill-height
        single-expand
        must-sort
        class="elevation-1 fullscreen"
      >
        <template
          v-slot:item="{item}"
        >
          <tr>
            <td
              v-if="isAdmin()"
              class="text-left element pr-8"
            >
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
              <v-icon
                small
                @click.stop="editItem(item)"
              >
                edit
              </v-icon>
              <v-icon
                small
                class="ml-2"
                @click.stop="deleteItem(item)"
              >
                delete
              </v-icon>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
    <v-row>
      <v-col
        cols="6"
        class="time-spent-sum pl-6"
      >
        Celkem odpracovaný čas za zvolené období: {{ workLogs.timeSpentSum }}
      </v-col>
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
    data () {
      return {
        filter: {
          authorId: '',
          costCategoryId: '',
          dates: [
            moment().startOf('month').format('YYYY-MM-DD'),
            moment().endOf('month').format('YYYY-MM-DD'),
          ],
        },
        expandedRowId: null,
      };
    },
    computed: {
      ...mapState([
        'workLogs',
        'users',
        'costCategories',
      ]),
      headers () {
        const headers = [
          {
            text: 'Autor',
            align: 'left',
            sortable: true,
            value: 'author.fullName',
            isVisible: this.isAdmin(),
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
      costCategoryItems () {
        return this.costCategories.items.map(c => ({
          text: c.name,
          value: c.id,
        }));
      },
      authorItems () {
        return this.users.items.map(user => ({
          text: `${user.firstName} ${user.lastName}`,
          value: user.id.toString(),
        }));
      },
    },
    watch: {
      filter: {
        handler() {
          if (this.filter.dates[0] && this.filter.dates[1]) {
            this.$store.dispatch('workLogs/getWorkLogs', this.filter);
          }
        },
        deep: true,
      },
    },
    async created() {
      await Promise.all([
        this.$store.dispatch('workLogs/getWorkLogs', this.filter),
        this.$store.dispatch('users/getUsers'),
        this.$store.dispatch('costCategories/getCostCategories'),
      ]);
    },
    methods: {
      async deleteItem(item) {
        const confirmed = confirm(`Opravdu chcete smazat tento worklog?`);

        if (confirmed) {
          await this.$store.dispatch('workLogs/deleteWorkLog', item.id);
        }
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
