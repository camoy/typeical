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
    :items="$store.getters.pkgNames"
    />

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
    if (this.funsShown.includes(nodeFun(node))) return SELECTED_COLOR;
    return DEFAULT_COLOR;
}

// Node → Any
// If the node is the root, move up a level in the treemap. If the node has
// children, move down a level in the treemap. Otherwise, this is a leaf
// node, so we select the function at the node.
function select(node) {
    if (node === this.root && node.parent) return this.root = node.parent;
    if (node.children) return this.root = node;

    this.$store.commit("toggleFun", nodeFun(node));
    this.$store.dispatch("queryTypes");
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

// HACK: For when your language doesn't have value equality.
const nodeFun = (node) => `${node.parent.data.name}☹${node.data.name}`

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

function findNewRoot(root) {
    let cur = this.root;
    let stack = [];
    do {
        stack.push(cur.data.name);
        cur = cur.parent;
    } while (cur);

    stack.pop();
    cur = root;
    while (cur && stack.length > 0) {
        let name = stack.pop();
        cur = cur.children && cur.children.find(e => e.data.name === name);
    }

    return cur || root;
}

function makeTree() {
    let selectedPkgs = this.selectedPkgs;
    let selectedChildren =
        _.cloneDeep(this.pkgs.children)
        .filter(x => selectedPkgs.includes(x.name));
    for (let pkg of selectedChildren) {
        pkg.labelValue = pkg.children.reduce((acc, x) => acc + x.value, 0);
        pkg.pages = Math.ceil(pkg.children.length / LIMIT);
        pkg.children = pkg.children.slice((this.page - 1) * LIMIT, this.page * LIMIT);
    }
    let labelValue = selectedChildren.reduce((acc, x) => acc + x.labelValue, 0);
    let data = { name: "packages", children: selectedChildren, labelValue };
    let hierarchy = d3.hierarchy(data).sum(d => d.value).sort((a, b) => b.value - a.value);
    let root = d3.treemap().tile(tile)(hierarchy);
    let newRoot = this.root ? findNewRoot.call(this, root) : root;
    this.root = newRoot;
}

//
// Exports
//
export default {
    name: "NavPanel",
    created() { this.$store.dispatch("queryPkgs"); },
    watch: {
        selectedPkgs(pkgs) {
            this.$store.commit("pruneFun", pkgs);
            this.$store.dispatch("queryTypes");
            makeTree.call(this);
        },
        pkgs: makeTree,
        page: makeTree
    },
    computed:{
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
        ...mapState(["pkgs", "funsShown"])
    },
    methods: {
        setLeafUID,
        setClipUID,
        exactFormat,
        color,
        select
    },
    data: () => ({
        root: false,
        page: 1,
        selectedPkgs: []
    })
};
</script>
