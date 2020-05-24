<template>
<v-container>
<svg width="100%" height="100%">
  <g>
    <rect
      v-for="(node, k) in nodes"
      fill="#555"
      style="mix-blend-mode: multiply"
      :key="k"
      :x="node.x0"
      :y="node.y0"
      :height="node.y1 - node.y0"
      :width="node.x1 - node.x0"
      >
      <title> {{ node.name }} ({{ node.value.toLocaleString() }}) </title>
    </rect>
  </g>
  <g fill="none">
    <path
      v-for="(link, k) in links"
      style="mix-blend-mode: multiply"
      :key="k"
      :d="link.d"
      :stroke="link.fun === selectedFun ? SELECTION_COLOR : DEFAULT_COLOR"
      :stroke-width="link.width"
      @mouseenter="selectedFun = link.fun"
      @mouseleave="selectedFun = false"
      >
      <title> {{ link.names.join(" → ") }} ({{ link.value.toLocaleString() }}) </title>
    </path>
  </g>
  <g style="font: 10px sans-serif">
    <text
      v-for="(node, k) in nodes"
      dy="2em"
      text-anchor="middle"
      :key="k"
      :x="node.labelX"
      :y="node.labelY"
      >
      <tspan> {{ node.name }} </tspan>
      <tspan dy="1.5em" fill-opacity="0.7" :x="node.labelX"> {{ node.prettyValue }} </tspan>
    </text>
  </g>
</svg>
</v-container>
</template>

<script>
//
// Imports
//
import { mapState } from "vuex";
import numeral from "numeral";
import { sankey, sankeyLeft, sankeyVertical, sankeyLinkVertical } from "d3-sankey";

//
// Constants
//
const keys = ["fun_name", "arg_t0", "arg_t1", "arg_t2", "arg_t_r"];
const DEFAULT_COLOR = "#ccc";
const SELECTION_COLOR = "#da4f81";
const layout = sankeyLinkVertical();
const height = 600;
const width = 1100;
const sankeyLayout =
      sankey()
      .nodeSort(null)
      .linkSort(null)
      .nodeWidth(2)
      .nodePadding(40)
      .extent([[0, 5], [width, height - 5]])
      .nodeAlign(sankeyLeft)
      .nodeOrientation(sankeyVertical);

// Convert JSON data into graph representation.
function makeGraph(data) {
    let index = -1;
    const nodes = [];
    const nodeByKey = new Map;
    const indexByKey = new Map;
    const links = [];

    for (const k of keys) {
        for (const d of data) {
            const key = JSON.stringify([k, d[k]]);
            if (nodeByKey.has(key)) continue;
            const node = {name: d[k]};
            nodes.push(node);
            nodeByKey.set(key, node);
            indexByKey.set(key, ++index);
        }
    }

    for (let i = 1; i < keys.length; ++i) {
        const a = keys[i - 1];
        const b = keys[i];
        const prefix = keys.slice(0, i + 1);
        const linkByKey = new Map;
        for (const d of data) {
            const names = prefix.map(k => d[k]);
            const key = JSON.stringify(names);
            const value = d.value || 1;
            let link = linkByKey.get(key);
            if (link) { link.value += value; continue; }
            link = {
                source: indexByKey.get(JSON.stringify([a, d[a]])),
                target: indexByKey.get(JSON.stringify([b, d[b]])),
                names,
                value
            };
            links.push(link);
            linkByKey.set(key, link);
        }
    }

    return { nodes, links };
}

// Create Sankey diagram from JSON data.
function chart() {
    const data = this.types;

    // Empty case
    if (data.length === 0) {
        this.nodes = this.links = [];
        return;
    }

    // Non-empty case
    const graph = makeGraph(data);

    const {nodes, links} = sankeyLayout({
        nodes: graph.nodes.map(d => Object.assign({}, d)),
        links: graph.links.map(d => Object.assign({}, d))
    });

    for (let node of nodes) {
        node.labelX = (node.x0 + node.x1) / 2;
        node.labelY = (node.y1 + node.y0) / 2;
        node.prettyValue = numeral(node.value).format("0a");
    }

    for (let link of links) {
        link.fun = link.names[0];
        link.d = layout(link);
    }

    this.nodes = nodes;
    this.links = links;
}

//
// Exports
//
export default {
    name: "FlowPanel",
    created() { this.$store.dispatch("queryTypes"); },
    watch: { types: chart },
    computed: mapState(["types"]),
    data: () => ({
        DEFAULT_COLOR,
        SELECTION_COLOR,
        selectedFun: false,
        nodes: [],
        links: []
    })
};
</script>
