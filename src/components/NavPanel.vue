<template>
<v-container>
  <!-- Package Autocomplete -->
  <v-autocomplete
    v-if="!autocompleteWithFuns"
    v-model="selectedPkg"
    dense
    outlined
    full-width
    label="Packages"
    :items="pkgNames"
    />

  <!-- Function Autocomplete -->
  <v-autocomplete
    v-if="autocompleteWithFuns"
    v-model="selectedFuns"
    dense
    outlined
    chips
    small-chips
    deletable-chips
    full-width
    label="Functions"
    multiple
    :items="autocompleteFuns"
    />

  <!-- Packages -->
  <div class="treemap-div">
    <h4>Packages</h4>

    <!-- Package Treemap -->
    <svg class="treemap-svg">
      <!-- Data -->
      <g v-if="pkgRoot.children">
        <g v-for="(leaf, k) in pkgRoot.leaves()"
           :key="'pkg-treemap-g' + k"
           :transform="`translate(${leaf.x0}, ${leaf.y0})`">
          <title> {{ leafName(leaf) }} ({{ leafValue(leaf) }}) </title>
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
            :fill="colorPkgText(leaf)"
            :clip-path="leaf.clipUID"
            >
            {{ leafName(leaf) }}
          </text>
          <text
            class="treemap-number"
            dominant-baseline="hanging"
            dx="0.5em"
            dy="2em"
            :fill="colorPkgText(leaf)"
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
      :length="pkgPages"
      />
  </div>

  <!-- Functions -->
  <div class="treemap-div" v-if="funRoot.children">
    <h4>Functions</h4>

    <!-- Function Treemap -->
    <svg class="treemap-svg">
      <!-- Data -->
      <g v-for="(leaf, k) in funRoot.leaves()"
         :key="'fun-treemap-g' + k"
         :transform="`translate(${leaf.x0}, ${leaf.y0})`">
        <title> {{ leafName(leaf) }} ({{ leafValue(leaf) }}) </title>
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
          :fill="colorFunText(leaf)"
          :clip-path="leaf.clipUID"
          >
          {{ leafName(leaf) }}
        </text>
        <text
          class="treemap-number"
          dominant-baseline="hanging"
          dx="0.5em"
          dy="2em"
          :fill="colorFunText(leaf)"
          >
          {{ leafValue(leaf) }}
        </text>
      </g>
    </svg>

    <!-- Function Pagination -->
    <v-pagination
      v-if="funs.length > 0"
      v-model="funPage"
      class="treemap-pagination"
      :length="funPages"
      />
  </div>
</v-container>
</template>

<style>
h4 {
    text-align: center;
    margin: 5px;
}

.treemap-svg {
    width: 100%;
    height: 195px;
    margin-bottom: 10px;
}

.treemap-div {
    width: 100%;
    margin: auto;
}

.treemap-block {
  stroke: #333;
  stroke-width: 0.75;
  rx: 4px;
}

.treemap-block:hover {
  fill: #77B5F1;
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

const SELECTED_COLOR = "#1976d2"; //"#8c6bb1"; //"#da4f81";
const DEFAULT_COLOR  = "#fdfdfd"; //"#f9fbfb";
const SELECTED_TEXT_COLOR = "white";
const DEFAULT_TEXT_COLOR  = "black";
const LIMIT = 5;
const TILE = d3.treemapSquarify;
const WIDTH = 380;
const HEIGHT = 195;
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
    let pkg = leafName(leaf);
    this.selectedPkg = this.selectedPkg === pkg ? undefined : pkg;
}

// Leaf -> Bool
// Checks if leaf corresponds to a selected package
function isSelectedPkg(receiver, leaf) {
    return leafName(leaf) === receiver.selectedPkg;
}

//
// TODO
function colorPkg(leaf) {
    return isSelectedPkg(this, leaf) ? SELECTED_COLOR : DEFAULT_COLOR;
}

//
// TODO
function colorPkgText(leaf) {
    return isSelectedPkg(this, leaf) ? SELECTED_TEXT_COLOR : DEFAULT_TEXT_COLOR;
}

//
// TODO
const leafFun = (leaf, pkg) => JSON.stringify([pkg, leafName(leaf)]);

// Leaf → Any
// TODO
function selectFun(leaf) {
    const canToggle =
          this.selectMultipleFuns ||
          isSelectedFun.call(this, leaf) ||
          this.selectedFuns.length === 0;
    if (canToggle) {
        let fun = leafFun(leaf, this.selectedPkg);
        this.selectedFuns =
            this.selectedFuns.includes(fun) ?
            this.selectedFuns.filter(x => x !== fun) :
            this.selectedFuns.concat([fun]);
    } else {
        this.selectedFuns = [leafFun(leaf, this.selectedPkg)];
    }
}

// Leaf → Bool
// Returns if leaf is selected.
function isSelectedFun(leaf) {
    let fun = leafFun(leaf, this.selectedPkg);
    return this.selectedFuns.includes(fun);
}

//
// TODO
function colorFun(leaf) {
    return isSelectedFun.call(this, leaf) ? SELECTED_COLOR : DEFAULT_COLOR;
}

//
// TODO
function colorFunText(leaf) {
    return isSelectedFun.call(this, leaf) ? SELECTED_TEXT_COLOR : DEFAULT_TEXT_COLOR;
}

// Number → String
// Returns the given number in plain-English (approximate) format.
const plainFormat = (x) => numeral(x).format("0a");

//
// TODO
const leafName  = leaf => leaf.data.name;
const leafValue = leaf => plainFormat(Math.exp(leaf.data.value - 1));

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
        return LAYOUT(hierarchy);
    };
}

//
// TODO
function makeTree(xs, name, page) {
    let children =
        xs ?
        xs.map(x => { return { name: x[name], value: Math.log(x.count) + 1 }; }) :
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

    watch: {
        pkgs() {
            this.pkgPage = 1;
            this.funPage = 1;
        },
        selectedPkg() {
            if (this.selectedFuns.length === 0) {
                this.$store.dispatch("queryTypes");
            }

            this.funPage = 1;
        }
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
        pkgNames() {
            return this.pkgs.map(x => x.package);
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
        // TODO
        selectedPkg: {
            get() { return this.$store.state.selectedPkg; },
            set(value) { this.$store.dispatch("setSelectedPkg", value); }
        },

        //
        // TODO
        selectedFuns: {
            get() { return this.$store.state.selectedFuns; },
            set(value) { this.$store.dispatch("setSelectedFuns", value); }
        },

        ...mapState([
            "pkgs",
            "funs",
            "allFuns",
            "selectMultipleFuns",
            "autocompleteWithFuns"
        ])
    },

    methods: {
        selectPkg,
        colorPkg,
        colorPkgText,
        selectFun,
        colorFun,
        colorFunText,
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
