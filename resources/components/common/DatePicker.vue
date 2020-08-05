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
        :value="dateFormatted"
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
      scrollable
      header-color="blue"
      @change="dateSelected"
      @input="menu = false"
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
      clearable: {
        type: Boolean,
        default: true,
      },
      dateFormat: {
        type: String,
        default: 'DD.MM.YYYY',
      },
      value: {
        type: String,
        default: '',
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
