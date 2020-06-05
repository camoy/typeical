<template>
<v-container id="navigationDiv">
  <!-- Package Autocomplete -->
  <v-autocomplete
    v-if="!autocompleteWithFuns"
    v-model="selectedPkg"
    class="autocomplete-list"
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
    class="autocomplete-list"
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

  <div id="treemapsDiv">
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
  </div>
</v-container>
</template>

<style>
#navigationDiv {
    text-align: center;
}

h4 {
    text-align: center;
    margin: 5px;
}

.v-text-field.v-text-field--enclosed.autocomplete-list {
    margin: auto;
}

.v-input.autocomplete-list {
    max-width: 30rem;
}

#treemapsDiv {
    display: flex;
    flex-direction: column;
}

.treemap-svg {
    width: 100%;
    height: 195px;
    margin-bottom: 10px;
}

.treemap-div {
    width: 430px;
    margin: auto;
    padding-left: 15px;
    padding-right: 15px;
}
@media (max-width: 1704px) {
    #treemapsDiv {
        flex-direction: row;
        max-width: 920px;
    }
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
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 1rem;
    max-width: 400px;
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

const SELECTED_COLOR = "#1976d2";
const DEFAULT_COLOR  = "#fdfdfd";
const SELECTED_TEXT_COLOR = "white";
const DEFAULT_TEXT_COLOR  = "black";
const LIMIT = 5;
const TILE = d3.treemapSquarify;
const WIDTH = 400;
const HEIGHT = 195;
const PADDING = 3;
const LAYOUT =
      d3.treemap()
      .tile(TILE)
      .size([WIDTH, HEIGHT])
      .padding(PADDING)
      .round(true);

//
// Package Methods
//

// Leaf → Any
// Called when a package is selected. This updates the selected package
// by toggling it.
function selectPkg(leaf) {
    let pkg = leafName(leaf);
    this.selectedPkg = this.selectedPkg === pkg ? undefined : pkg;
}


// Leaf → Color
// Returns the appropriate color for a package.
function colorPkg(leaf) {
    return isSelectedPkg.call(this, leaf) ? SELECTED_COLOR : DEFAULT_COLOR;
}

// Leaf → Color
// Returns the appropriate color for a package's label.
function colorPkgText(leaf) {
    return isSelectedPkg.call(this, leaf) ? SELECTED_TEXT_COLOR : DEFAULT_TEXT_COLOR;
}

//
// Function Methods
//

// Leaf → Any
// Called when a function is selected. Will toggle the function or select
// multiple functions depending on the settings.
function selectFun(leaf) {
    const base = this.selectMultipleFuns ? this.selectedFuns : [];
    const fun = leafFun(leaf, this.selectedPkg);
    this.selectedFuns =
        this.selectedFuns.includes(fun) ?
        base.filter(x => x !== fun) :
        base.concat([fun]);
}

// Leaf → Color
// Returns the appropriate color for a function.
function colorFun(leaf) {
    return isSelectedFun.call(this, leaf) ? SELECTED_COLOR : DEFAULT_COLOR;
}

// Leaf → Color
// Returns the appropriate color for a function's label.
function colorFunText(leaf) {
    return isSelectedFun.call(this, leaf) ? SELECTED_TEXT_COLOR : DEFAULT_TEXT_COLOR;
}

//
// Generic Methods
//

// Leaf → String
// Format leaf properties for display.
const leafName  = leaf => leaf.data.name;
const leafValue = leaf => plainFormat(Math.exp(leaf.data.value - 1));

// Node → String
// Sets and returns a node's leaf UID.
const setLeafUID = node => (node.leafUID = UID("leaf")).id;

// Node → String
// Sets and returns a node's clip UID.
const setClipUID = node => (node.clipUID = UID("clip")).id;

//
// Utility Functions
//

// Number → String
// Returns the given number in plain-English (approximate) format.
const plainFormat = (x) => numeral(x).format("0a");

// Leaf String → JSON
// Returns the JSON representation of a function.
const leafFun = (leaf, pkg) => JSON.stringify([pkg, leafName(leaf)]);

// Leaf → Bool
// Checks if the leaf is selected.
function isSelectedPkg(leaf) {
    return leafName(leaf) === this.selectedPkg;
}

// Leaf → Bool
// Returns if the given leaf is selected.
function isSelectedFun(leaf) {
    let fun = leafFun(leaf, this.selectedPkg);
    return this.selectedFuns.includes(fun);
}

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

// String String String → (→ Node)
// Given the field of `this` to use for the data, the data column name,
// the field of `this` to use for the page, constructs a function that will
// lay out the treemap.
function makeRoot(dataName, name, pageKey) {
    return function() {
        let page = this[pageKey];
        let data = makeTree(this[dataName], name, page);
        let hierarchy = makeHierarchy(data);
        return LAYOUT(hierarchy);
    };
}

// List String Natural → Object
// Given the data for a treemap, the data column name, and the page, this
// function will construct a treemap object suitable for laying out that
// data. It also does some preprocessing (like taking the `log` of the count)
// for nicer visualization.
function makeTree(xs, name, page) {
    let children =
        xs ?
        xs.map(x => { return { name: x[name], value: Math.log(x.count) + 1 }; }) :
        [];
    children = children.slice((page - 1) * LIMIT, page * LIMIT);
    return { name: "", children };
}

// List → Object
// Construct a hierarchy from the data.
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

    // Initialize autocomplete and package treemap.
    created() {
        this.$store.dispatch("queryAllFuns");
        this.$store.dispatch("queryPkgs");
    },

    watch: {
        // New packages will reset the page of both treemaps
        pkgs() {
            this.pkgPage = 1;
            this.funPage = 1;
        },

        // A new package will request default data (if no selcted functions)
        // and reset the page of the function treemap
        selectedPkg() {
            if (this.selectedFuns.length === 0)
                this.$store.dispatch("queryTypes");

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

        // [Listof String]
        // Returns the names of all the packages.
        pkgNames() {
            return this.pkgs.map(x => x.package);
        },

        // Natural
        // Returns the total numbers of pages for the package treemap.
        pkgPages() {
            return this.pkgs ? Math.ceil(this.pkgs.length / LIMIT) : 1;
        },

        // Natural
        // Returns the total numbers of pages for the function treemap.
        funPages() {
            return this.funs ? Math.ceil(this.funs.length / LIMIT) : 1;
        },

        // List
        // Returns the items for the autocomplete with functions.
        autocompleteFuns() {
            return this.allFuns.map(function(x){
                return {
                    text: `${x.package}.${x.fun_name}`,
                    value: JSON.stringify([x.package, x.fun_name])
                }
            });
        },

        // [Or undefined String]
        // The curretnly selected package.
        selectedPkg: {
            get() { return this.$store.state.selectedPkg; },
            set(value) { this.$store.dispatch("setSelectedPkg", value); }
        },

        // List
        // The currently selected functions.
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
