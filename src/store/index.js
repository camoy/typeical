//
// Import
//

import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

// API config
//axios.defaults.baseURL = "https://cors-anywhere.herokuapp.com/https://julia.prl.fit.cvut.cz/rtypes-viz-new/";
//axios.defaults.baseURL = "https://julia.prl.fit.cvut.cz/rtypes-viz-new/";

Vue.use(Vuex);

//
// Settings
//

// [Listof String]
// Only include analysis results from these packages. If empty
// then include all analysis results.
const analyzed = [];

// Boolean
// Can you select multiple functions at once or only one?
const selectMultipleFuns = false;

// Boolean
// Does the autocomplete use functions or packages?
const autocompleteWithFuns = true;

//
// Filtering
//

// [Or undefined String]
// Contains the currently selected package.
const selectedPkg = undefined;

// [Listof String]
// This array contains pairs of package and function names.
// The flow visualization should only include functions in this
// list.
const selectedFuns = [];

//
// Results
//

// Natural
// Number of pending API requests.
const pending = 0;

// [Listof String]
// List of packages that were analyzed.
const allAnalyzed = [];

// [Listof String]
// List of all the functions.
const allFuns = [];

// List
// List of defined packages.
const pkgs = [];

// List
// List of functions defined in the current package.
const funs = [];

// List
// An array of results from querying function type information.
const types = [];

//
// Store
//
export default new Vuex.Store({
  state: {
    pending,
    analyzed,
    selectMultipleFuns,
    autocompleteWithFuns,
    selectedPkg,
    selectedFuns,
    allAnalyzed,
    allFuns,
    funs,
    pkgs,
    types
  },

  mutations: {
    incrementPending(state) { ++state.pending; },
    decrementPending(state) { --state.pending; },
    analyzed(state, val) { state.analyzed = val; },
    selectMultipleFuns(state, val) { state.selectMultipleFuns = val; },
    autocompleteWithFuns(state, val) { state.autocompleteWithFuns = val; },
    selectedPkg(state, val) { state.selectedPkg = val; },
    selectedFuns(state, val) { state.selectedFuns = val; },
    allAnalyzed(state, val) { state.allAnalyzed = val; },
    allFuns(state, val) { state.allFuns = val; },
    funs(state, val) { state.funs = val; },
    pkgs(state, val) { state.pkgs = val; },
    types(state, val) { state.types = val; }
  },

  actions: {
    // Query for the list of analyzed packages
    queryAnalyzed({ commit }) {
      commit("incrementPending");
      axios.get("api/analyzed")
           .then(response => {
             commit("decrementPending");
             commit("allAnalyzed", response.data);
           });
    },

    // Query for the list of analyzed packages
    queryAllFuns({ commit }) {
      commit("incrementPending");
      axios.get("api/all_funs")
           .then(response => {
             commit("decrementPending");
             commit("allFuns", response.data);
           });
    },

    // Query for the list of defined packages
    queryPkgs({ commit, state }) {
      commit("incrementPending");
      axios.get(`api/pkgs`, {
        params: { analyzed: state.analyzed }
      }).then(response => {
        commit("decrementPending");
        commit("pkgs", response.data);
      });
    },

    // Query for the list of functions
    queryFuns({ commit, state }) {
      commit("incrementPending");
      axios.get("api/funs", {
        params: { analyzed: state.analyzed, pkg: state.selectedPkg }
      }).then(response => {
        commit("decrementPending");
        commit("funs", response.data);
      });
    },

    // Query for type information
    queryTypes({ commit, state }) {
      let funs = state.selectedFuns.map(JSON.parse);
      commit("incrementPending");
      axios.get("api/types", {
        params: { analyzed: state.analyzed, pkg: state.selectedPkg, funs }
      }).then(response => {
        commit("decrementPending");
        commit("types", response.data);
      });
    },

    queryTypesLimited({ commit, state }) {
      commit("incrementPending");
      axios.get("api/types_limited", {
        params: {
          analyzed: state.analyzed,
          pkg: state.selectedPkg ? state.selectedPkg : "",
        }
      }).then(response => {
        commit("decrementPending");
        commit("types", response.data);
      });
    },

    // Set the analyzed packages. We clear the selected package and functions
    // as they may be unavailable.
    setAnalyzed({ commit, dispatch }, pkgs) {
      commit("analyzed", pkgs);
      dispatch("queryPkgs");
      dispatch("setSelectedPkg", undefined);
      dispatch("setSelectedFuns", []);
    },

    // Sets the selected package.
    setSelectedPkg({ commit, dispatch }, selectedPkg) {
      commit("selectedPkg", selectedPkg);
      dispatch("queryFuns");
    },

    // Sets the selected functions.
    setSelectedFuns({ commit, dispatch }, selectedFuns) {
      commit("selectedFuns", selectedFuns);
      dispatch("queryTypes");
    },
  },

  modules: {}
});
