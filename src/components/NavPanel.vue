<template>
<v-container>
  <v-autocomplete
    v-model="selectedPkgs"
    :items="$store.getters.pkgNames"
    outlined
    chips
    small-chips
    deletable-chips
    label="Packages"
    multiple
    />
  <svg
    viewBox="0.5 -120.5 954 1320"
    style="font: 30px sans-serif">
    <g
      v-for="(node, k) in nodes"
      :key="k"
      :transform="node === root ? `translate(0,-120)` : `translate(${x(node.x0)},${y(node.y0)})`"
      :cursor="(node !== root || node.parent) ? 'pointer' : 'auto'"
      @click="zoom(node)"
      >
      <title> {{ node.data.name }} ({{ commaFormat(node.value) }}) </title>
      <rect
        stroke="#fff"
        :id="setLeafUID(node)"
        :fill="color(node)"
        :width="node === root ? 954 : x(node.x1) - x(node.x0)"
        :height="node === root ? 120 : y(node.y1) - y(node.y0)"
        />
      <clipPath :id="setClipUID(node)">
        <use :xlink:href="node.leafUid.href" />
      </clipPath>
      <text
        dominant-baseline="hanging?"
        :clip-path="node.clipUid"
        :font-weight="node === root ? 'bold' : null"
        >
        <tspan x="1em" y="1.5em">
          {{ node.data.name }}
        </tspan>
        <tspan x="1em" y="3em" fill-opacity="0.7" font-weight="normal">
          {{ commaFormat(node.value) }}
        </tspan>
      </text>
    </g>
  </svg>
  <v-pagination
    v-if="root.parent"
    v-model="page"
    :length="root.data.pages || 1" />
</v-container>
</template>

<script>
//
// Imports
//
import * as d3 from "d3";
import { mapState } from "vuex";
import numeral from "numeral";
const _ = require("lodash");

//
// UID
//

var count = 0;

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
// Constant
//
const height = 1200;
const width = 954;
const LIMIT = 20;
const TILE = d3.treemapSquarify

//
// Method
//
const x = d3.scaleLinear().rangeRound([0, width]);
const y = d3.scaleLinear().rangeRound([0, height]);
const plainFormat = (d) => numeral(d).format("0a");
const commaFormat = d3.format(",d");
const setLeafUID = node => (node.leafUid = UID("leaf")).id
const setClipUID = node => (node.clipUid = UID("clip")).id

function color(node) {
    if (node === this.root) {
        return "#fff";
    } else if (node.children) {
        return "#ccc";
    } else {
        return node.selected ? "#da4f81" : "#ccc";
    }
}

function zoom(node) {
    if (node === this.root && node.parent) {
        x.domain([node.parent.x0, node.parent.x1]);
        y.domain([node.parent.y0, node.parent.y1]);
        setRoot.call(this, node.parent);
    } else if (node.children) {
        x.domain([node.x0, node.x1]);
        y.domain([node.y0, node.y1]);
        setRoot.call(this, node);
    } else {
        node.selected = !node.selected;
        this.$store.commit("toggleFun", nodeFun(node));
        this.$store.dispatch("queryTypes");
        // HACK: Apparently Vue can't track set mutations.
        this.$forceUpdate();
    }
}

//
// Treemap
//

// HACK: For when your language doesn't have value equality.
const nodeFun = (node) => `${node.parent.data.name}☹${node.data.name}`

function setRoot(root) {
    let nodes = root.children ? root.children.concat(root) : [];
    for (let node of nodes) {
        node.selected = node.parent && this.funsShown.has(nodeFun(node));
    }
    this.root = root;
    this.nodes = nodes;
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
        pkg.pages = Math.ceil(pkg.children.length / LIMIT);
        pkg.children = pkg.children.slice((this.page - 1) * LIMIT, this.page * LIMIT);
    }
    let data = { name: "packages", children: selectedChildren };
    let hierarchy = d3.hierarchy(data).sum(d => d.value).sort((a, b) => b.value - a.value);
    let root = d3.treemap().tile(TILE)(hierarchy);
    let newRoot = this.root ? findNewRoot.call(this, root) : root;
    setRoot.call(this, newRoot);
}

//
// Export
//
export default {
    name: "NavPanel",
    created() { this.$store.dispatch("queryPkgs"); },
    watch: { selectedPkgs: makeTree, page: makeTree },
    computed: mapState(["pkgs", "funsShown"]),
    methods: {
        x,
        y,
        setLeafUID,
        setClipUID,
        plainFormat,
        commaFormat,
        color,
        zoom,
    },
    data: () => ({
        root: false,
        nodes: [],
        page: 1,
        selectedPkgs: []
    })
};
</script>
