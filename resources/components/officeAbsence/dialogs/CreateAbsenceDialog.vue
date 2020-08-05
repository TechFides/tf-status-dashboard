<template>
  <v-dialog
    v-model="show"
    max-width="700"
    scrollable
    persistent
    @keydown.esc="cancelDialog"
  >
    <v-card>
      <v-card-title class="headline pl-3 systemPrimary">
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
          <v-row>
            <v-col cols="4">
              <DatePicker
                v-model="dialogData.absenceStart"
                label="Zahájení nepřítomnosti"
                required
              />
            </v-col>
            <v-col cols="4">
              <DatePicker
                v-model="dialogData.absenceEnd"
                :min="dialogData.absenceStart"
                label="Ukončení nepřítomnosti"
                required
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
          <v-row>
            <v-col
              cols="6"
              class="pl-11"
            >
              <v-select
                v-model="dialogData.absenceType"
                :items="absenceTypeEnumItems"
                label="Typ nepřítomnosti"
                :rules="[rules.required]"
                clearable
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
                clearable
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="pl-11"
            >
              <v-textarea
                v-model="dialogData.description"
                label="Popis nepřítomnsoti"
              />
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
            Uložit
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
          absenceType: '',
          description: '',
          approver: '',
          absenceHoursNumber: null,
        },
        defaultDialogData: {
          absenceStart: '',
          absenceEnd: '',
          absenceType: '',
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
      ]),
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
      dialogData: {
        handler() {
          const startDay = moment(this.dialogData.absenceStart);
          const endDay = moment(this.dialogData.absenceEnd).add(1, 'day');

          if ((this.dialogData.absenceStart && this.dialogData.absenceEnd) &&
            startDay.isBefore(endDay)
          ) {
            this.dialogData.absenceHoursNumber = endDay.diff(startDay, 'days') * 8;
          }
        },
        deep: true,
      },
    },
    methods: {
      openDialog() {
        this.dialogData.userId = this.auth.user.id;
        this.show = true;
      },
      async confirmDialog () {
        if (this.$refs.form.validate()) {
          await this.$store.dispatch('createOfficeAbsence', this.dialogData);
          this.cancelDialog();
        }
      },
      cancelDialog () {
        this.dialogData = { ...this.defaultDialogData };
        this.$refs.form.resetValidation();
        this.show = false;
      },
    },
  };
</script>

<style scoped>

</style>
