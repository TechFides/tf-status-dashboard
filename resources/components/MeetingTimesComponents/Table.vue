<template>
  <v-data-table
    :headers='headers'
    :items='meetingTimes'
    item-key="id"
    hide-actions
    fill-height
    class='elevation-1 fullscreen'
  >
    <template slot='items' slot-scope='{ item }'>
      <td class='text-xs-center element'>{{ item.name }}</td>
      <td class='text-xs-center element'>{{ item.time }}</td>
      <td class='text-xs-center element'>{{ item.week_day }}</td>
      <td class='text-xs-center element'>{{ item.projects }}</td>
      <td class="justify-center layout px-0">
        <v-icon
          small
          class="mr-2"
          @click="openEditDialog(item)"
        >
          edit
        </v-icon>
        <v-icon
          small
          @click="deleteItem(item.id)"
        >
          delete
        </v-icon>
      </td>

    </template>
  </v-data-table>
</template>

<script>
  export default {
    name: 'MeetingTimesTable',
    props: ['meetingTimes', 'deleteItem', 'openEditDialog'],
    computed: {
      headers: function () {
        return [
          {
            text: 'Název',
            align: 'center',
            sortable: false,
          },
          {
            text: 'Hodina',
            align: 'center',
            sortable: false,
          },
          {
            text: 'Den v týdnu',
            align: 'center',
            sortable: false,
          },
          {
            text: 'Projekty',
            align: 'center',
            sortable: false,
          },
          {
            text: 'Akce',
            align: 'center',
            sortable: false,
          },
        ];
      },
    },
  };
</script>

<style scoped>
  .fullscreen {
    width: 100%;
    height: 100%;
  }
</style>
