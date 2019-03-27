<template>
  <div>
    <v-btn @click="$emit('toggle-dialog-visibility')" color="primary" dark>
      <i class="material-icons">add</i>
      NOVÝ ČAS KONÁNÍ SITDOWNU
    </v-btn>

    <v-dialog v-model="dialog.isOpen" max-width="550px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ dialog.title }}</span>
        </v-card-title>

        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap column>
              <v-flex xs12 sm6 md4>
                <v-text-field
                  v-bind:value="dataForSubmit.name"
                  v-on:input="updateName"
                  label="Název"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-select
                  :items="weekDays"
                  v-bind:value="dataForSubmit.weekDay"
                  v-on:input="updateWeekDay"
                  label="Den v týdnu"
                >
                </v-select>
              </v-flex>
              <v-flex xs12 sm6 md4 class="time-picker">
                <v-time-picker
                  landscape
                  format="24hr"
                  v-bind:value="dataForSubmit.time"
                  v-on:input="updateTime"
                ></v-time-picker>
              </v-flex>
            </v-layout>

            <v-alert
              transition="fade-transition"
              :value="error.isVisible"
              type="error"
            >
              {{ error.message }}
            </v-alert>

          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="$emit('toggle-dialog-visibility')">Zrušit</v-btn>
          <v-btn color="blue darken-1" flat @click="$emit('submit', dataForSubmit)">Uložit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import { WEEK_DAYS } from '../../constants';
  import { mapState } from 'vuex';

  export default {
    name: 'CreateEditDialog',
    props: ['dialog'],
    computed: {
      ...mapState([
        'meetingTimes',
        'error',
      ]),
    },
    data () {
      return {
        weekDays: WEEK_DAYS,
        dataForSubmit: {
          name: '',
          weekDay: '',
          time: '',
        },
      };
    },
    methods: {
      updateName (value) {
        this.dataForSubmit.name = value;
      },
      updateTime (value) {
        this.dataForSubmit.time = value;
      },
      updateWeekDay (value) {
        this.dataForSubmit.weekDay = value;
      },
    },
  };
</script>

<style>
  .time-picker {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    margin-bottom: 20px;
  }
</style>
