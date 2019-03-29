<template>
  <div> 
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

          <td v-for='(i, itemIndex) in item.feedbacks' :key='itemIndex' :class="getClassName(i.value)">
          </td>
        </template>
      </v-data-table>
    </v-layout>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { parse, format, addWeeks, setDay, setHours, getHours } from 'date-fns';
import {FEEDBACKS} from '../constants';

export default {
  fetch ({ store, params }) {
    return store.dispatch('getFeedbackData');
  },
  computed: {
    ...mapState([
      'usersFeedbacks',
      'heatmapWeeks',
    ]),
    headers () {
      const heatmapWeeks = this.heatmapWeeks.map(h => ({
        text: this.formatDate(h.date),
        align: 'center',
        sortable: true,
        value: h.date,
      }));

      return [
        {
          text: 'Jméno',
          align: 'center',
          sortable: true,
          value: 'firstName',
        },
        ...heatmapWeeks,
      ];
    },
    rows () {
      return this.usersFeedbacks.map(element => ({
        fullName: `${element.first_name} ${element.last_name}`,
        feedbacks: this.getFeedbacks(element),
      }));
    },
  },
  methods: {
    formatDate (date) {
      const d = new Date(date);

      return format(d, 'DD/MM/YYYY');
    },
    getFeedbacks (userFeedback) {
      return this.heatmapWeeks.map(w => ({
        userFeedbackId: userFeedback.id,
        weekId: w.id,
        value: userFeedback.feedback[w.id] || 0,
      }));
    },
    getClassName (value) {
      let className = 'text-xs-center element';
      switch (value) {
        case FEEDBACKS.NEUTRAL:
          return className;
        case FEEDBACKS.AMAZING:
          return `${className} light-green`;
        case FEEDBACKS.GOOD:
          return `${className} green`;
        case FEEDBACKS.BAD:
          return `${className} yellow`;
        case FEEDBACKS.HORIBLE:
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