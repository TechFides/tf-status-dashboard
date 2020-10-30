<template>
  <v-dialog v-model="isOpen" max-width="500px" :persistent="true">
    <v-card>
      <v-card-title>
        <span class="headline">{{ sitdownDialogTitle }}</span>
      </v-card-title>
      <v-card-text style="max-height: 800px">
        <v-row class="pl-2 pr-4">
          <DatePicker
            v-model="sitdownDialog.date"
            label="Datum sitdownu"
            required
            :min="getMinDate()"
            :clearable="false"
          />
        </v-row>
        <v-row class="pl-2 pr-4">
          <v-alert transition="fade-transition" :value="errors.error.isVisible" type="error" color="red darken-2">
            {{ errors.error.message }}
          </v-alert>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click.native="resetSitdown"> Zavřít </v-btn>
        <v-btn :color="`${sitdownDialog.id ? 'blue' : 'green'} darken-2`" dark @click.native="save"> Uložit </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import DatePicker from '../../common/DatePicker';
import { mapState } from 'vuex';
import moment from 'moment';

export default {
  name: 'SitdownDialog',
  components: {
    DatePicker,
  },
  props: {
    actionAfterSubmit: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      isOpen: false,
      sitdownDialog: {
        id: null,
        date: null,
        selectedDate: null,
      },
    };
  },
  computed: {
    ...mapState(['errors']),
    sitdownDialogTitle() {
      return this.sitdownDialog.id ? 'Upravení sitdownu' : 'Přidání sitdownu';
    },
  },
  methods: {
    openDialog(sitdown) {
      this.isOpen = true;
      if (sitdown) {
        this.sitdownDialog = {
          id: sitdown.id,
          date: moment(sitdown.date).format('YYYY-MM-DD'),
          selectedDate: this.selectedDate,
        };
      } else {
        this.sitdownDialog = {
          isOpen: true,
          date: moment().format('YYYY-MM-DD'),
          selectedDate: this.selectedDate,
        };
      }
    },
    async save() {
      const action = this.sitdownDialog.id ? 'sitdowns/editSitdown' : 'sitdowns/createSitdown';
      let errorMsg = null;

      if (!this.sitdownDialog.date) {
        errorMsg = 'Chybí datum sitdownu.';
      } else if (moment().isAfter(moment(this.sitdownDialog.date).add(1, 'day'))) {
        errorMsg = 'Datum sitdownu je v minulosti.';
      }

      if (errorMsg) {
        this.$store.commit('errors/setErrorState', { message: errorMsg });
        return;
      }
      await this.$store.dispatch(action, this.sitdownDialog);
      await this.actionAfterSubmit();
      this.resetSitdown();
    },
    resetSitdown() {
      this.$store.commit('errors/clearErrorState');
      this.isOpen = false;
      this.sitdownDialog = {
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
