<template>
<v-container>
  <!-- Package Treemap -->
  <svg class="treemap-svg">
    <!-- Data -->
    <g v-if="pkgRoot">
      <g v-for="(leaf, k) in pkgRoot.leaves()"
         :key="'pkg-treemap-g' + k"
         :transform="`translate(${leaf.x0}, ${leaf.y0})`">
        <title> {{ leafName(leaf) }} </title>
        <rect
          stroke-width="1"
          stroke="#666"
          cursor="pointer"
          :id="setLeafUID(leaf)"
          :fill="colorPkg(leaf)"
          :width="leaf.x1 - leaf.x0"
          :height="leaf.y1 -leaf.y0"
          @click="selectPkg(leaf)"
          />
        <clipPath :id="setClipUID(leaf)">
          <use :xlink:href="leaf.leafUID.href" />
        </clipPath>
        <text
          class="treemap-text"
          dominant-baseline="hanging"
          dx="0.5em"
          dy="0.5em"
          :clip-path="leaf.clipUID"
          >
          {{ leafName(leaf) }}
        </text>
      </g>
    </g>
  </svg>

  <!-- Function Treemap -->
  <svg class="treemap-svg">
    <!-- Data -->
    <g v-if="funRoot">
      <g v-for="(leaf, k) in funRoot.leaves()"
         :key="'fun-treemap-g' + k"
         :transform="`translate(${leaf.x0}, ${leaf.y0})`">
        <title> {{ leafName(leaf) }} </title>
        <rect
          stroke-width="1"
          stroke="#666"
          cursor="pointer"
          :id="setLeafUID(leaf)"
          :fill="colorFun(leaf)"
          :width="leaf.x1 - leaf.x0"
          :height="leaf.y1 -leaf.y0"
          @click="selectFun(leaf)"
          />
        <clipPath :id="setClipUID(leaf)">
          <use :xlink:href="leaf.leafUID.href" />
        </clipPath>
        <text
          class="treemap-text"
          dominant-baseline="hanging"
          dx="0.5em"
          dy="0.5em"
          :clip-path="leaf.clipUID"
          >
          {{ leafName(leaf) }}
        </text>
      </g>
    </g>
  </svg>
</v-container>
</template>

<style>
.treemap-svg {
    width: 100%;
    height: 50%;
}

.treemap-text {
    pointer-events: none;
    font-size: 10px;
}
</style>

<script>
//
// Imports
//
import { mapState } from "vuex";
import * as d3 from "d3";

//
// Constants
//

const SELECTED_COLOR = "#da4f81";
const TILE = d3.treemapSquarify;
const WIDTH = 380;
const HEIGHT = 300;
const PADDING = 3;
const LAYOUT =
      d3.treemap()
      .tile(TILE)
      .size([WIDTH, HEIGHT])
      .padding(PADDING)
      .round(true);

//
// Methods
//

// Leaf → Any
// TODO
function selectPkg(leaf) {
    this.$store.dispatch("togglePkg", leafName(leaf));
}

//
// TODO
function colorPkg(leaf) {
    return leafName(leaf) === this.selectedPkg ? SELECTED_COLOR : '#fff';
}

//
// TODO
const leafFun = (leaf, pkg) => JSON.stringify([pkg, leafName(leaf)]);

// Leaf → Any
// TODO
function selectFun(leaf) {
    this.$store.dispatch("toggleFun", leafFun(leaf, this.selectedPkg));
}

//
// TODO
function colorFun(leaf) {
    let fun = leafFun(leaf, this.selectedPkg);
    return this.selectedFuns.includes(fun) ?
        SELECTED_COLOR :
        "#fff";
}

//
// TODO
const leafName = leaf => leaf.data.name;

// Node → String
// Sets and returns a node's leaf UID.
const setLeafUID = node => (node.leafUID = UID("leaf")).id;

// Node → String
// Sets and returns a node's clip UID.
const setClipUID = node => (node.clipUID = UID("clip")).id;

//
// UID Functions
// Source: https://github.com/observablehq/stdlib
//

let count = 0;

function UID(name) {
    return new Id("O-" + (name == null ? "" : name + "-") + ++count);
}

function Id(id) {
    this.id = id;
    this.href = new URL(`#${id}`, location) + "";
}

Id.prototype.toString = function() {
    return "url(" + this.href + ")";
}

//
// Treemap
// Source: https://observablehq.com/@d3/treemap
//

//
// TODO
function makeRoot(dataName, name) {
    return function() {
        let data = makeTree(this[dataName], name);
        let hierarchy = makeHierarchy(data);
        return LAYOUT(hierarchy)
    };
}

//
// TODO
function makeTree(xs, name) {
    let children =
        xs ?
        xs.map(x => { return { name: x[name], value: x.count }; }) :
        [];
    return { name: "", children };
}

//
// TODO
function makeHierarchy(data) {
    return d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
}

//
// Exports
//
export default {
    name: "NavPanel",

    // Query package information to packages
    created() {
        this.$store.dispatch("queryPkgs");
    },

    computed: {
        // [Or #f Object]
        // Root of the package treemap
        pkgRoot: makeRoot("pkgs", "package"),

        // [Or #f Object]
        // Root of the functions treemap
        funRoot: makeRoot("funs", "fun_name"),

        ...mapState(["pkgs", "selectedPkg", "funs", "selectedFuns"])
    },

    methods: {
        selectPkg,
        colorPkg,
        selectFun,
        colorFun,
        leafName,
        setLeafUID,
        setClipUID
    },

    data: () => ({
    })
};
</script>
