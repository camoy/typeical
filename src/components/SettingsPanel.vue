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

      <h3>Visualization</h3>

      <v-checkbox
        v-model="horizontalLayout"
        label="Horizontal Layout"
        @change="$store.commit('horizontalLayout', horizontalLayout)"
      />

      <div class="v-input v-input--selection-controls div-setting">
        <select
          v-model="flowsPerPage"
          class="num-setting"
          @change="$store.commit('flowsPerPage', flowsPerPage)"
        >
          <option
            v-for="(option, k) in validFlows"
            v-bind:value="option"
            :key="'flows-per-page-' + k"
          >
            {{ option }}
          </option>
        </select>
        <label class="v-label label-setting" style="color: rgba(0, 0, 0, 0.6)">
          Type flows shown per page
        </label>
      </div>

      <h3>Data Search and Filtering</h3>

      <v-checkbox
        v-model="autocompleteWithFuns"
        label="Autocomplete with functions instead of packages"
        @change="$store.commit('autocompleteWithFuns', autocompleteWithFuns)"
      />

      <v-checkbox
        v-model="selectMultipleFuns"
        label="Select multiple functions on the treemap"
        @change="$store.commit('selectMultipleFuns', selectMultipleFuns)"
      />

      <v-checkbox
        v-model="clearSelectedFunsOnPkg"
        label="Clear selected functions on package selection"
        @change="$store.commit('clearSelectedFunsOnPkg', clearSelectedFunsOnPkg)"
      />

      <div class="v-input v-input--selection-controls div-setting">
        <select
          v-model="defaultLimit"
          class="num-setting"
          @change="$store.dispatch('setDefaultLimit', defaultLimit)"
        >
          <option
            v-for="(option, k) in validLimits"
            v-bind:value="option"
            :key="'valid-limit-' + k"
          >
            {{ option }}
          </option>
        </select>
        <label class="v-label label-setting" style="color: rgba(0, 0, 0, 0.6)">
          Size of preview
        </label>
      </div>

    </v-form>
  </div>
</template>

<style>
h3 {
  padding-top: 16px;
  padding-bottom: 16px;
}

#settings-form {
  min-width: 20rem;
  max-width: 50rem;
}

.label-setting {
  margin-top: 4px;
  margin-left: 8px;
}

.num-setting {
  width: 2rem;
  border: 2px solid #777;
  border-radius: 15%;
  text-align: center;
  text-align-last: center;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 16px;
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
  created() {
    this.$store.dispatch("queryAnalyzed");
  },
  computed: {
    analyzedNames() {
      return this.allAnalyzed
        ? this.allAnalyzed.map(x => x.package_being_analyzed)
        : [];
    },
    validFlows() {
      return new Array(30).fill(1).map((min, i) => i + min);
    },
    validLimits() {
      return new Array(61).fill(10).map((min, i) => i + min);
    },
    ...mapState(["allAnalyzed"])
  },
  data: () => ({
    analyzed: [],
    selectMultipleFuns: false,
    autocompleteWithFuns: true,
    horizontalLayout: false,
    clearSelectedFunsOnPkg: true,
    flowsPerPage: 12,
    defaultLimit: 36
  })
};
</script>
