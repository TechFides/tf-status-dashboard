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

export default {
  computed: {
    ...mapState([
      'feedbacks',
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
      return this.feedbacks.map(element => ({
        fullName: element.name,
        feedbacks: element.values.map(element => ({
          value: element,
        })),
      }));
    },
  },
  data () {
    return {
      entityBackgroudColor: null,
    };
  },
  methods: {
    getClassName (value) {
      let className = 'text-xs-center element';
      switch (value) {
        case 0:
          return className;
        case 1:
          return `${className} red`;
        case 2:
          return `${className} yellow`;
        case 3:
          return `${className} blue`;
        case 4:
          return `${className} green`;
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
  background-color: brown;
}

.yellow {
  background-color: yellow;
}

.green {
  background-color: green;
}

.blue {
  background-color: blue;
}
</style>
