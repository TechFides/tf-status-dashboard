<template>
  <div>
    <v-layout column justify-center align-center>
      <v-data-table
        :headers="headers"
        :items="rows"
        :items-per-page="999"
        hide-default-footer
        fill-height
        no-data-text="Žádná data"
        class="elevation-1 fullscreen"
        :sort-by="sortBy"
        :custom-sort="customSort"
      >
        <template v-slot:item="props">
          <tr>
            <th v-for="h in props.headers" :key="h.text">
              <div class="text-center header align-project">
                {{ h.text }}
              </div>
            </th>
          </tr>
        </template>
        <template v-slot:item="props">
          <tr>
            <td class="text-center element">
              {{ props.item.fullName }}
            </td>

            <td v-for="(i, itemIndex) in props.item.feedbacks" :key="itemIndex" :class="getClassName(i.value)" />
          </tr>
        </template>
      </v-data-table>
    </v-layout>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { format } from 'date-fns';
import { FEEDBACKS } from '../constants';

export default {
  data() {
    return {
      sortBy: 'firstName',
    };
  },
  computed: {
    ...mapState(['usersFeedbacks', 'heatmap']),
    headers() {
      const heatmapWeeks = this.heatmap.items.map(h => ({
        text: this.formatDate(h.date),
        align: 'center',
        sortable: false,
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
    rows() {
      return this.heatmap.usersFeedbacks.map(element => ({
        fullName: `${element.first_name} ${element.last_name}`,
        feedbacks: this.getFeedbacks(element),
      }));
    },
  },
  fetch({ store, params }) {
    return store.dispatch('heatmap/getFeedbackData');
  },
  methods: {
    formatDate(date) {
      const d = new Date(date);

      return format(d, 'DD/MM/YYYY');
    },
    getFeedbacks(userFeedback) {
      return this.heatmap.items.map(w => ({
        userFeedbackId: userFeedback.id,
        weekId: w.id,
        value: userFeedback.feedback[w.id] || 0,
      }));
    },
    getClassName(value) {
      let className = 'text-xs-center element';
      switch (value) {
        case FEEDBACKS.GOOD:
          return `${className} good`;
        case FEEDBACKS.OK:
          return `${className} ok`;
        case FEEDBACKS.BAD:
          return `${className} bad`;
        default:
          return '';
      }
    },
    customSort(items, index, isDesc) {
      items.sort((a, b) => {
        if (index[0] === 'firstName') {
          if (!isDesc[0]) {
            return a.fullName.localeCompare(b.fullName, 'cs');
          } else {
            return b.fullName.localeCompare(a.fullName, 'cs');
          }
        } else {
          if (!isDesc[0]) {
            return a[index[0]] < b[index[0]] ? -1 : 1;
          } else {
            return b[index[0]] < a[index[0]] ? -1 : 1;
          }
        }
      });
      return items;
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

.pad {
  padding-right: 2%;
}

.margin {
  margin-right: 2%;
}

.header {
  font-size: 2em !important;
}

.good {
  background-color: #0dd145;
}

.ok {
  background-color: #3598db;
}

.bad {
  background-color: #ffb327;
}

.light-green {
  background-color: #92d050;
}
</style>
