<template>
  <v-dialog v-model="show" max-width="770" persistent @keydown.esc="cancelDialog">
    <v-card>
      <v-card-title class="headline pl-5 systemPrimary"> Vytvořit novou žádost o nepřítomnost </v-card-title>
      <v-form ref="form" lazy-validation @submit.prevent>
        <v-card-text class="card-text">
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
            <v-col cols="4">
              <v-text-field
                v-model="dialogData.absenceHoursNumber"
                type="number"
                :rules="[rules.required, rules.minValue]"
                label="Počet hodin nepřítomnosti"
              />
            </v-col>
          </v-row>
          <v-row class="pr-6">
            <v-col cols="6" class="pl-11">
              <v-select
                v-model="dialogData.absenceType"
                :items="absenceTypeEnumItems"
                label="Typ nepřítomnosti"
                :rules="[rules.required]"
              />
            </v-col>
            <v-col cols="6" class="pl-9">
              <v-select
                v-model="dialogData.approver"
                :items="approverItems"
                label="Schvalovatel"
                :rules="[rules.required]"
                no-data-text="Žádná data k dispozici."
              />
            </v-col>
          </v-row>
          <v-row class="pr-6">
            <v-col class="pt-0 pl-11 pr-8">
              <v-tooltip v-model="showGeneralDescriptionTooltip" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-textarea
                    v-model="dialogData.generalDescription"
                    v-bind="attrs"
                    rows="2"
                    label="Obecný popis"
                    v-on="on"
                    @focus="showGeneralDescriptionTooltip = !showGeneralDescriptionTooltip"
                  />
                </template>
                <span>Tato informace bude přístupná všem v google kalendáři a ve Slacku</span>
              </v-tooltip>
            </v-col>
            <v-col class="pt-0">
              <v-tooltip v-model="showApproverDescriptionTooltip" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-textarea
                    v-model="dialogData.approverDescription"
                    v-bind="attrs"
                    rows="2"
                    label="Popis pro schvalovatele"
                    v-on="on"
                    @focus="showApproverDescriptionTooltip = !showApproverDescriptionTooltip"
                  />
                </template>
                <span>Tuhle informaci uvidí pouze zvolený schvalovatel</span>
              </v-tooltip>
            </v-col>
          </v-row>
          <v-row justify="center">
            <v-col v-if="gif.url" class="pa-0 pb-8" cols="6">
              <div class="gif">
                <iframe
                  :src="gif.url"
                  width="100%"
                  height="100%"
                  style="position: absolute"
                  frameBorder="0"
                  class="giphy-embed"
                  allowFullScreen
                />
              </div>
            </v-col>
          </v-row>
          <v-row class="pr-6">
            <v-col class="pl-11 pt-0 pb-0">
              <v-alert icon="mdi-alert-circle-outline" border="right" color="green lighten-1">
                Nezapomeň si zkontrolovat, jestli sedí počet hodin nepřítomnosti. Ve výpočtu nejsou zahrnuty svátky,
                jiné nepracovní dny a zkrácené úvazky.
              </v-alert>
            </v-col>
          </v-row>
          <v-row class="pr-6">
            <v-col class="pl-11 pt-0 pb-0">
              <v-alert transition="fade-transition" :value="errors.error.isVisible" type="error" color="red darken-2">
                {{ errors.error.message }}
              </v-alert>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="blue darken-1" text @click.native="cancelDialog"> Zrušit </v-btn>
          <v-btn color="blue darken-2" dark @click.native="confirmDialog"> Potvrdit </v-btn>
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
  data() {
    return {
      show: false,
      showApproverDescriptionTooltip: false,
      showGeneralDescriptionTooltip: false,
      gif: {
        url: '',
      },
      gifTagEnum: ['', 'home office', 'holiday', 'work trip', 'holiday'],
      dialogData: {
        userId: null,
        absenceStart: '',
        absenceEnd: '',
        absenceType: DEFAULT_ABSENCE_TYPE,
        generalDescription: '',
        approverDescription: '',
        approver: '',
        absenceHoursNumber: null,
      },
      defaultDialogData: {
        absenceStart: '',
        absenceEnd: '',
        absenceType: DEFAULT_ABSENCE_TYPE,
        generalDescription: '',
        approverDescription: '',
        approver: '',
        absenceHoursNumber: null,
      },
      defaultGif: {
        url: '',
      },
      defaultSelectItems: [],
      rules: {
        required: value => !!value || 'Povinné.',
        minValue: value => value > 0 || 'Hodnota musí být větší jak 0.',
      },
    };
  },
  computed: {
    ...mapState(['officeAbsences', 'auth', 'errors', 'gifs']),
    absenceStart() {
      return this.dialogData.absenceStart;
    },
    absenceEnd() {
      return this.dialogData.absenceEnd;
    },
    absenceType() {
      return this.dialogData.absenceType;
    },
    approverItems() {
      return this.officeAbsences.approvers.length
        ? this.officeAbsences.approvers.map(approver => ({
            text: `${approver.firstName} ${approver.lastName}`,
            value: approver.id,
          }))
        : this.defaultSelectItems;
    },
    absenceTypeEnumItems() {
      return this.officeAbsences.absenceTypeEnums.map(absenceTypeEnum => ({
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
    async absenceType() {
      await this.loadGif();
    },
  },
  methods: {
    async loadGif() {
      const params = {
        q: this.gifTagEnum[this.dialogData.absenceType],
        limit: 10,
        api_key: process.env.NUXT_ENV_GIPHY_API_TOKEN,
      };
      await this.$store.dispatch('gifs/getRandomGif', params);

      this.gif = this.gifs.items[Math.floor(Math.random() * this.gifs.items.length)];
    },
    openDialog() {
      if (this.officeAbsences.approvers.length) {
        const priorityApprover = this.officeAbsences.approvers.find(a => a.priority);
        const secondaryApprover = this.officeAbsences.approvers.find(a => !a.priority);

        this.dialogData.approver = priorityApprover ? priorityApprover.id : secondaryApprover.id;
      }

      this.dialogData.userId = this.auth.user.id;
      this.show = true;
      this.gif = this.defaultGif;
    },
    async confirmDialog() {
      if (this.$refs.form.validate()) {
        await this.$store.dispatch('officeAbsences/createOfficeAbsence', this.dialogData);

        !this.errors.error.isVisible && this.cancelDialog();
      }
    },
    cancelDialog() {
      this.dialogData = { ...this.defaultDialogData };
      this.$refs.form.resetValidation();
      this.show = false;
      this.$store.commit('errors/clearErrorState');
    },
    countAbsenceHoursNumber() {
      const startDay = moment(this.dialogData.absenceStart);
      const endDay = moment(this.dialogData.absenceEnd).add(1, 'day');

      if (this.dialogData.absenceStart && this.dialogData.absenceEnd && startDay.isBefore(endDay)) {
        const numberOfWeekendDays = this.countNumberOfWeekendDays(
          this.dialogData.absenceStart,
          this.dialogData.absenceEnd,
        );
        this.dialogData.absenceHoursNumber = endDay.diff(startDay, 'days') * 8 - numberOfWeekendDays * 8;
      }
    },
    countNumberOfWeekendDays(startDay, endDay) {
      let numberOfWeekendDays = 0;
      const sDay = moment(startDay);
      const eDay = moment(endDay).add(1, 'day');

      while (sDay.isBefore(eDay)) {
        const day = sDay.day();

        if (day === 6 || day === 0) {
          numberOfWeekendDays++;
        }
        sDay.add(1, 'day');
      }
      return numberOfWeekendDays;
    },
    allowedDates(val) {
      if (moment(val).day() !== 0 && moment(val).day() !== 6) {
        return val;
      }
    },
  },
};
</script>

<style scoped>
.gif {
  width: 100%;
  height: 0;
  padding-bottom: 50%;
  position: relative;
}

.card-text {
  height: 560px;
  overflow: auto;
}
</style>
