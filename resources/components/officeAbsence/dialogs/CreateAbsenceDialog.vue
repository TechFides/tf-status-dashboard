<template>
  <v-dialog
    v-model="show"
    max-width="700"
    scrollable
    persistent
    @keydown.esc="cancelDialog"
  >
    <v-card>
      <v-card-title class="headline pl-5 systemPrimary">
        Vytvořit novou žádost o nepřítomnost
      </v-card-title>
      <v-form
        ref="form"
        lazy-validation
        @submit.prevent
      >
        <v-card-text
          class="card-text"
          style="max-height: 800px"
        >
          <v-row class="pr-6">
            <v-col cols="4">
              <DatePicker
                v-model="dialogData.absenceStart"
                label="Zahájení nepřítomnosti"
                required
                :allowed-dates="allowedDates"
                :clearable="false"
              />
            </v-col>
            <v-col cols="4">
              <DatePicker
                v-model="dialogData.absenceEnd"
                :min="dialogData.absenceStart"
                :allowed-dates="allowedDates"
                label="Ukončení nepřítomnosti"
                required
                :clearable="false"
              />
            </v-col>
            <v-col
              cols="4"
            >
              <v-text-field
                v-model="dialogData.absenceHoursNumber"
                type="number"
                :rules="[rules.required, rules.minValue]"
                label="Počet hodin nepřítomnosti"
              />
            </v-col>
          </v-row>
          <v-row class="pr-6">
            <v-col
              cols="6"
              class="pl-11"
            >
              <v-select
                v-model="dialogData.absenceType"
                :items="absenceTypeEnumItems"
                label="Typ nepřítomnosti"
                :rules="[rules.required]"
              />
            </v-col>
            <v-col
              cols="6"
            >
              <v-select
                v-model="dialogData.approver"
                :items="approverItems"
                label="Schvalovatel"
                :rules="[rules.required]"
                no-data-text="Žádný data k dispozici."
              />
            </v-col>
          </v-row>
          <v-row class="pr-6">
            <v-col
              class="pl-11"
            >
              <v-textarea
                v-model="dialogData.description"
                label="Popis nepřítomnosti (tato informace bude vyplněna v google kalendáři)"
              />
            </v-col>
          </v-row>
          <v-row class="pr-6">
            <v-col
              class="pl-11 pt-0 pb-0"
            >
              <v-alert
                icon="mdi-alert-circle-outline"
                type="error"
                color="blue darken-1"
              >
                Nezapomeň si zkontrolovat, jestli sedí počet hodin nepřítomnosti.
              </v-alert>
            </v-col>
          </v-row>
          <v-row class="pr-6">
            <v-col
              class="pl-11 pt-0 pb-0"
            >
              <v-alert
                transition="fade-transition"
                :value="error.isVisible"
                type="error"
                color="red darken-2"
              >
                {{ error.message }}
              </v-alert>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            text
            @click.native="cancelDialog"
          >
            Zrušit
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click.native="confirmDialog"
          >
            Potvrdit
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  import DatePicker from '../../common/DatePicker';
  import { mapState } from 'vuex';
  import moment from 'moment';

  const DEFAULT_ABSENCE_TYPE = 2;

  export default {
    name: 'CreateAbsenceDialog',
    components: {
      DatePicker,
    },
    data () {
      return {
        show: false,
        dialogData: {
          userId: null,
          absenceStart: '',
          absenceEnd: '',
          absenceType: DEFAULT_ABSENCE_TYPE,
          description: '',
          approver: '',
          absenceHoursNumber: null,
        },
        defaultDialogData: {
          absenceStart: '',
          absenceEnd: '',
          absenceType: DEFAULT_ABSENCE_TYPE,
          description: '',
          approver: '',
          absenceHoursNumber: null,
        },
        defaultSelectItems: [],
        rules: {
          required: value => !!value || 'Povinné.',
          minValue: value => value > 0 || 'Hodnota musí být větší jak 0.',
        },
      };
    },
    computed: {
      ...mapState([
        'absenceTypeEnums',
        'approvers',
        'auth',
        'error',
      ]),
      absenceStart() {
        return this.dialogData.absenceStart;
      },
      absenceEnd() {
        return this.dialogData.absenceEnd;
      },
      approverItems () {
        return this.approvers.length ? this.approvers.map(approver => ({
          text: `${approver.firstName} ${approver.lastName}`,
          value: approver.id,
        })): this.defaultSelectItems;
      },
      absenceTypeEnumItems () {
        return this.absenceTypeEnums.map(absenceTypeEnum => ({
          text: absenceTypeEnum.value,
          value: absenceTypeEnum.id,
        }));
      },
    },
    watch: {
      absenceStart() {
        this.countAbsenceHoursNumber();
      },
      absenceEnd() {
        this.countAbsenceHoursNumber();
      },
    },
    methods: {
      openDialog() {
        if (this.approvers.length) {
          const priorityApprover = this.approvers.find(a => a.priority);
          const secondaryApprover = this.approvers.find(a => !a.priority);

          this.dialogData.approver = priorityApprover ? priorityApprover.id : secondaryApprover.id;
        }

        this.dialogData.userId = this.auth.user.id;
        this.show = true;
      },
      async confirmDialog () {
        if (this.$refs.form.validate()) {
          await this.$store.dispatch('createOfficeAbsence', this.dialogData);
          !this.error.isVisible && this.cancelDialog();
        }
      },
      cancelDialog () {
        this.dialogData = { ...this.defaultDialogData };
        this.$refs.form.resetValidation();
        this.show = false;
        this.$store.commit('clearErrorState');
      },
      countAbsenceHoursNumber () {
        const startDay = moment(this.dialogData.absenceStart);
        const endDay = moment(this.dialogData.absenceEnd).add(1, 'day');

        if ((this.dialogData.absenceStart && this.dialogData.absenceEnd) &&
          startDay.isBefore(endDay)
        ) {
          const numberOfWeekendDays = this.countNumberOfWeekendDays(this.dialogData.absenceStart, this.dialogData.absenceEnd);
          this.dialogData.absenceHoursNumber = (endDay.diff(startDay, 'days') * 8) - numberOfWeekendDays * 8;
        }
      },
      countNumberOfWeekendDays(startDay, endDay) {
        let numberOfWeekendDays = 0;
        const sDay = moment(startDay);
        const eDay = moment(endDay).add(1, 'day');

        while (sDay.isBefore(eDay)) {
          const day = sDay.day();

          if ((day === 6) || (day === 0)) {
            numberOfWeekendDays++;
          }
          sDay.add(1, 'day');
        }
        return numberOfWeekendDays;
      },
      allowedDates (val) {
        if (moment(val).day() !== 0 && moment(val).day() !== 6) {
          return val;
        }
      },
    },
  };
</script>

<style scoped>

</style>
