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

// [Listof [List String String]]
// This array contains pairs of package and function names.
// The flow visualization should only include functions in this
// list.
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
// The number of pages of results.
const numPages = 1;

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
    numPages
  },
  getters: {
    pkgNames(state) {
      return state.pkgs ? state.pkgs.children.map((x) => x.name) : [];
    }
  },
  mutations: {
    pkgs(state, val) {  state.pkgs = val; }
  },
  actions: {
    queryPkgs({ commit }) {
      axios.get("/json/packages.json")
           .then(response => { commit("pkgs", response.data) });
    }
  },
  modules: {}
});
