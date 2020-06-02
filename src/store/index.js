//
// Import
//

import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

Vue.use(Vuex);

//
// Settings
//

// [Listof String]
// Only include analysis results from these packages. If empty
// then include all analysis results.
const analyzed = [];

// Natural
// Number of functions that are returned in the results.
const limit = 15;

//
// Filtering
//

// [Listof String]
// This array contains pairs of package and function names.
// The flow visualization should only include functions in this
// list. These "pairs" will actually be strings with the pair
// elements separated by a frowny face.
const funs = [];

//
// Results
//

// [Listof String]
// List of packages that were analyzed.
const allAnalyzed = [];

// Object
// Information about packages, functions, and their usage.
const pkgs = false;

// List
// An array of defined packages.
const pkgsList = [];

// List
// An array of results from querying function type information.
const types = [];

// Natural
// The number of rows of results.
const count = 0;

//
// Store
//
export default new Vuex.Store({
  state: {
    analyzed,
    limit,
    funs,
    allAnalyzed,
    pkgs,
    pkgsList, // list of defined pkgs
    types,
    count
  },

  mutations: {
    pkgs(state, val) { state.pkgs = val; },
    pkgsList(state, val) { state.pkgsList = val; },
    types(state, val) { state.types = val; },
    count(state, val) { state.count = val; },
    analyzed(state, val) { state.analyzed = val; },
    allAnalyzed(state, val) { state.allAnalyzed = val; },
    funs(state, val) { state.funs = val; }
  },

  actions: {
    // Query for the list of defined packages and function information
    queryPkgs({ commit, state }) {
      axios.get("api/pkgs", {
        params: { analyzed: state.analyzed}
      }).then(response => commit("pkgs", response.data));
    },

    // Query for the list of analyzed packages
    queryAnalyzed({ commit }) {
      axios.get("api/analyzed")
           .then(response => commit("allAnalyzed", response.data));
    },

    // Query for type information
    queryTypes({ commit, state }) {
      let funs = state.funs.map(JSON.parse);
      axios.get("api/types", {
        params: { funs, analyzed: state.analyzed}
      }).then(response =>  commit("types", response.data));
    },

    // Query for the list of defined packages
    queryPkgsList({ commit, state }) {
      axios.get("api/pkgslist", {
        params: { analyzed: state.analyzed}
      }).then(response => commit("pkgsList", response.data));
    },

    // Given a function, toggles whether that function is selected
    toggleFun({ commit, dispatch, state }, fun) {
      let funs =
        state.funs.includes(fun) ?
        state.funs.filter(x => x !== fun) :
        state.funs.concat([fun]);
      commit("funs", funs);
      dispatch("queryTypes");
    },

    // Given a list of packages, prunes the selected functions to make sure
    // only functions contained in the package list remain
    pruneFuns({ commit, dispatch, state }, pkgs) {
      let funs =
        state.funs.filter(x => pkgs.includes(JSON.parse(x)[0]));
      commit("funs", funs);
      dispatch("queryTypes");
    },

    // Set the analyzed packages and update other (dependent) data sources
    setAnalyzed({ commit, dispatch }, pkgs) {
      commit("analyzed", pkgs);
      dispatch("queryPkgs");
      dispatch("queryPkgsList");
      dispatch("queryTypes");
    }
  },

  modules: {}
});
