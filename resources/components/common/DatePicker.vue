<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :nudge-right="40"
    :disabled="disabled"
    transition="scale-transition"
    offset-y
    origin="top center"
    min-width="290px"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        ref="textField"
        :value="range ? dateRangeText : dateFormatted"
        :label="label"
        :prepend-icon="prependIconVisible ? 'mdi-calendar' : null"
        :append-icon="clearable ? null : appendIcon"
        :append-outer-icon="appendOuterIcon"
        :rules="rules"
        :disabled="disabled"
        :hide-details="hideDetails"
        :clearable="clearable"
        readonly
        @click:clear="dateCleared"
        v-on="on"
      />
    </template>
    <v-date-picker
      :value="value"
      :min="min"
      :max="max"
      :first-day-of-week="1"
      :type="type ? type : undefined"
      :disabled="disabled"
      :allowed-dates="allowedDates"
      scrollable
      :range="range"
      header-color="blue darken-2"
      color="blue darken-2"
      @change="dateSelected"
      @input="rangeDateSelected"
    />
  </v-menu>
</template>

<script>
  import moment from 'moment';

  export default {
    props: {
      appendIcon: {
        type: String,
        default: '',
      },
      appendOuterIcon: {
        type: String,
        default: '',
      },
      dataCy: {
        type: String,
        default: '',
      },
      hidePrependIcon: {
        type: Boolean,
        default: false,
      },
      range: {
        type: Boolean,
        default: false,
      },
      clearable: {
        type: Boolean,
        default: true,
      },
      dateFormat: {
        type: String,
        default: 'DD.MM.YYYY',
      },
      value: {
        type: [Array, String],
        default: () => [],
      },
      label: {
        type: String,
        default: '',
      },
      required: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        default: '',
      },
      min: {
        type: String,
        default: '',
      },
      minPropName: {
        type: String,
        default: null,
      },
      max: {
        type: String,
        default: '',
      },
      maxPropName: {
        type: String,
        default: null,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      hideDetails: {
        type: Boolean,
        default: false,
      },
      allowedDates: {
        type: Function,
        default: (val) => val,
      },
    },
    inject: {
      form: { default: null },
    },
    data() {
      return {
        menu: false,
      };
    },
    computed: {
      dateFormatted() {
        return this.value ? this.formatDate(this.value) : '';
      },
      dateRangeText() {
        const dates = this.value ? [this.formatDate(this.value[0]), this.formatDate(this.value[1])] : '';
        return dates ? dates.join(' ~ ') : '';
      },
      prependIconVisible() {
        return !this.hidePrependIcon;
      },
      rules() {
        const rules = [];

        if (this.required) {
          rules.push(v => this.isDefined(v) || 'Povinné.');
        }

        if (this.min && this.value) {
          rules.push(
            () =>
              moment(this.value).isSameOrAfter(this.min) ||
              `Hodnota je před ${this.formatDate(this.min)}`
          );
        }

        if (this.max && this.value) {
          rules.push(
            () =>
              moment(this.value).isSameOrBefore(this.max) ||
              `Hodnota je po ${this.formatDate(this.max)}`
          );
        }

        return rules;
      },
    },
    watch: {
      rules: {
        handler() {
          this.validate();
        },
      },
    },
    created() {
      this.form && this.form.register(this);
    },
    beforeDestroy() {
      this.form && this.form.unregister(this);
    },
    methods: {
      isDefined(value) {
        const invalidValues = [null, undefined, ''];

        return !invalidValues.includes(value);
      },
      rangeDateSelected(value) {
        let temp;
        if (this.range) {
          if (value.length === 2) {
            if (moment(value[0]).isAfter(moment(value[1]))) {
              temp = value[1];
              value[1] = value[0];
              value[0] = temp;
            }
            this.menu = false;
          }
          this.$emit('input', value);
        } else {
          this.menu = false;
        }
      },
      dateSelected(value) {
        this.$emit('input', value);
      },
      dateCleared() {
        this.$emit('input', null);
      },
      validate() {
        return this.$refs.textField.validate();
      },
      resetValidation() {
        return this.$refs.textField.resetValidation();
      },
      formatDate(date) {
        return moment(date).format(this.dateFormat);
      },
    },
  };
</script>

<style scoped>
  ::v-deep input {
    cursor: pointer;
  }
</style>
