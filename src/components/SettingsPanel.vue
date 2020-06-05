<template>
<div class="pa-10">
  <v-form id="settings-form">
    <v-autocomplete
      v-model="analyzed"
      outlined
      chips
      small-chips
      deletable-chips
      label="Analyzed Packages"
      multiple
      :items="analyzedNames"
      @input="$store.dispatch('setAnalyzed', analyzed)"
      />

    <v-checkbox
      v-model="selectMultipleFuns"
      label="Select Multiple Functions"
      @click="$store.commit('selectMultipleFuns', selectMultipleFuns)"
      />

    <v-checkbox
      v-model="autocompleteWithFuns"
      label="Autocomplete with Functions"
      @click="$store.commit('autocompleteWithFuns', autocompleteWithFuns)"
      />
  </v-form>
</div>
</template>

<style>
#settings-form {
    min-width: 20rem;
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
    data: () => ({
        analyzed: [],
        selectMultipleFuns: false,
        autocompleteWithFuns: true
    })
}
</script>
