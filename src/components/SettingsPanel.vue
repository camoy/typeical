<template>
<div class="pa-10">
  <v-form id="settings-form">
    <v-autocomplete
      v-model="selectedAnalyzed"
      outlined
      chips
      small-chips
      deletable-chips
      label="Analyzed Packages"
      multiple
      :items="analyzedNames"
      @input="$store.dispatch('setAnalyzed', selectedAnalyzed)"
      />
  </v-form>
</div>
</template>

<style>
#settings-form {
    width: 60rem;
}
</style>

<script>
//
// Imports
//
import { mapState } from "vuex";

//
// Exports
//
export default {
    name: "SettingsPanel",
    created() { this.$store.dispatch("queryAnalyzed"); },
    computed: {
        analyzedNames() {
            return this.allAnalyzed ?
                this.allAnalyzed.map((x) => x.package_being_analyzed) :
                [];
        },
        ...mapState(["allAnalyzed"])
    },
    data: () => ({ selectedAnalyzed: [] })
}
</script>
