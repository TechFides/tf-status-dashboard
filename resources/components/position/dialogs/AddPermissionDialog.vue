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
        Nastavit oprávnění
      </v-card-title>
      <v-form
        ref="form"
        lazy-validation
        @submit.prevent
      >
        <v-card-text style="max-height: 800px">
          <v-row class="pl-4 pr-4">
            <v-select
              v-model="dialogData.permissionIds"
              multiple
              :items="permissionItems"
              chips
              label="Oprávnění"
              :rules="[rules.required]"
              no-data-text="Žádná data k dispozici."
            />
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
import { mapState } from 'vuex';

export default {
  name: 'AddPermissionDialog',
  data() {
    return {
      show: false,
      dialogData: {
        positionId: null,
        permissionIds: [],
      },
      rules: {
        required: value => !!value || 'Povinné.',
      },
    };
  },
  computed: {
    ...mapState(['errors', 'permissions']),
    permissionItems() {
      return this.permissions.items.map(permission => ({
        text: permission.name,
        value: permission.id,
      }));
    },
  },
  methods: {
    openDialog(position) {
      if (position.permissions.length) {
        position.permissions.forEach(p => this.dialogData.permissionIds.push(p.id));
      }
      this.show = true;
      this.dialogData.positionId = position.id;
    },
    async confirmDialog() {
      if (this.$refs.form.validate()) {
        await this.$store.dispatch('positions/setPermissions', this.dialogData);
        !this.errors.error.isVisible && this.cancelDialog();
      }
    },
    cancelDialog() {
      this.dialogData.positionId = null;
      this.dialogData.permissionIds = [];

      this.show = false;
      this.$refs.form.resetValidation();
      this.$store.commit('errors/clearErrorState');
    },
  },
};
</script>
