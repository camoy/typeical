<template>
  <div id="dataset-div" class="pa-10">
    <h2>Overview</h2>
    <p>
      TyViz displays the results of a dynamic analysis of funcion calls in a
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
      :headers="summary.headers"
      :items="summary.data"
      :disable-pagination="true"
      :hide-default-footer="true"
      class="summary-table"
    ></v-data-table>
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
      :height="380"
      class="pkgs-table"
    ></v-data-table>
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
  width: 40rem;
}

.summary-table {
  width: 20rem;
}

.v-data-table thead tr th {
  color: #333;
  font-size: 16px;
}
</style>

<script>
//
// Exports
//
export default {
  name: "DatasetPanel",

  data: () => ({
    summary: {
      headers: [
        { text: "Property", value: "name", sortable: false },
        { text: "Count", value: "count", sortable: false }
      ],
      data: [
        { name: "records", count: 1306643 },
        { name: "function calls", count: 2949685515 },
        { name: "return types", count: 35 },
        { name: "packages", count: 743 },
        { name: "functions", count: 22422 },
        { name: "analyzed packages", count: 485 }
      ]
    },
    packages: {
      headers: [
        { text: "Package", value: "name" },
        { text: "Count", value: "count" }
      ],
      data: [
        { name: "Rmpfr", count: 181446748 },
        { name: "FME", count: 113137516 },
        { name: "subplex", count: 101307510 },
        { name: "sampling", count: 99241318 },
        { name: "distrMod", count: 96912461 },
        { name: "Rmpfr-1", count: 18144674 },
        { name: "FME-1", count: 11313751 },
        { name: "subplex-1", count: 1013075 },
        { name: "sampling-1", count: 992413 },
        { name: "distrMod-1", count: 969124 },
        { name: "Rmpfr-2", count: 181446748 },
        { name: "FME-2", count: 113137516 },
        { name: "subplex-2", count: 101307510 },
        { name: "sampling-2", count: 99241318 },
        { name: "distrMod-2", count: 96912461 },
        { name: "Rmpfr-1-2", count: 18144674 },
        { name: "FME-1-2", count: 11313751 },
        { name: "subplex-1-2", count: 1013075 },
        { name: "sampling-1-2", count: 992413 },
        { name: "distrMod-1-2", count: 969124 }
      ]
    }
  })
};
</script>
