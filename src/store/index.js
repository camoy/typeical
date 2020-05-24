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

// [Set String]
// This array contains pairs of package and function names.
// The flow visualization should only include functions in this
// list. These "pairs" will actually be strings with the pair
// elements separated by a frowny face.
const funsShown = new Set();

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
// The number of pages of results.
const pages = 1;

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
    pages
  },
  getters: {
    pkgNames(state) {
      return state.pkgs ? state.pkgs.children.map((x) => x.name) : [];
    },

    // HACK: Vue erroneously caches this getter. We have to invoke a function
    // to force getter recomputation.
    funs: (state) => () => {
      return Array.from(state.funsShown).map((x) => x.split("☹"));
    }
  },
  mutations: {
    pkgs(state, val) {  state.pkgs = val; },
    types(state, val) {  state.types = val; },
    pages(state, val) {  state.pages = val; },
    toggleFun(state, fun) {
      if (state.funsShown.has(fun)) {
        state.funsShown.delete(fun);
      } else {
        state.funsShown.add(fun);
      }
    }
  },
  actions: {
    queryPkgs({ commit }) {
      axios.get("/api/pkgs")
           .then(response => { commit("pkgs", response.data) });
    },
    queryTypes({ commit, getters }) {
      axios.get("/json/query.json", { params: { funs: getters.funs() } })
           .then(response => {
             let data = response.data;
             commit("types", data.types);
             commit("pages", data.pages);
           });
      axios.get("/api/types", { params: { funs: getters.funs() } });
    }
  },
  modules: {}
});
