<template>
  <v-dialog
    v-model="show"
    max-width="500"
    scrollable
    persistent
    @keydown.esc="cancelDialog"
  >
    <v-card>
      <v-card-title class="headline pl-5 systemPrimary">
        {{ dialogType ? 'Vytvořit nový záznam práce' : 'Editovat záznam práce' }}
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
          <v-row class="pr-8">
            <v-col cols="6">
              <DatePicker
                v-model="dialogData.startedDate"
                label="Datum zahájení práce"
                required
                :clearable="false"
              />
            </v-col>
            <v-col cols="6">
              <TimePicker
                v-model="dialogData.startedTime"
                label="Čas zahájení práce"
                required
                :clearable="false"
              />
            </v-col>
          </v-row>
          <v-row class="pl-8 pr-6">
            <v-col
              cols="6"
              class="pr-8 pt-0"
            >
              <v-text-field
                v-model="dialogData.timeSpent"
                placeholder="například: 1h 30m"
                :rules="[rules.required, rules.timeSpentFormat]"
                label="Strávený čas"
              />
            </v-col>
            <v-col
              cols="6"
              class="pl-6 pr-5 pt-0"
            >
              <v-select
                v-model="dialogData.costCategoryId"
                :items="costCategoryItems"
                label="Kategorie"
                :rules="[rules.required]"
                no-data-text="Žádná data k dispozici."
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="pl-11 pr-11 pt-0"
            >
              <v-textarea
                v-model="dialogData.description"
                label="Popis práce"
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
            Potvrdit
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  import TimePicker from '../../common/TimePicker';
  import DatePicker from '../../common/DatePicker';
  import { mapState } from 'vuex';
  import moment from 'moment';

  export default {
    name: 'CreateWorkLogDialog',
    components: {
      TimePicker,
      DatePicker,
    },
    data () {
      return {
        show: false,
        dialogType: null,
        dialogData: {
          id: null,
          authorId: null,
          startedDate: moment().format('YYYY-MM-DD'),
          startedTime: moment().format('HH:mm'),
          timeSpent: '',
          costCategoryId: null,
          description: '',
        },
        defaultDialogData: {
          id: null,
          authorId: null,
          startedDate: moment().format('YYYY-MM-DD'),
          startedTime: moment().format('HH:mm'),
          timeSpent: '',
          costCategoryId: null,
          description: '',
        },
        defaultSelectItems: [],
        rules: {
          required: value => !!value || 'Povinné.',
          minValue: value => value > 0 || 'Hodnota musí být větší jak 0.',
          timeSpentFormat: value => this.checkTimeSpentFormat(value) || 'Hodnota musí být ve validním formátu, například: 1h 30m',
        },
      };
    },
    computed: {
      ...mapState([
        'costCategories',
        'auth',
        'error',
      ]),
      costCategoryItems () {
        return this.costCategories.map(c => ({
          text: c.name,
          value: c.id,
        }));
      },
      absenceTypeEnumItems () {
        return this.absenceTypeEnums.map(absenceTypeEnum => ({
          text: absenceTypeEnum.value,
          value: absenceTypeEnum.id,
        }));
      },
    },
    methods: {
      openDialog(items) {
        this.dialogType = 1;
        if (items) {
          this.dialogType = 0;
          this.dialogData = {
            id: items.id,
            startedDate: moment(items.startedByNumber).format('YYYY-MM-DD'),
            startedTime: moment(items.startedByNumber).format('HH:mm'),
            timeSpent: items.timeSpent,
            costCategoryId: items.costCategory.id,
            description: items.description,
          };
        }

        this.dialogData.authorId = this.auth.user.id;
        this.show = true;
      },
      async confirmDialog () {
        if (this.$refs.form.validate()) {
          const payloads = {
            id: this.dialogData.id,
            authorId: this.dialogData.authorId,
            started: `${this.dialogData.startedDate} ${this.dialogData.startedTime}`,
            timeSpent: this.timeSpentToMs(this.dialogData.timeSpent),
            costCategory: this.costCategories.find(c => c.id === this.dialogData.costCategoryId),
            description: this.dialogData.description,
          };

          if (this.dialogType) {
            await this.$store.dispatch('createWorkLog', payloads);
          } else {
            await this.$store.dispatch('editWorkLog', payloads);
          }
          !this.error.isVisible && this.cancelDialog();
        }
      },
      cancelDialog () {
        this.dialogData = { ...this.defaultDialogData };
        this.$refs.form.resetValidation();
        this.show = false;
        this.$store.commit('clearErrorState');
      },
      timeSpentToMs (value) {
        const m = value.substring(value.lastIndexOf(" ") + 1, value.lastIndexOf("m"));
        const h = value.substring(0, value.lastIndexOf("h"));

        return (m ? parseInt(m) : 0) + (h ? parseInt(h) * 60 : 0);
      },
      checkTimeSpentFormat (value) {
        return /^(?:\d+[hm](?: +|$))+$/.test(value);
      },
    },
  };
</script>
