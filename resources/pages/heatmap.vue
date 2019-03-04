<template>
  <div> 
    <v-layout row reverse>
      <v-flex md1 class="pad">
        <v-dialog
          ref="dialogMonth"
          v-model="modalItem.monthPickerIsOpen"
          :return-value.sync="modalItem.heatMapMonth"
          persistent
          lazy
          full-width
          width="290px"
        >
          <v-text-field
            slot="activator"
            v-model="modalItem.heatMapMonth"
            label="Měsíc"
            append-icon="event"
            readonly
          ></v-text-field>
          <v-date-picker v-model="modalItem.heatMapMonth" scrollable type="month">
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="modalItem.monthPickerIsOpen = false">Zrušit</v-btn>
            <v-btn flat color="primary" @click="getFeedbacksforMonth($refs.dialogMonth)">OK</v-btn>
          </v-date-picker>
        </v-dialog>
      </v-flex>
    </v-layout>

    <v-layout column justify-center align-center>
      <v-data-table
        :headers='headers'
        :items='rows'
        hide-actions
        fill-height
        no-data-text="Žádná data"
        class='elevation-1 fullscreen'
      >
        <template slot="headers" slot-scope="props">
          <tr>
            <th v-for="h in props.headers">
              <div class="text-xs-center header align-project">{{ h.text }}</div>
            </th>
          </tr>
        </template>
        <template slot='items' slot-scope='{ item }'>
          <td class='text-xs-center element'>
            {{ item.fullName }}
          </td>

          <td v-for='(i, itemIndex) in item.feedbacks' :key='itemIndex' :class="getClassName(i.feedback)">
          </td>
        </template>
      </v-data-table>
    </v-layout>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  fetch ({ store, params }) {
    return Promise.all([
      store.dispatch('getFeedbacks'),
    ]);
  },
  computed: {
    ...mapState([
      'usersFeedbacks',
    ]),
    headers () {
      return [
        {
          text: 'Jméno',
          align: 'center',
          sortable: true,
          value: 'firstName',
        },
        {
          text: 'Týden 1',
          align: 'center',
          sortable: true,
          value: 'firstWeek',
        },
        {
          text: 'Týden 2',
          align: 'center',
          sortable: true,
          value: 'secondWeek',
        },
        {
          text: 'Týden 3',
          align: 'center',
          sortable: true,
          value: 'thirdWeek',
        },
        {
          text: 'Týden 4',
          align: 'center',
          sortable: true,
          value: 'fourthWeek',
        },
      ];
    },
    rows () {
      return this.usersFeedbacks.map(element => ({
        fullName: `${element.firstName} ${element.lastName}`,
        feedbacks: element.feedbacks.map(element => ({
          feedback: element.value,
        })),
      }));
    },
  },
  data () {
    return {
      modalItem: {
        heatMapMonth: null,
        monthPickerIsOpen: false,
      },
    };
  },
  methods: {
    getFeedbacksforMonth (monthInput) {
      if (!this.modalItem.heatMapMonth) {
        this.modalItem.monthPickerIsOpen = false;
        return;
      }

      monthInput.save(this.modalItem.heatMapMonth);

      const actualDate = new Date();

      const selectedDate = new Date();
      const [year, month] = this.modalItem.heatMapMonth.split('-');
      selectedDate.setFullYear(Number(year), Number(month) - 1);
      this.selectedDate = selectedDate;

      const isSameMonth = (selectedDate.getMonth() === actualDate.getMonth());
      const isSameYear = (selectedDate.getFullYear() === actualDate.getFullYear());

      this.$store.dispatch('getFeedbacks', selectedDate);

      this.modalItem.monthPickerIsOpen = false;
    },
    getClassName (value) {
      let className = 'text-xs-center element';
      switch (value) {
        case 0:
          return className;
        case 1:
          return `${className} light-green`;
        case 2:
          return `${className} green`;
        case 3:
          return `${className} yellow`;
        case 4:
          return `${className} red`;
        default:
          return '';
      }
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

.pad {
  padding-right: 2%;
}

.margin {
  margin-right: 2%;
}

.header {
  font-size: 2em !important;
}

.red {
  background-color: #FF0000;
}

.yellow {
  background-color: #FFC000;
}

.green {
  background-color: #70AD47;
}

.light-green {
  background-color: #92D050;
}
</style>
