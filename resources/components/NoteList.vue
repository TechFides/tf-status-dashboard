<template>
  <div class="note-columns mx-3">
    <v-card
      v-for="item in notes.items"
      :key="item.id"
      color="brown lighten-5"
      class="note-card mt-3"
    >
      <div class="pa-2">
        <div class="note-text-alignment">
          <h2>{{ item.projectCode }}</h2>
          <v-spacer />
          <v-icon
            v-if="editable"
            class="mr-1"
            size="20"
            @click="$emit('edit', item)"
          >
            edit
          </v-icon>
          <v-icon
            v-if="editable"
            size="20"
            color="green"
            @click="markNoteCompleted(item)"
          >
            done
          </v-icon>
        </div>
        <div class="note-text mb-2">
          {{ item.text }}
        </div>
        <v-divider />
        <div class="note-text-alignment">
          <v-flex>
            {{ formatDate(item.created) }}
          </v-flex>
          <v-flex :class="getNoteDeadlineClass(item)">
            <v-icon
              :color="getNoteDeadlineIconColor(item)"
              size="16"
            >
              schedule
            </v-icon>
            {{ formatDate(item.deadlineDate) }}
          </v-flex>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import { format, parse, isPast, isToday } from 'date-fns';
import { mapState } from 'vuex';

export default {
  name: 'NoteList',
  props: {
    editable: Boolean,
  },
  data () {
    return {};
  },
  computed: {
    ...mapState([
      'notes',
    ]),
  },
  methods: {
    getNoteDeadlineClass (item) {
      const deadline = parse(item.deadlineDate);
      const today = isToday(deadline);

      return {
        'text-xs-right': true,
        'orange--text': today,
        'red--text': !today && isPast(deadline),
      };
    },
    getNoteDeadlineIconColor (item) {
      const deadline = parse(item.deadlineDate);

      if (isToday(deadline)) {
        return 'orange';
      } else if (isPast(deadline)) {
        return 'red';
      }

      return undefined;
    },
    formatDate (date) {
      return format(parse(date), 'D. M. YYYY');
    },
    markNoteCompleted (note) {
      if (confirm('Opravdu chcete označit poznámku za dokončenou?')) {
        this.$store.dispatch('notes/markNoteCompleted', note.id);
      }
    },
  },
};
</script>

<style scoped>
  .note-text {
    white-space: pre-line;
  }

  .note-columns {
    column-count: 5;
    column-gap: 20px;
    column-fill: balance;
  }

  @media only screen and (max-width: 600px) {
    .note-columns {
      column-count: auto;
    }
  }

  .note-card {
    display: inline-block;
    width: 100%;
  }

  .note-text-alignment {
      display: flex;
      flex-direction: row;
    }
</style>
