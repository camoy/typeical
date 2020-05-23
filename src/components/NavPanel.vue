<template>
<v-container>
  <v-autocomplete
    v-model="selectedPkgs"
    :items="$store.getters.pkgNames"
    outlined
    dense
    chips
    small-chips
    label="Packages"
    multiple
    />

  <svg id="nav-svg" viewBox="0.5 -120.5 954 1320" style="font: 30px sans-serif">
    <g
      v-for="(node, k) in nodes"
      class="list-item"
      :key="k"
      :transform="node === root ? `translate(0,-120)` : `translate(${X(node.x0)},${Y(node.y0)})`"
      :cursor="(node === root ? node.parent : node.children) ? 'pointer' : 'auto'"
      @click="ZOOM(node)"
    >
      <title> {{ NAME(node) }} \n {{ FORMAT(node.value) }} </title>
      <rect
        stroke="#fff"
        :id="(node.leafUid = UID('leaf')).id"
        :fill="node === root ? '#fff' : node.children ? '#ccc' : '#ddd'"
        :width="node === root ? 954 : X(node.x1) - X(node.x0)"
        :height="node === root ? 120 : Y(node.y1) - Y(node.y0)"
        />
      <clipPath :id="(node.clipUid = UID('clip')).id">
        <use :xlink:href="node.leafUid.href" />
      </clipPath>
      <text
        dominant-baseline="hanging"
        :clip-path="node.clipUid"
        :font-weight="node === root ? 'bold' : null"
        >
        <tspan x="1em" y="1.1em">
          {{ node.data.name }}
        </tspan>
        <tspan x="1em" y="2.5em" fill-opacity="0.7" font-weight="normal">
          {{ node.value }}
        </tspan>
      </text>
    </g>
  </svg>
</v-container>
</template>

<script>
//
// Imports
//
import * as d3 from "d3";
import { mapState } from "vuex";

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

function ZOOM() {}

//
// TODO
//

const height = 1200;
const width = 954;
const FORMAT = d3.format(",d");
const X = d3.scaleLinear().rangeRound([0, width]);
const Y = d3.scaleLinear().rangeRound([0, height]);

function NAME(d) {
    return d.ancestors().reverse().map(d => d.data.name).join("/");
}

function tile(node, x0, y0, x1, y1) {
    d3.treemapBinary(node, 0, 0, width, height);
    for (const child of node.children) {
        child.x0 = x0 + child.x0 / width * (x1 - x0);
        child.x1 = x0 + child.x1 / width * (x1 - x0);
        child.y0 = y0 + child.y0 / height * (y1 - y0);
        child.y1 = y0 + child.y1 / height * (y1 - y0);
    }
}

function chart(svg, data, vm) {
    //let group = svg.select("g");

    let treemap = data => d3.treemap().tile(tile)
    (d3.hierarchy(data)
     .sum(d => d.value)
     .sort((a, b) => b.value - a.value));

    function render(root) {
        vm.nodes = root.children.concat(root);
        vm.root = root;
    }

    vm.ZOOM = function(node) {
        if (node === vm.root && node.parent) {
            X.domain([node.parent.x0, node.parent.x1]);
            Y.domain([node.parent.y0, node.parent.y1]);
            render(node.parent);
        } else if (node.children) {
            X.domain([node.x0, node.x1]);
            Y.domain([node.y0, node.y1]);
            render(node);
        }
    }

    render(treemap(data));
}

//
// Export
//
export default {
    name: "NavPanel",

    created() { this.$store.dispatch("queryPkgs"); },

    watch: {
        pkgs(data) { chart(d3.select("#nav-panel"), data, this); },
        selectedPkgs: function(d) { console.log(d); }
    },

    computed: mapState(["pkgs"]),

    data: () => ({
        X: X,
        Y: Y,
        ZOOM: ZOOM,
        UID: UID,
        NAME: NAME,
        FORMAT: FORMAT,
        selectedPkgs: [],
        packages: [],
        nodes: [],
        root: false
    })
};
</script>
