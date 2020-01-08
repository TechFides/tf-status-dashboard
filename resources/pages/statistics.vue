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
        item-key="projectId"
        hide-default-footer
        fill-height
        must-sort
        class="elevation-1 fullscreen"
      >
        <template
          v-slot:item="props"
        >
          <tr>
            <td class="text-center element">
              {{ props.item.projectCode }}
            </td>
            <td class="text-center element">
              {{ props.item.exps }}
            </td>
          </tr>
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
          text: 'Projekt',
          align: 'center',
          sortable: true,
          value: 'projectCode',
        },
        {
          text: 'Expy za měsíc',
          align: 'center',
          sortable: true,
          value: 'exps',
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
