<template>
  <v-menu
    v-model="menuDate"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    full-width
    min-width="290px"
  >
    <v-text-field
      slot="activator"
      type="text"
      :label="label"
      append-icon="event"
      readonly
      clearable
      :value="dateFormatted"
      @input="datePicked"
    />
    <v-date-picker
      v-model="modelDate"
      :first-day-of-week="1"
      no-title
      @input="datePicked"
    />
  </v-menu>
</template>

<script>
import { parse, format, setHours, getHours } from 'date-fns';

export default {
  name: 'DatePickerField',
  props: {
    label: {
      type: String,
      default: '',
    },
    value: {
      type: Date,
      default: '',
    },
  },
  data() {
    return {
      modelDate: null,
      menuDate: false,
    };
  },
  computed: {
    dateFormatted() {
      return this.modelDate ? format(this.modelDate, 'D. M. YYYY') : '';
    },
  },
  watch: {
    value (v) {
      this.modelDate = v ? format(v, 'YYYY-MM-DD') : null;
    },
  },
  created () {
    this.modelDate = this.value ? format(this.value, 'YYYY-MM-DD') : null;
  },
  methods: {
    datePicked(date) {
      this.menuDate = false;
      this.modelDate = date;

      if (!date) {
        this.$emit('input', null);
        return;
      }

      const currentDate = new Date();
      const parsedDate = parse(date);
      const resultDate = setHours(parsedDate, getHours(currentDate));

      this.$emit('input', resultDate);
    },
  },
};
</script>
