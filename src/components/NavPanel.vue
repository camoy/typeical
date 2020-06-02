<template>
<v-container>
  <!-- Package selection -->
  <v-autocomplete
    v-model="selectedPkgs"
    outlined
    chips
    small-chips
    deletable-chips
    label="Packages"
    multiple
    :items="pkgNames"
    @input="$store.dispatch('pruneFuns', selectedPkgs)"
    />

  <!--
  <svg viewBox="0.5 -120.5 954 1020" style="font: 30px sans-serif">
    <text> {{ pkgNames }} </text>
    <g
      v-for="(pkgName, k) in pkgNames"
      :key="k"
      >
      <text> {{ pkgName }} </text>
    </g>
  </svg>
  -->

  <!-- Treemap -->
  <svg id="nav-svg" viewBox="0.5 -120.5 954 1320">
    <!-- No Data -->
    <g v-if="nodes.length === 0">
      <rect
        fill="none"
        stroke-width="2"
        rx="5"
        stroke="#666"
        x="25"
        y="25"
        width="904"
        height="1150"
        />
      <text text-anchor="middle" x="477" y="660">
        No Packages Selected
      </text>
    </g>

    <!-- Data -->
    <g v-for="(node, k) in nodes"
       :key="k"
       :transform="node === root ? `translate(0,-120)` : `translate(${x(node.x0)},${y(node.y0)})`"
       :cursor="(node !== root || node.parent) ? 'pointer' : 'auto'"
       @click="select(node)"
       >
      <title> {{ node.data.name }} ({{ exactFormat(node.value) }}) </title>
      <rect
        stroke="#fff"
        :id="setLeafUID(node)"
        :width="node === root ? 954 : x(node.x1) - x(node.x0)"
        :height="node === root ? 120 : y(node.y1) - y(node.y0)"
        :fill="color(node)"
        />
      <clipPath :id="setClipUID(node)">
        <use :xlink:href="node.leafUid.href" />
      </clipPath>
      <text
        dominant-baseline="hanging"
        :clip-path="node.clipUid"
        :font-weight="node === root ? 'bold' : null"
        >
        <tspan x="1em" y="1em">
          {{ node.data.name }}
        </tspan>
        <tspan x="1em" y="2.25em" fill-opacity="0.7" font-weight="normal">
          {{ exactFormat(node.data.labelValue || node.data.value) }}
        </tspan>
      </text>
    </g>
  </svg>

  <!-- Pagination -->
  <v-pagination
    v-if="root.parent"
    v-model="page"
    :length="root.data.pages || 1"
    />
</v-container>
</template>

<style>
#nav-svg {
    font: 30px sans-serif;
}
</style>

<script>
//
// Imports
//
import * as d3 from "d3";
import { mapState } from "vuex";
const _ = require("lodash");

//
// Constants
//
const ROOT_COLOR = "#fff";
const SELECTED_COLOR = "#da4f81";
const DEFAULT_COLOR = "#ccc";
const TILING = d3.treemapSquarify;
const LIMIT = 20;
const WIDTH = 954;
const HEIGHT = 1200;

//
// Methods
//

// Node → String
// Sets and returns a node's leaf UID.
const setLeafUID = (node) => (node.leafUid = UId("leaf")).id;

// Node → String
// Sets and returns a node's clip UID.
const setClipUID = (node) => (node.clipUid = UId("clip")).id;

// Number → String
// Returns the given number exactly, but readable (usually comma separated).
const exactFormat = (x) => x.toLocaleString();

// Node → String
// Returns the color of the given treemap node. If it's the root, then
// the root color. If selected, then use the selection color. Otherwise
// use the default.
function color(node) {
    if (node === this.root) return ROOT_COLOR;
    if (this.funs.includes(nodeFun(node))) return SELECTED_COLOR;
    return DEFAULT_COLOR;
}

// Node → Any
// If the node is the root, move up a level in the treemap. If the node has
// children, move down a level in the treemap. Otherwise, this is a leaf
// node, so we select the function at the node.
function select(node) {
    if (node === this.root && node.parent) return this.root = node.parent;
    if (node.children) return this.root = node;
    this.$store.dispatch("toggleFun", nodeFun(node));
}

