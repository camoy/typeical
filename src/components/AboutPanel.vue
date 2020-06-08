<template>
  <div id="about-div" class="pa-10">
    <h2>Motivation</h2>
    <p>
      TypeVis is an interactive visualization for exploration and analysis
      of type usage in a programming language.
      It visualizes <span class="text-bold">type signatures</span>
      of function calls as flows, with the width corresponding to
      the popularity of the type signatures in the underlying data set.<br/>
      TypeViz provides facilities for filtering data and
      customizing the layout and amount of information shown at a time.
    </p>
    <p>
      The data set used in this visualization is the result of a dynamic
      analysis of function calls in a large number of
      <a href="https://www.r-project.org/">R</a> packages.
      The data set is provided by
      <a href="https://www.khoury.northeastern.edu/people/alexi-turcotte/"
        >Alexi Turcotte</a
      >.
    </p>

    <h2>Overview</h2>
    <p>
      By default, the visualization shows several most popular function call
      signatures in the entire dataset, but it is possible to limit the data
      being displayed.
      For example, the following screenshot shows several of the most popular
      function call signatures from package <span class="text-code">lattice</span>.
    </p>

    <div>
      <v-btn @click="showScreenshots.lattice = !showScreenshots.lattice">
        Show Screenshot
      </v-btn>
      <v-card v-if="showScreenshots.lattice">
        <img class="types-screenshot" src="lattice.png"/>
      </v-card>
    </div>

    <p>
      Most of the flows depict a single type signature of a single function,
      except for <span class="text-code">lattice.getStatus</span>, which has
      two type signatures in the depicted subset of the data.
      The next screenshot shows highlighting of one of the two signatures
      of this function.
    </p>

    <div>
      <v-btn @click="showScreenshots.latticheHighlight = !showScreenshots.latticheHighlight">
        Show Screenshot
      </v-btn>
      <v-card v-if="showScreenshots.latticheHighlight">
        <img class="types-screenshot" src="lattice-highlight-annotated.png"/>
      </v-card>
    </div>

    <p>
      One can get all the type information about a function.
      Thus, the following screenshot shows all type signatures of function
      <span class="text-code">lattice.getStatus</span>.
      The function always
      takes a <span class="text-code">character</span> as the first
      argument and most often takes a <span class="text-code">character</span>
      as the second argument, with the second argument sometimes being
      a <span class="text-code">NULL</span> value.
      The return type of the function varies.
    </p>

    <div>
      <v-btn @click="showScreenshots.latticeFun = !showScreenshots.latticeFun">
        Show Screenshot
      </v-btn>
      <v-card v-if="showScreenshots.latticeFun">
        <img class="types-screenshot" src="lattice-getStatus.png"/>
      </v-card>
    </div>

    <p></p>
    <h2>Filters and Settings</h2>
    <p>
      TypeViz provides facilities for
      <span class="text-italic">filtering</span> data by:
      <ul>
        <li>analyzed packages (drop-down list in
          <span class="text-tab">Settings</span> tab);</li>
        <li>
          definition packages (Packages treemap
          in <span class="text-tab">TypeViz</span> tab);
        </li>
        <li>
          function names (Functions treemap
          in <span class="text-tab">TypeViz</span> tab).
        </li>
      </ul>
      It is also possible to select a function by entering its qualified name
      in the Functions drop-down list in
      <span class="text-tab">TypeViz</span> tab.
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
    showScreenshots: {
      lattice: false,
      latticheHighlight: false,
      latticeFun: false,
    }
  })
};
</script>