<template>
  <div class="text-xs-center">
    <v-dialog
      v-model="dialog"
      :disabled="disabled"
      width="1080"
    >
      <template v-slot:activator="{ on, attrs }">
        <div
          color="red lighten-2"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon :class="getClassName()">
            {{ icon }}
          </v-icon>
        </div>
      </template>
      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
          <div class="flex-container">
            {{ `${date} - Vyberte hodnocení: ${projectName}` }}
            <v-icon
              x-large
              class="material-icons"
              @click="dialog = false"
            >
              remove
            </v-icon>
          </div>
        </v-card-title>

        <v-card-text class="myicon">
          <v-icon
            large
            class="material-icons custom-picker-font-size"
            @click="submit('HIATUS')"
          >
            remove
          </v-icon>
          <v-icon
            large
            class="material-icons red800 custom-picker-font-size"
            @click="submit('FAIL')"
          >
            close
          </v-icon>
          <v-icon
            large
            class="material-icons blue500 custom-picker-font-size"
            @click="submit('STANDARD')"
          >
            radio_button_unchecked
          </v-icon>
          <v-icon
            large
            class="material-icons green500 custom-picker-font-size"
            @click="submit('GOOD')"
          >
            radio_button_unchecked
          </v-icon>
          <v-icon
            large
            class="material-icons green500 custom-picker-font-size"
            @click="submit('AMAZING')"
          >
            done
          </v-icon>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  props: {
    date: {
      type: String,
      required: true,
    },
    projectId: {
      type: Number,
      required: true,
    },
    standupId: {
      type: Number,
      required: true,
    },
    projectRating: {
      type: Number,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: true,
    },
    onSubmit: {
      type: Function,
      default: () => {},
    },
  },
  data () {
    return {
      dialog: false,
      className: 'material-icons',
      RATING_ENUM: {
        HIATUS: 0,
        FAIL: 1,
        STANDARD: 6,
        GOOD: 7,
        AMAZING: 5,
        DEFAULT: 8,
      },
    };
  },
  computed: {
    ...mapState([
      'projects',
    ]),
    icon () {
      return this.getRatingIconFromId(this.projectRating);
    },
    projectName () {
      return this.projects.find(p => p.id === this.projectId).code;
    },
  },
  methods: {
    getClassName () {
      let className = 'material-icons custom-font-size';
      switch (this.projectRating) {
        case this.RATING_ENUM.HIATUS:
          return className;
        case this.RATING_ENUM.FAIL:
          return `${className} red800`;
        case this.RATING_ENUM.STANDARD:
          return `${className} blue500`;
        case this.RATING_ENUM.GOOD:
          return `${className} green500`;
        case this.RATING_ENUM.AMAZING:
          return `${className} green500`;
        case this.RATING_ENUM.DEFAULT:
          return 'material-icons custom-default-rating-font-size';
        default:
          return '';
      }
    },
    async submit (icon) {
      this.dialog = false;

      try {
        const ratingValue = this.getRatingId(icon);
        const ratingData = {
          projectId: this.projectId,
          ratingValueId: ratingValue,
          standupId: this.standupId,
        };

        if (this.getRatingId(icon) === this.RATING_ENUM.AMAZING) {
          this.onSubmit();
        }

        await this.$store.dispatch('editRating', ratingData);
      } catch (e) {
        // TODO handle error
        console.error(e);
      }
    },
    getRatingId (icon) {
      switch (icon) {
        case 'HIATUS':
          return this.RATING_ENUM.HIATUS;
        case 'FAIL':
          return this.RATING_ENUM.FAIL;
        case 'STANDARD':
          return this.RATING_ENUM.STANDARD;
        case 'GOOD':
          return this.RATING_ENUM.GOOD;
        case 'AMAZING':
          return this.RATING_ENUM.AMAZING;
      }
    },
    getRatingIcon (icon) {
      switch (icon) {
        case 'HIATUS':
          return 'remove';
        case 'FAIL':
          return 'close';
        case 'STANDARD':
          return 'radio_button_unchecked';
        case 'GOOD':
          return 'radio_button_unchecked';
        case 'AMAZING':
          return 'done';
      }
    },
    getRatingIconFromId (icon) {
      switch (icon) {
        case this.RATING_ENUM.HIATUS:
          return 'remove';
        case this.RATING_ENUM.FAIL:
          return 'close';
        case this.RATING_ENUM.STANDARD:
          return 'radio_button_unchecked';
        case this.RATING_ENUM.GOOD:
          return 'radio_button_unchecked';
        case this.RATING_ENUM.AMAZING:
          return 'done';
        case this.RATING_ENUM.DEFAULT:
          return 'mdi-help';
      }
    },
  },
};
</script>

<style scoped>
/deep/ .v-dialog {
  overflow: hidden !important;
}

.myicon {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.material-icons.custom-picker-font-size {
  font-size: 1200% !important;
}

.material-icons.custom-font-size {
  font-size: 500% !important;
  cursor: pointer;
}

.material-icons.custom-default-rating-font-size {
  font-size: 350% !important;
  margin: 0.7rem 0;
  cursor: pointer;
}

.material-icons.red800 {
  color: #c62828;
}

.material-icons.green500 {
  color: #4caf50;
}

.flex-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.material-icons.blue500 {
  color: #3f51b5;
}
</style>
