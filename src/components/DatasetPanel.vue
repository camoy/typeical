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

.text-bold {
  font-weight: bold;
}
.text-italic {
  font-style: italic;
}
.text-tab {
  font-variant: small-caps;
}
.text-code {
  font-family: monospace;
  font-size: smaller;
  padding-left: 2px;
  padding-right: 2px;
  background-color: #efefef;
}

.types-screenshot {
  width: 1000px;
  display: block;
}
</style>

<script>
//
// Exports
//
export default {
  name: "DatasetPanel"
};
</script>
