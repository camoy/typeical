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
      v-model="autocompleteWithFuns"
      label="Autocomplete with Functions"
      @click="$store.commit('autocompleteWithFuns', autocompleteWithFuns)"
      />
    
    <v-checkbox
      v-model="selectMultipleFuns"
      label="Select Multiple Functions"
      @click="$store.commit('selectMultipleFuns', selectMultipleFuns)"
      />

    <div class="v-input v-input--selection-controls div-setting">
      <select v-model="flowsPerPage" class="num-setting"
        @change="$store.commit('flowsPerPage', flowsPerPage)">
        <option v-for="(option, k) in validFlows" v-bind:value="option"
          :key="'flows-per-page-' + k">
          {{ option }}
        </option>
      </select>
      <label class="v-label label-setting" style="color: rgba(0, 0, 0, 0.6)">
        Type flows shown per page </label>
    </div>

    <div class="v-input v-input--selection-controls div-setting">
      <select v-model="defaultLimit" class="num-setting"
        @change="$store.dispatch('setDefaultLimit', defaultLimit)">
        <option v-for="(option, k) in validLimits" v-bind:value="option"
          :key="'valid-limit-' + k">
          {{ option }}
        </option>
      </select>
      <label class="v-label label-setting" style="color: rgba(0, 0, 0, 0.6)">
        Type flows requested when no function is selected </label>
    </div>
  </v-form>
</div>
</template>

<style>
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
    created() { this.$store.dispatch("queryAnalyzed"); },
    computed: {
        analyzedNames() {
            return this.allAnalyzed ?
                this.allAnalyzed.map((x) => x.package_being_analyzed) :
                [];
        },
        validFlows() {
            return (new Array(30)).fill(1).map((min, i) => i + min);
        },
        validLimits() {
            return (new Array(61)).fill(10).map((min, i) => i + min);
        },
        ...mapState(["allAnalyzed"])
    },
    data: () => ({
        analyzed: [],
        selectMultipleFuns: false,
        autocompleteWithFuns: true,
        flowsPerPage: 12,
        defaultLimit: 36,
    })
}
</script>
