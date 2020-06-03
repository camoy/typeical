<template>
<v-container>
  <!-- Function Autocomplete -->
  <v-autocomplete
    v-model="selectedFuns"
    outlined
    chips
    small-chips
    full-width
    label="Functions"
    multiple
    :items="autocompleteFuns"
    />

  <!-- Package Treemap -->
  <svg class="treemap-svg">
    <!-- Data -->
    <g v-if="pkgRoot">
      <g v-for="(leaf, k) in pkgRoot.leaves()"
         :key="'pkg-treemap-g' + k"
         :transform="`translate(${leaf.x0}, ${leaf.y0})`">
        <title> {{ leafName(leaf) }} </title>
        <rect
          class="treemap-block"
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
        <text
          class="treemap-number"
          dominant-baseline="hanging"
          dx="0.5em"
          dy="2em"
          >
          {{ leafValue(leaf) }}
        </text>
      </g>
    </g>
  </svg>

  <!-- Package Pagination -->
  <v-pagination
    v-if="pkgs.length > 0"
    v-model="pkgPage"
    class="treemap-pagination"
    :length="pkgPages" />

  <!-- Function Treemap -->
  <svg class="treemap-svg">
    <!-- Data -->
    <g v-if="funRoot">
      <g v-for="(leaf, k) in funRoot.leaves()"
         :key="'fun-treemap-g' + k"
         :transform="`translate(${leaf.x0}, ${leaf.y0})`">
        <title> {{ leafName(leaf) }} </title>
        <rect
          class="treemap-block"
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
        <text
          class="treemap-number"
          dominant-baseline="hanging"
          dx="0.5em"
          dy="2em"
          >
          {{ leafValue(leaf) }}
        </text>
      </g>
    </g>
  </svg>

  <!-- Package Pagination -->
  <v-pagination
    v-if="funs.length > 0"
    v-model="funPage"
    class="treemap-pagination"
    :length="funPages" />
</v-container>
</template>

<style>
.treemap-svg {
    width: 100%;
    height: 40%;

}

.treemap-block {
  stroke: #666;
  stroke-width: 1;
}
.treemap-block:hover {
  fill: #bfd3e6;
}

.treemap-text {
    pointer-events: none;
    font-family: monospace;
    font-weight: bold;
    font-size: 12px;
}
.treemap-number {
    pointer-events: none;
    font-size: 12px;
}

.treemap-pagination {
    margin-bottom: 1rem;
}
</style>

<script>
//
// Imports
//
import { mapState } from "vuex";
import * as d3 from "d3";
import numeral from "numeral";

//
// Constants
//

const SELECTED_COLOR = "#8c6bb1"; //"#da4f81";
const DEFAULT_COLOR = "#f9fbfb";
const LIMIT = 5;
const TILE = d3.treemapSquarify;
const WIDTH = 380;
const HEIGHT = 240;
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
    return leafName(leaf) === this.selectedPkg ? SELECTED_COLOR : DEFAULT_COLOR;
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
    return this.selectedFuns.map(x => x.value).includes(fun) ?
        SELECTED_COLOR :
        DEFAULT_COLOR;
}

// Number → String
// Returns the given number in plain-English (approximate) format.
const plainFormat = (x) => numeral(x).format("0a");

//
// TODO
const leafName  = leaf => leaf.data.name;
const leafValue = leaf => plainFormat(Math.exp(leaf.data.value));

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
function makeRoot(dataName, name, pageKey) {
    return function() {
        let page = this[pageKey];
        let data = makeTree(this[dataName], name, page);
        let hierarchy = makeHierarchy(data);
        return LAYOUT(hierarchy)
    };
}

//
// TODO
function makeTree(xs, name, page) {
    let children =
        xs ?
        xs.map(x => { return { name: x[name], value: Math.log(x.count) }; }) :
        [];
    children = children.slice((page - 1) * LIMIT, page * LIMIT);
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
        this.$store.dispatch("queryAllFuns");
        this.$store.dispatch("queryPkgs");
    },

    computed: {
        // [Or #f Object]
        // Root of the package treemap
        pkgRoot: makeRoot("pkgs", "package", "pkgPage"),

        // [Or #f Object]
        // Root of the functions treemap
        funRoot: makeRoot("funs", "fun_name", "funPage"),

        //
        // TODO
        pkgPages() {
            return this.pkgs ? Math.ceil(this.pkgs.length / LIMIT) : 1;
        },

        //
        // TODO
        funPages() {
            return this.funs ? Math.ceil(this.funs.length / LIMIT) : 1;
        },

        //
        // TODO
        autocompleteFuns() {
            return this.allFuns.map(function(x){
                return {
                    text: `${x.package}.${x.fun_name}`,
                    value: JSON.stringify([x.package, x.fun_name])
                }
            });
        },

        //
        //
        selectedFuns: {
            get() {
                return this.$store.state.selectedFuns.map(function(value) {
                    let fun = JSON.parse(value);
                    return { text: `${fun[0]}.${fun[1]}`, value };
                });
            },
            set(value) { this.$store.dispatch("setSelectedFuns", value); }
        },

        ...mapState(["pkgs", "selectedPkg", "funs", "allFuns"])
    },

    methods: {
        selectPkg,
        colorPkg,
        selectFun,
        colorFun,
        leafName,
        leafValue,
        setLeafUID,
        setClipUID
    },

    data: () => ({
        // Natural
        // The current page of package results.
        pkgPage: 1,

        // Natural
        // The current page of function results.
        funPage: 1
    })
};
</script>
