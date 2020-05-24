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
const analyzedPkgs = [];

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
const funsShown = [];

//
// Results
//

// Object
// Information about packages, functions, and their usage.
const pkgs = false;

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
    //
    // Settings
    //
    analyzedPkgs,
    limit,

    //
    // Filtering
    //
    funsShown,

    //
    // Results
    //
    pkgs,
    types,
    count
  },
  getters: {
    pkgNames(state) {
      return state.pkgs ? state.pkgs.children.map((x) => x.name) : [];
    },

    funs(state) {
      return state.funsShown.map((x) => x.split("☹"));
    }
  },
  mutations: {
    pkgs(state, val) {  state.pkgs = val; },
    types(state, val) {  state.types = val; },
    count(state, val) {  state.count = val; },
    toggleFun(state, fun) {
      if (state.funsShown.includes(fun)) {
        state.funsShown =
          state.funsShown.filter(x => x !== fun);
      } else {
        state.funsShown.push(fun);
      }
    },
    pruneFun(state, pkgs) {
      state.funsShown =
        state.funsShown.filter(x => pkgs.includes(x.split("☹")[0]));
    }
  },
  actions: {
    queryPkgs({ commit }) {
      axios.get("/api/pkgs")
           .then(response => commit("pkgs", response.data));
    },
    queryTypes({ commit, getters }) {
      axios.get("/api/types", { params: { funs: getters.funs } })
           .then(response =>  commit("types", response.data));
    }
  },
  modules: {}
});