//
// UId Functions
// Source: https://github.com/observablehq/stdlib
//

let count = 0;

function UId(name) {
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
// Source: https://observablehq.com/@d3/zoomable-treemap
//

// → Any
// Create treemap from JSON data.
function updateTreemap() {
    const children = makeChildren(this.pkgs, this.selectedPkgs, this.page);
    const labelValue = children.reduce((acc, x) => acc + x.labelValue, 0);
    const data = { name: "packages", children, labelValue };
    const hierarchy = d3.hierarchy(data).sum(d => d.value).sort((a, b) => b.value - a.value);
    const newRoot = d3.treemap().tile(tile)(hierarchy);
    this.root = this.root ? nextRoot(this.root, newRoot) : newRoot;
}

// [Array Package] [Array Package] Natural → [Array Package]
// Given JSON data and some constraints (selected packages and current page)
// adjusts the data accordingly.
function makeChildren(pkgs, selectedPkgs, page) {
    let children =
        _.cloneDeep(pkgs.children)
        .filter(x => selectedPkgs.includes(x.name));
    for (let pkg of children) {
        pkg.labelValue = pkg.children.reduce((acc, x) => acc + x.value, 0);
        pkg.pages = Math.ceil(pkg.children.length / LIMIT);
        pkg.children = pkg.children.slice((page - 1) * LIMIT, page * LIMIT);
    }
    return children;
}

// Node Node → Node
// Given the current node and the root of a newly calculated treemap, determines
// the new root. This is either the same place as `cur` if it exists in `newRoot`
// or `newRoot` itself if it no longer exists.
function nextRoot(cur, newRoot) {
    // Ascend from `cur`
    let stack = [];
    do {
        stack.push(cur.data.name);
        cur = cur.parent;
    } while (cur);

    // Descend from `newRoot` using path in `stack`
    stack.pop();
    cur = newRoot;
    while (cur && stack.length > 0) {
        let name = stack.pop();
        cur = cur.children && cur.children.find(e => e.data.name === name);
    }

    // Old position if it exists, otherwise use new root
    return cur || newRoot;
}

// Node Number Number Number Number → Any
// Sets the dimensions of the children of the current node based on the
// treemap layout algorithm.
function tile(node, x0, y0, x1, y1) {
    TILING(node, 0, 0, WIDTH, HEIGHT);
    for (const child of node.children) {
        child.x0 = x0 + child.x0 / WIDTH * (x1 - x0);
        child.x1 = x0 + child.x1 / WIDTH * (x1 - x0);
        child.y0 = y0 + child.y0 / HEIGHT * (y1 - y0);
        child.y1 = y0 + child.y1 / HEIGHT * (y1 - y0);
    }
}

// HACK: For when your language doesn't have value equality.
const nodeFun = node => JSON.stringify([node.parent.data.name, node.data.name]);

//
// Exports
//
export default {
    name: "NavPanel",

    // Query package information to populate autocomplete
    created() { this.$store.dispatch("queryPkgs"); },

    // Update treemap if a package is selected, the package list changes (due
    // to analyzed packages changing), or the page changed.
    watch: {
        selectedPkgs: updateTreemap,
        pkgs: updateTreemap,
        page: updateTreemap
    },

    // Computed properties for rendering based on the root
    computed: {
        nodes() {
            let root = this.root;
            return root && root.children ? root.children.concat(root) : [];
        },
        x() {
            return d3
                .scaleLinear()
                .rangeRound([0, WIDTH])
                .domain([this.root.x0, this.root.x1]);
        },
        y() {
            return d3
                .scaleLinear()
                .rangeRound([0, HEIGHT])
                .domain([this.root.y0, this.root.y1]);
        },
        pkgNames() {
            return this.pkgs ? this.pkgs.children.map(x => x.name) : [];
        },
        ...mapState(["pkgs", "funs"])
    },
    methods: {
        setLeafUID,
        setClipUID,
        exactFormat,
        color,
        select
    },
    data: () => ({
        // [Or Node false]
        // The current root node or false if there is no treemap.
        root: false,

        // Natural
        // The current page of function results.
        page: 1,

        // [Array Package]
        // An array containing currently selected packages (from the
        // autocomplete).
        selectedPkgs: []
    })
};
</script>
