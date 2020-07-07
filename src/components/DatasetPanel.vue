<template>
  <div id="dataset-div" class="pa-10">
    <h2>Overview</h2>
    <p>
      TyVis displays the results of a dynamic analysis of funcion calls in a
      large number of
      <a href="https://www.r-project.org/">R</a> packages. <br />
      The data set is provided by
      <a href="https://www.khoury.northeastern.edu/people/alexi-turcotte/"
        >Alexi Turcotte</a
      >.
    </p>

    <p>
      All the analyzed packages have at least 65% code coverage and at least 5
      reverse dependencies (clients using that package). The dynamic analysis
      ran over the test, example, and vignette code of each package.
    </p>

    <h2>Data Summary</h2>
    <h3>Analysis</h3>
    <v-data-table
      :headers="stats.headers"
      :items="stats.data"
      :disable-pagination="true"
      :disable-sort="true"
      :hide-default-footer="true"
      class="summary-table"
    >
      <template v-slot:item.name="{ item }">
        <span>{{ statsName(item.name) }}</span>
      </template>
      <template v-slot:item.count="{ item }">
        <span>{{ plainFormat(item.count) }}</span>
      </template>
    </v-data-table>
    <h3>Anayzed Packages</h3>
    <v-data-table
      :headers="packages.headers"
      :items="packages.data"
      :items-per-page="15"
      :footer-props="{
        showFirstLastPage: true,
        itemsPerPageOptions: [15, 30, 50, 100, -1]
      }"
      :fixed-header="true"
      :calculate-widths="true"
      :height="380"
      class="pkgs-table"
    >
      <template v-slot:item.package_being_analyzed="{ item }">
        <span class="text-pkg-name">{{ item.package_being_analyzed }}</span>
      </template>
      <template v-slot:item.count="{ item }">
        <span>{{ plainFormat(item.count) }}</span>
      </template>
    </v-data-table>
  </div>
</template>

<style>
.v-application p {
  margin-bottom: 10px;
  margin-top: 10px;
}

#dataset-div {
  min-width: 20rem;
  max-width: 70rem;
}

.pkgs-table {
  width: 36rem;
}

.summary-table {
  width: 26rem;
}

.v-data-table thead tr th {
  color: #333;
  font-size: 16px;
}

.text-pkg-name {
  font-family: monospace;
  padding-left: 2px;
  padding-right: 2px;
}
</style>

<script>
//
// Imports
//
import { mapState } from "vuex";
import numeral from "numeral";

//
// Utility Functions
//

// Number → String
// Returns the given number in plain-English (approximate) format.
const plainFormat = x => (x < 1000 ? x : numeral(x).format("0.00a"));

// String → String
// Returns human readable name of the stats parameter
function statsName(name) {
  switch (name) {
    case "distinct_package":
      return "Definition Packages";
    case "distinct_fun_name":
      return "Distinct Function Names";
    case "distinct_package_being_analyzed":
      return "Analyzed Packages";
    case "distinct_record":
      return "Data Set Records";
    case "call":
      return "Function Calls";
    case "distinct_ret_type":
      return "Distinct Return Types";
  }
  return name;
}

//
// Exports
//
export default {
  name: "DatasetPanel",

  // Initialize autocomplete and package treemap.
  created() {
    this.$store.dispatch("queryAnalyzed");
    this.$store.dispatch("queryStats");
  },

  computed: {
    // ([Listof Header], [Listof (String, Number)])
    // Returns the names and count of all the analyzed packages,
    // and the corresponding header
    packages() {
      return {
        headers: [
          {
            text: "Package Name",
            value: "package_being_analyzed",
            align: "center"
          },
          { text: "Number of Function Calls", value: "count", align: "center" }
        ],
        data: this.allAnalyzed
      };
    },
    // ([Listof Header], [Listof (String, Number)])
    // Returns the names and count of available statistics,
    // and the corresponding header
    stats() {
      return {
        headers: [
          {
            text: "Parameter",
            value: "name",
            align: "center"
          },
          { text: "Count", value: "count", align: "center" }
        ],
        data: this.datasetStats
      };
    },
    ...mapState(["allAnalyzed", "datasetStats"])
  },

  methods: {
    plainFormat,
    statsName
  }
};
</script>