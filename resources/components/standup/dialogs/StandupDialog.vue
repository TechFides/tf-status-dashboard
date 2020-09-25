<template>
  <v-dialog
    v-model="isOpen"
    max-width="500px"
    :persistent="true"
  >
    <v-card>
      <v-card-title>
        <span class="headline">{{ standupDialogTitle }}</span>
      </v-card-title>
      <v-card-text style="max-height: 800px">
        <v-row class="pl-2 pr-4">
          <DatePicker
            v-model="standupDialog.date"
            label="Datum standupu"
            required
            :min="getMinDate()"
            :clearable="false"
          />
        </v-row>
        <v-row class="pl-2 pr-4">
          <v-alert
            transition="fade-transition"
            :value="errors.error.isVisible"
            type="error"
            color="red darken-2"
          >
            {{ errors.error.message }}
          </v-alert>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="blue darken-1"
          text
          @click.native="resetStandup"
        >
          Zavřít
        </v-btn>
        <v-btn
          color="blue darken-1"
          text
          @click.native="save"
        >
          Uložit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import DatePicker from '../../common/DatePicker';
import { mapState } from 'vuex';
import moment from 'moment';

export default {
  name: 'StandupDialog',
  components: {
    DatePicker,
  },
  data() {
    return {
      isOpen: false,
      standupDialog: {
        id: null,
        date: null,
        selectedDate: null,
      },
    };
  },
  computed: {
    ...mapState(['errors']),
    standupDialogTitle() {
      return this.standupDialog.id ? 'Upravení standupu' : 'Přidání standupu';
    },
  },
  methods: {
    openDialog(standup) {
      this.isOpen = true;
      if (standup) {
        this.standupDialog = {
          id: standup.id,
          date: moment(standup.date).format('YYYY-MM-DD'),
          selectedDate: this.selectedDate,
        };
      } else {
        this.standupDialog = {
          isOpen: true,
          date: moment().format('YYYY-MM-DD'),
          selectedDate: this.selectedDate,
        };
      }
    },
    async save() {
      const action = this.standupDialog.id ? 'standups/editStandup' : 'standups/createStandup';
      let errorMsg = null;

      if (!this.standupDialog.date) {
        errorMsg = 'Chybí datum standupu.';
      } else if (moment().isAfter(moment(this.standupDialog.date).add(1, 'day'))) {
        errorMsg = 'Datum standupu je v minulosti.';
      }

      if (errorMsg) {
        this.$store.commit('errors/setErrorState', { message: errorMsg });
        return;
      }
      await this.$store.dispatch(action, this.standupDialog);
      this.resetStandup();
    },
    resetStandup() {
      this.$store.commit('errors/clearErrorState');
      this.isOpen = false;
      this.standupDialog = {
        date: null,
      };
    },
    getMinDate() {
      return moment().format('YYYY-MM-DD');
    },
  },
};
</script>

<style scoped></style>
