<template>
  <div id="about-div" class="pa-10">
    <h2>Motivation</h2>
    <p>
      TypeVis is an interactive visualization for exploration and analysis
      of type usage in a programming language.
      It visualizes <span class="text-bold">type signatures</span>
      of function calls as flows, with their width corresponding to
      the popularity of the type signatures.<br/>
      By default, the visualization shows several most popular function call
      signatures in the entire dataset, but it is possible to limit the data.
      For example, the following screenshot shows several of the most popular
      function call signatures from package <span class="text-code">lattice</span>
      and highlights one of the two signatures of function
      <span class="text-code">lattice.getStatus</span>.
    </p>

    <div>
      <v-btn @click="showLattice = !showLattice">Show Screenshot</v-btn>
      <v-card v-if="showLattice">
        <img class="types-screenshot" src="lattice-highlight-annotated.png"/>
      </v-card>
    </div>

    <p>
      TypeViz provides facilities for
      <span class="text-italic">filtering</span> data by:
      <ul>
        <li>analyzed packages (drop-down list in
          <span class="text-tab">Settings</span> tab);</li>
        <li>
          definition package (Packages treemap
          in <span class="text-tab">TypeViz</span> tab);
        </li>
        <li>
          function (Function treemap
          in <span class="text-tab">TypeViz</span> tab).
        </li>
      </ul>
      It is also possible to select a function by entering its qualified name
      in the Functions drop-down list in
      <span class="text-tab">TypeViz</span> tab.
      For instance, the following screenshot shows the most popular
      type signatures of <span class="text-code">lattice.getStatus</span>.
    </p>

    <div>
      <v-btn @click="showLatticeFun = !showLatticeFun">Show Screenshot</v-btn>
      <v-card v-if="showLatticeFun">
        <img class="types-screenshot" src="lattice-getStatus.png"/>
      </v-card>
    </div>

    <p>
      This show that <span class="text-code">lattice.getStatus</span> always
      takes a <span class="text-code">character</span> as the first
      argument and most often takes a <span class="text-code">character</span>
      as the second argument, although sometimes the second argument
      is a <span class="text-code">NULL</span> value.
      The return type of the function varies.
    </p>
    <p>
      The data set used in this visualization is the result of a dynamic
      analysis of function calls in a large number of R packages. The data set
      is provided by
      <a href="https://www.khoury.northeastern.edu/people/alexi-turcotte/"
        >Alexi Turcotte</a
      >.
    </p>

    <h2>Acknowledgements</h2>
    <p>
      TypeVis builds on the work of many other open source projects. See
      <a href="http://github.com/camoy/typevis">the Github page</a> for the full
      list.<br />
      In particular, TypeVis redesigns this
      <a href="https://julia.prl.fit.cvut.cz/rtypes-viz">earlier project</a>.
    </p>
  </div>
</template>

<style>
.v-application p {
  margin-bottom: 10px;
  margin-top: 10px;
}

#about-div {
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
  name: "AboutPanel",

  data: () => ({
    showLattice: false,
    showLatticeFun: false,
  })
};
</script>