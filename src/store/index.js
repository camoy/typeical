//
// Import
//

import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import lodash from "lodash";
Vue.use(Vuex);

//
// Base URL
//

//axios.defaults.baseURL = "https://cors-anywhere.herokuapp.com/https://julia.prl.fit.cvut.cz/rtypes-viz-new/";
axios.defaults.baseURL = "https://julia.prl.fit.cvut.cz/rtypes-viz-new/";

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

// Natural
// Number of datums loaded by default
const defaultLimit = 36;

// Natural
// Number of flows per page
const flowsPerPage = 12;

// Boolean
// If the flow layout is justified or not.
const flowsJustified = false;

//
// Boolean
// If the Sankey diagram should be horizontal.
const horizontalLayout = false;

//
// Boolean
// If selecting a package should clear function selection
const clearSelectedFunsOnPkg = true;

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

// [Listof (String, Number)]
// List of dataset statistics
const datasetStats = { basic: [], detailed: [] };

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

// Boolean
// Flag indicating whether to request detailed data for type flows
const details = false;

//
// Store
//
export default new Vuex.Store({
  state: {
    pending,
    analyzed,
    selectMultipleFuns,
    autocompleteWithFuns,
    defaultLimit,
    flowsPerPage,
    flowsJustified,
    horizontalLayout,
    clearSelectedFunsOnPkg,
    selectedPkg,
    selectedFuns,
    allAnalyzed,
    datasetStats,
    allFuns,
    funs,
    pkgs,
    types,
    details
  },

  mutations: {
    incrementPending(state) {
      ++state.pending;
    },
    decrementPending(state) {
      --state.pending;
    },
    analyzed(state, val) {
      state.analyzed = val;
    },
    selectMultipleFuns(state, val) {
      state.selectMultipleFuns = val;
    },
    autocompleteWithFuns(state, val) {
      state.autocompleteWithFuns = val;
    },
    defaultLimit(state, val) {
      state.defaultLimit = val;
    },
    flowsPerPage(state, val) {
      state.flowsPerPage = val;
    },
    flowsJustified(state, val) {
      state.flowsJustified = val;
    },
    horizontalLayout(state, val) {
      state.horizontalLayout = val;
    },
    clearSelectedFunsOnPkg(state, val) {
      state.clearSelectedFunsOnPkg = val;
    },
    selectedPkg(state, val) {
      state.selectedPkg = val;
    },
    selectedFuns(state, val) {
      state.selectedFuns = val;
    },
    allAnalyzed(state, val) {
      state.allAnalyzed = val;
    },
    datasetStats(state, val) {
      if (val.basic) state.datasetStats.basic = val.data;
      else state.datasetStats.detailed = val.data;
    },
    allFuns(state, val) {
      state.allFuns = val;
    },
    funs(state, val) {
      state.funs = val;
    },
    pkgs(state, val) {
      state.pkgs = val;
    },
    types(state, val) {
      state.types = val;
    },
    details(state, val) {
      state.details = val;
    }
  },

  actions: {
    // Query for the list of analyzed packages
    queryAnalyzed({ commit }) {
      commit("incrementPending");
      axios.get("api/analyzed").then(response => {
        commit("decrementPending");
        commit("allAnalyzed", response.data);
      });
    },

    // Query for the data set statistics
    queryStats({ commit }) {
      commit("incrementPending");
      axios.get("api/stats", { params: { details: false } }).then(response => {
        commit("decrementPending");
        commit("datasetStats", { basic: true, data: response.data });
      });
      commit("incrementPending");
      axios.get("api/stats", { params: { details: true } }).then(response => {
        commit("decrementPending");
        commit("datasetStats", { basic: false, data: response.data });
      });
    },

    // Query for the list of analyzed packages
    queryAllFuns({ commit }) {
      commit("incrementPending");
      axios.get("api/all_funs").then(response => {
        commit("decrementPending");
        commit("allFuns", response.data);
      });
    },

    // Query for the list of defined packages
    queryPkgs({ commit, state }) {
      commit("incrementPending");
      axios
        .get(`api/pkgs`, {
          params: { analyzed: state.analyzed }
        })
        .then(response => {
          commit("decrementPending");
          commit("pkgs", response.data);
        });
    },

    // Query for the list of functions
    queryFuns({ commit, state }) {
      commit("incrementPending");
      axios
        .get("api/funs", {
          params: { analyzed: state.analyzed, pkg: state.selectedPkg }
        })
        .then(response => {
          commit("decrementPending");
          commit("funs", response.data);
        });
    },

    // Query for type information
    queryTypes({ commit, state }) {
      let funs = state.selectedFuns.map(JSON.parse);
      commit("incrementPending");
      axios
        .get("api/types", {
          params: {
            analyzed: state.analyzed,
            pkg: state.selectedPkg,
            funs,
            limit: state.defaultLimit,
            details: state.details
          }
        })
        .then(response => {
          // grou by function names before sorting
          const groupedData = lodash.groupBy(response.data, "fun_name");
          const groupedWeighedData = Object.keys(groupedData).map(function(k) {
            return {
              name: k,
              data: groupedData[k],
              count: groupedData[k].reduce((acc, d) => acc + d.count, 0)
            };
          });
          let sortedData = groupedWeighedData
            .sort((a, b) => b.count - a.count)
            .map(a => a.data)
            .flat();
          commit("decrementPending");
          commit("types", sortedData);
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
    setSelectedPkg({ commit, dispatch, state }, selectedPkg) {
      commit("selectedPkg", selectedPkg);
      if (state.clearSelectedFunsOnPkg) commit("selectedFuns", []);
      dispatch("queryFuns");
    },

    // Sets the selected functions.
    setSelectedFuns({ commit, dispatch }, selectedFuns) {
      commit("selectedFuns", selectedFuns);
      dispatch("queryTypes");
    },

    setDefaultLimit({ commit, dispatch }, defaultLimit) {
      commit("defaultLimit", defaultLimit);
      dispatch("queryTypes");
    },

    setClearSelectedFunsOnPkg({ commit }, value) {
      commit("clearSelectedFunsOnPkg", value);
    },

    // Sets the details flag
    setDetails({ commit, dispatch }, details) {
      commit("details", details);
      dispatch("queryTypes");
    }
  },

  modules: {}
});
