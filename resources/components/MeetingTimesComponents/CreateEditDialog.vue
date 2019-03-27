<template>
  <v-dialog v-model="isOpen" max-width="550px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ title }}</span>
      </v-card-title>

      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap column>
            <v-flex xs12 sm6 md4>
              <v-text-field
                :rules="[]"
                v-bind:value="dialogData.name"
                v-on:input="$emit('name:change', $event)"
                label="Název"
              ></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-select
                :items="weekDays"
                v-bind:value="dialogData.weekDay"
                v-on:input="$emit('weekday:change', $event)"
                label="Den v týdnu"
              >
              </v-select>
            </v-flex>
            <v-flex xs12 sm6 md4 class="time-picker">
              <v-time-picker
                landscape
                format="24hr"
                v-bind:value="dialogData.time"
                v-on:input="$emit('time:change', $event)"
              ></v-time-picker>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click="close">Zrušit</v-btn>
        <v-btn color="blue darken-1" flat @click="submit">Uložit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import {WEEK_DAYS} from '../../constants/index';

  export default {
    name: 'CreateEditDialog',
    props: ['isOpen', 'close', 'submit', 'dialogData', 'title'],
    data () {
      return {
        weekDays: WEEK_DAYS,
      };
    },
  };
</script>

<style>
  .time-picker {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
</style>
