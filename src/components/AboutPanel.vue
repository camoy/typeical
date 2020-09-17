<template>
<div id="about-div" class="pa-4">
  <p>
    TYPEical is an interactive visualization for exploration and analysis of
    type usage in a programming language. It visualizes
    <span class="text-bold">type signatures</span> of function calls as flows,
    with the width corresponding to the popularity of the type signatures in
    the underlying data set.
    TYPEical provides facilities for filtering data and customizing the layout
    and amount of information shown at a time.
    For more information, please see our short paper:
  </p>

  <p class="paper">
    Just TYPEical: Visualizing Common Function Type Signatures in R <br />
    Cameron Moy, Julia Belyakova, Alexi Turcotte, Sara Di Bartolomeo, Cody Dunne <br />
    2020 IEEE Visualization Conference (VIS) Short Papers <br />
    <a href="https://osf.io/pyqac/">Preprint</a>
    &middot;
    <a href="https://osf.io/mc6zt/">OSF</a>
    &middot;
    <a href="https://osf.io/u7mzd/">Talk</a>
    &middot;
    <a href="https://github.com/camoy/typeical">Github</a>
  </p>

  <h2>Demo</h2>
  <video width="100%" controls="">
    <source src="https://files.osf.io/v1/resources/mc6zt/providers/osfstorage/5f458d12bacde802b733b586"
            type="video/mp4">
      <p>
        Your browser doesn't support HTML5 video. Here is a
        <a href="https://files.osf.io/v1/resources/mc6zt/providers/osfstorage/5f458d12bacde802b733b586">link to the video</a>
        instead.
      </p>
  </video>

    <h2>Overview</h2>
    <p>
      As the screenshot below demostrates, the main view of the visualization
      contains multiple distinct components:
    </p>
    <ul>
      <li>type flow panel (on the left);</li>
      <li>
        filtering panel (on the right):
        <ul>
          <li>search bar;</li>
          <li>packages treemap;</li>
          <li>functions treemap.</li>
        </ul>
      </li>
    </ul>
    <p></p>

    <div>
      <v-btn @click="showScreenshots.layout = !showScreenshots.layout">
        <span v-if="!showScreenshots.layout">Show Screenshot</span>
        <span v-if="showScreenshots.layout">Hide Screenshot</span>
      </v-btn>
      <v-card v-if="showScreenshots.layout">
        <img class="types-screenshot" src="vis-layout-ann.png" />
      </v-card>
    </div>

    <p>
      By default, the visualization shows an
      <span class="text-bold">excerpt from the full data</span>, i.e. several
      most popular function call signatures in the entire dataset.
    </p>

    <div>
      <v-btn @click="showScreenshots.default = !showScreenshots.default">
        <span v-if="!showScreenshots.default">Show Screenshot</span>
        <span v-if="showScreenshots.default">Hide Screenshot</span>
      </v-btn>
      <v-card v-if="showScreenshots.default">
        <img class="types-screenshot" src="tyviz-default.png" />
      </v-card>
    </div>

    <p>
      To see a <span class="text-bold">single package excerpt</span>, select the
      package of interest on the Packages treemap. The following screenshot
      shows an excerpt from package <span class="text-code">nlme</span>.
    </p>

    <div>
      <v-btn @click="showScreenshots.nlme = !showScreenshots.nlme">
        <span v-if="!showScreenshots.nlme">Show Screenshot</span>
        <span v-if="showScreenshots.nlme">Hide Screenshot</span>
      </v-btn>
      <v-card v-if="showScreenshots.nlme">
        <img class="types-screenshot" src="nlme.png" />
      </v-card>
    </div>

    <p>
      In this picture, most of the flows depict a single type signature of a
      single function, except for
      <span class="text-code">getCovariate</span> and
      <span class="text-code">coef&lt;-</span>, which both have two type
      signatures in the depicted subset of the data. The next screenshot shows
      highlighting of one of the two signatures of
      <span class="text-code">getCovariate</span>.
    </p>

    <div>
      <v-btn
        @click="showScreenshots.nlmeHighlight = !showScreenshots.nlmeHighlight"
      >
        <span v-if="!showScreenshots.nlmeHighlight">Show Screenshot</span>
        <span v-if="showScreenshots.nlmeHighlight">Hide Screenshot</span>
      </v-btn>
      <v-card v-if="showScreenshots.nlmeHighlight">
        <img class="types-screenshot" src="nlme-highlighted-ann.png" />
      </v-card>
    </div>

    <p>
      Selecting a function on the Functions treemap loads its
      <span class="text-bold">complete type information</span>. The following
      screenshot shows all available type signatures of function
      <span class="text-code">nlme.getCovariate</span>. The function always
      takes a <span class="text-code">class</span> as the first argument, and
      most often does not use the second and third arguments (this is denoted by
      type <span class="text-code">any</span>), with them sometimes having
      <span class="text-code">class</span> type. The return type of the function
      varies, but most often it is either a
      <span class="text-code">list</span>
      or a vector of <span class="text-code">double</span>.
    </p>

    <div>
      <v-btn @click="showScreenshots.nlmeFun = !showScreenshots.nlmeFun">
        <span v-if="!showScreenshots.nlmeFun">Show Screenshot</span>
        <span v-if="showScreenshots.nlmeFun">Hide Screenshot</span>
      </v-btn>
      <v-card v-if="showScreenshots.nlmeFun">
        <img class="types-screenshot" src="nlme-getCovariate.png" />
      </v-card>
    </div>

    <p>
      For <span class="text-code">list</span> and
      <span class="text-code">class</span> types, it is possible to
      <span class="text-bold">increase detalization</span> by checking the box
      "Flows Grouped by function name" in
      <span class="text-tab">Settings</span> tab. The screenshot below shows
      several detailed signatures for
      <span class="text-code">nlme.getCovariate</span> function from above.
    </p>

    <div>
      <v-btn @click="showScreenshots.nlmeFunDet = !showScreenshots.nlmeFunDet">
        <span v-if="!showScreenshots.nlmeFunDet">Show Screenshot</span>
        <span v-if="showScreenshots.nlmeFunDet">Hide Screenshot</span>
      </v-btn>
      <v-card v-if="showScreenshots.nlmeFunDet">
        <img class="types-screenshot" src="nlme-getCovariate-det.png" />
      </v-card>
    </div>

    <h3>Special Features</h3>
    <p>
      <span class="text-bold">Quick function search</span> is supported by the
      search bar in <span class="text-tab">TYPEical</span> tab; to find a
      function, simply start typing its qualified name (e.g.
      <span class="text-code">base.-</span>). <br />
      To search by packages instead of functions, uncheck the box "Autocomplete
      with functions" in <span class="text-tab">Settings</span> tab.
    </p>
    <p>
      When multiple functions are on display, mouse
      <span class="text-bold">click on a flow</span> will load complete
      information about the corresponding function. Subsequent double-click
      anywhere on the diagram will load the previous information.
    </p>

    <p></p>
    <h2>Filters and Settings</h2>
    <p>
      TYPEical provides facilities for
      <span class="text-bold">filtering</span> data by:
    </p>
    <ul>
      <li>
        analyzed packages (drop-down list in
        <span class="text-tab">Settings</span> tab);
      </li>
      <li>
        definition packages (Packages treemap in
        <span class="text-tab">TYPEical</span> tab);
      </li>
      <li>
        function names (Functions treemap in
        <span class="text-tab">TYPEical</span> tab).
      </li>
    </ul>

    <p>
      TYPEical can also be <span class="text-bold">customized</span> using the
      following <span class="text-tab">Settings</span>:
    </p>
    <ul>
      <li>
        "Horizontal Layout" orients flows left-to-right instead of
        top-to-bottom.
      </li>
      <li>
        "Flows Justified" stretches flows so that all return types are aligned.
      </li>
      <li>
        "Type flows per page" sets the maximal number of individual flows shown
        on the main diagram at a time. If the current subset of the data is
        larger, the flows spread across multiple pages.
      </li>
      <li>
        "Flows Grouped by function name" (selected by default) tries to place
        all the flows of the same function onto the same page. When unselected,
        individual flows are simply sorted by popularity, and thus same
        function's flows can spread across multiple pages. Unselected, this
        feature is useful for comparing popular signatures of a small number of
        different functions.
      </li>
      <li>
        "Size of excerpt" sets the maximal number of records loaded from the
        data set when no package function is selected.
      </li>
    </ul>

    <!--<p></p>
    <h2>Acknowledgements</h2>
    <p>
      TYPEical builds on the work of many other open source projects. See
      <a href="http://github.com/camoy/typeical">the Github page</a> for the full
      list.<br />
      In particular, TYPEical redesigns this
      <a href="https://julia.prl.fit.cvut.cz/rtypes-viz">earlier project</a>.
    </p>-->
  </div>
</template>

<style>
.paper {
  border-left: 5px solid #ddd;
  padding-left: 1em;
}

p, li {
  max-width: 80ch;
}

.v-application p {
  margin-bottom: 10px;
  margin-top: 10px;
}

h2 {
  margin-top: 0.75em;
  margin-bottom: 0.5em;
}

h3 {
  padding-bottom: 0px;
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
  width: 1038px;
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
      layout: false,
      default: false,
      nlme: false,
      nlmeHighlight: false,
      nlmeFun: false,
      nlmeFunDet: false
    }
  })
};
</script>
