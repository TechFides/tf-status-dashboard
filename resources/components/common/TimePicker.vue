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
        :value="value"
        :label="label"
        :prepend-icon="prependIconVisible ? 'mdi-clock-outline ' : null"
        :append-icon="clearable ? null : appendIcon"
        :append-outer-icon="appendOuterIcon"
        :rules="rules"
        :disabled="disabled"
        :hide-details="hideDetails"
        :clearable="clearable"
        readonly
        @click:clear="timeCleared"
        v-on="on"
      />
    </template>
    <v-time-picker
      :value="value"
      format="24hr"
      scrollable
      :disabled="disabled"
      header-color="blue darken-2"
      color="blue darken-2"
      :min="min"
      :max="max"
      @change="timeSelected"
    >
      <div class="time-picker-action">
        <v-btn
          color="blue darken-1"
          text
          @click.native="menu = false"
        >
          Potvrdit
        </v-btn>
      </div>
    </v-time-picker>
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
      default: 'HH:MM',
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
    allowedDates: {
      type: Function,
      default: val => val,
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
    prependIconVisible() {
      return !this.hidePrependIcon;
    },
    rules() {
      const rules = [];

      if (this.required) {
        rules.push(v => this.isDefined(v) || 'Povinné.');
      }

      if (this.min && this.value) {
        rules.push(() => moment(this.value).isSameOrAfter(this.min) || `Hodnota je před ${this.formatDate(this.min)}`);
      }

      if (this.max && this.value) {
        rules.push(() => moment(this.value).isSameOrBefore(this.max) || `Hodnota je po ${this.formatDate(this.max)}`);
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
    timeSelected(value) {
      this.$emit('input', value);
    },
    timeCleared() {
      this.$emit('input', null);
    },
    validate() {
      return this.$refs.textField.validate();
    },
    resetValidation() {
      return this.$refs.textField.resetValidation();
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep input {
  cursor: pointer;
}

.time-picker-action {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
</style>
