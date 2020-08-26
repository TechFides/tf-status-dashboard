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
        Vytvořit nový záznam práce
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
                v-model="dialogData.staredDate"
                label="Datum zahájení práce"
                required
                :clearable="false"
              />
            </v-col>
            <v-col cols="6">
              <TimePicker
                v-model="dialogData.staredTime"
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
                type="number"
                :rules="[rules.required, rules.minValue]"
                label="Strávený čas"
              />
            </v-col>
            <v-col
              cols="6"
              class="pl-6 pr-5 pt-0"
            >
              <v-select
                v-model="dialogData.costCategory"
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
        dialogData: {
          userId: null,
          staredDate: '',
          staredTime: '',
          timeSpent: '',
          costCategory: null,
          description: '',
        },
        defaultDialogData: {
          userId: null,
          staredDate: '',
          staredTime: '',
          timeSpent: '',
          costCategory: null,
          description: '',
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
        'costCategories',
        'auth',
        'error',
      ]),
      costCategoryItems () {
        return [];
      },
      absenceTypeEnumItems () {
        return this.absenceTypeEnums.map(absenceTypeEnum => ({
          text: absenceTypeEnum.value,
          value: absenceTypeEnum.id,
        }));
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
          !this.error.isVisible && this.cancelDialog();
        }
      },
      cancelDialog () {
        this.dialogData = { ...this.defaultDialogData };
        this.$refs.form.resetValidation();
        this.show = false;
        this.$store.commit('clearErrorState');
      },
    },
  };
</script>
