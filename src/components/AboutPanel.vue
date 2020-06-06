<template>
<div id="about-div" class="pa-10">
  <h2> Motivation </h2>
  <p>
    TypeVis is an interactive visualization of type information about
    function calls for exploration and analysis.
    It provides facilities for filtering data, displaying type signatures as flows, and integrates additional quantitative information.
  </p>
  <p>
    The data set used in this visualization is the result of a dynamic analysis
    of function calls in a large number of R packages. The data set is provided by
    <a href="https://www.khoury.northeastern.edu/people/alexi-turcotte/">Alexi Turcotte</a>.
  </p>

  <h2> Acknowledgements </h2>
  <p>
    TypeVis builds on the work of many other open source projects.
    See <a href="http://github.com/camoy/typevis">the Github page</a>
    for the full list.<br/>
    In particular, TypeVis redesigns this
    <a href="https://julia.prl.fit.cvut.cz/rtypes-viz">earlier project</a>.
  </p>
</div>
</template>

<style>
  #about-div {
    min-width: 20rem;
  }
</style>
