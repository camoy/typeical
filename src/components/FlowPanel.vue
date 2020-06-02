<template>
<v-container>
  <svg id="flow-svg">
    <!-- No Data -->
    <g v-if="nodes.length === 0">
      <rect
        x="1%"
        y="1%"
        width="98%"
        height="98%"
        fill="none"
        stroke-width="1"
        rx="5"
        stroke="#666"
        />
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        >
        No Data
      </text>
    </g>

    <!-- Data -->
    <g>
      <!-- Type Rect -->
      <rect
        v-for="(node, k) in nodes"
        class="flow-rect"
        fill="#555"
        :x="node.x0"
        :y="node.y0"
        :height="node.y1 - node.y0"
        :width="node.x1 - node.x0"
        :key="'flow-rect-' + k"
        >
        <title> {{ node.name }} ({{ exactFormat(node.value) }}) </title>
      </rect>

      <!-- Type Label -->
      <text
        v-for="(node, k) in nodes"
        class="flow-type-text"
        text-anchor="middle"
        dy="2em"
        :x="(node.x0 + node.x1) / 2"
        :y="(node.y1 + node.y0) / 2"
        :key="'flow-type-text-' + k"
        >
        <tspan> {{ node.name }} </tspan>
        <tspan
          fill-opacity="0.7"
          dy="1.5em"
          :x="(node.x0 + node.x1) / 2"
          >
          {{ plainFormat(node.value) }}
        </tspan>
      </text>

      <!-- Flow -->
      <path
        v-for="(link, k) in links"
        class="flow-path"
        fill="none"
        :d="layout(link)"
        :key="'flow-path-' + k"
        :stroke="color(link)"
        :stroke-width="link.width"
        @mouseenter="highlight(link, true)"
        @mouseleave="highlight(link, false)"
        >
        <title> {{ typeFormat(link.names) }} ({{ exactFormat(link.value) }}) </title>
      </path>
    </g>
  </svg>

  <!-- Pagination -->
  <v-pagination
    v-model="page"
    :length="pages"
    />
</v-container>
</template>

<style>
#flow-svg {
    width: 100%;
    height: 100%;
}

.flow-path {
    mix-blend-mode: multiply;
    transition: stroke 0.3s;
}

.flow-rect {
    pointer-events: none;
}

.flow-type-text {
    pointer-events: none;
    font-size: 10px;
}
</style>

<script>
//
// Imports
//
import { mapState } from "vuex";
import numeral from "numeral";
import { sankey, sankeyLeft, sankeyVertical, sankeyLinkVertical } from "d3-sankey";
import * as d3 from "d3";

//
// Constants
//
const KEYS = ["fun_name", "arg_t0", "arg_t1", "arg_t2", "arg_t3", "arg_t_r"];
const DEFAULT_COLOR = d3.scaleOrdinal(d3.schemePastel2);
const HIGHLIGHT_COLOR = d3.color("#da4f81");
const UNFOCUSED_OPACITY = 0.25;
const ALIGN = sankeyLeft;
const ORIENTATION = sankeyVertical;
const LAYOUT = sankeyLinkVertical();
const LIMIT = 3;
const NODE_WIDTH = 2;
const NODE_PADDING = 40;
const HEIGHT = 600;
const WIDTH = 1100;

//
// Methods
//

// Number → String
// Returns the given number in plain-English (approximate) format.
const plainFormat = (x) => numeral(x).format("0a");

// Number → String
// Returns the given number exactly, but readable (usually comma separated).
const exactFormat = (x) => x.toLocaleString();

// [Array String] → String
// Given an array of strings, starting with the function name and listing all
// the argument and return types, gives back a type signature string.
function typeFormat(xs) {
    return xs[0] + " : "  + xs.slice(1).join(" → ");
}

// Link → String
// Returns the name of the function from the given link.
const linkFun = (link) => link.names[0];

// Link Boolean → Any
// Given a link and a boolean indicating if the path should be highlighted,
// modifies all incoming and outgoing links to be highlighted.
function highlight(link, shouldHighlight) {
    this.focusedFun = shouldHighlight && linkFun(link);
    pathLinks(link).forEach((link) => link.highlighted = shouldHighlight);
}

// Link → Color
// Returns the color for a link. If it's highlighted, then it's the highlight
// color. If there's a function under focus, but this link isn't connected to
// that function then it's opacity is reduced. Otherwise, give a default color
// based on the type name.
function color(link) {
    if (link.highlighted) return HIGHLIGHT_COLOR;

    if (this.focusedFun && linkFun(link) !== this.focusedFun)
        return d3.color(DEFAULT_COLOR(link.target.name))
        .copy({ opacity: UNFOCUSED_OPACITY });

    return DEFAULT_COLOR(link.target.name);
}

//
// Path Links
//

// Link → [Array Link]
// Returns all incoming and outgoing links (i.e. the flow path) from the
// given one.
const pathLinks = (link) => ancestors(link).concat(descendants(link));

// Link → [Array Link]
// Returns the list of all links that are ancestors of the given one.
function ancestors(link) {
    let names = link.names.join();
    return link.source
        .targetLinks
        .filter(x => names.startsWith(x.names.join()))
        .flatMap(ancestors)
        .concat([link]);
}

// Link → [Array Link]
// Returns the list of all links that are descendants of the given one.
function descendants(link) {
    let names = link.names.join();
    return link.target
        .sourceLinks
        .filter(x => x.names.join().startsWith(names))
        .flatMap(descendants)
        .concat([link]);
}

//
// Sankey
//

// → Any
// Create Sankey diagram from JSON data.
function updateSankey() {
    const data = removeNA(this.types);

    // No data (this is needed since `makeGraph` assumes data).
    if (data.length === 0) {
        this.nodes = this.links = [];
        return;
    }

    // Some data
    const graph = makeGraph(limitPage(data, this.funs, this.pkgs, this.page));
    const layout =
          sankey()
          .nodeSort(null)
          .linkSort(null)
          .nodeWidth(NODE_WIDTH)
          .nodePadding(NODE_PADDING)
          .extent([[0, 5], [WIDTH, HEIGHT - 5]])
          .nodeAlign(ALIGN)
          .nodeOrientation(ORIENTATION);
    const { nodes, links } = layout({
        nodes: graph.nodes.map(d => Object.assign({}, d)),
        links: graph.links.map(d => Object.assign({}, d))
    });

    // Update nodes and links
    this.nodes = nodes;
    this.links = links;
}

// JSON → JSON
// Adjusts type data by removing all NA fields and shifting over the return type
// after the last argument.
function removeNA(data) {
    return data.map((row) => {
        let d = { value: row.count };
        for (let k of KEYS) {
            if (row[k] == "NA") {
                d[k] = row["arg_t_r"];
                break;
            }
            d[k] = row[k];
        }
        return d;
    });
}

// JSON → JSON
// Return only rows that correspond to the current page of results.
function limitPage(data, funs, pkgs, page) {
    let funsAndCount = [];
    for (const funStr of funs) {
        const fun = JSON.parse(funStr);
        const pkg = pkgs.children.find(x => x.name === fun[0]);
        const name = pkg.children.find(x => x.name === fun[1]);
        funsAndCount.push(name);
    }
    let funsOnPage =
        funsAndCount
        .sort((x, y) => y.value - x.value)
        .slice((page - 1) * LIMIT, page * LIMIT)
        .map(x => x.name);
    return data.filter(x => funsOnPage.includes(x.fun_name));
}

// JSON → [Array Node] [Array Links]
// Convert JSON representation of type data into a graph representation usable
// by the D3 Sankey library (from https://observablehq.com/@d3/parallel-sets).
function makeGraph(data) {
    let index = -1;
    const nodes = [];
    const nodeByKey = new Map;
    const indexByKey = new Map;
    const links = [];

    for (const k of KEYS) {
        for (const d of data) {
            const key = JSON.stringify([k, d[k]]);
            if (!d[k] || nodeByKey.has(key)) continue;
            const node = {name: d[k]};
            nodes.push(node);
            nodeByKey.set(key, node);
            indexByKey.set(key, ++index);
        }
    }

    for (let i = 1; i < KEYS.length; ++i) {
        const a = KEYS[i - 1];
        const b = KEYS[i];
        const prefix = KEYS.slice(0, i + 1);
        const linkByKey = new Map;
        for (const d of data) {
            if (!d[a] || !d[b]) continue;
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
            }
            links.push(link);
            linkByKey.set(key, link);
        }
    }

    return { nodes, links };
}

//
// Exports
//
export default {
    name: "FlowPanel",

    // Update Sankey when $store.types changes
    watch: {
        types: updateSankey,
        page: updateSankey
    },
    computed: {
        pages() {
            return Math.ceil(this.funs.length / LIMIT);
        },
        ...mapState(["types", "funs", "pkgs"])
    },
    methods: {
        plainFormat,
        exactFormat,
        typeFormat,
        highlight,
        color,
        layout: LAYOUT
    },
    data: () => ({
        // [Or String false]
        // The currently focused function or false if none is focused.
        focusedFun: false,

        // Natural
        // The current page of type results.
        page: 1,

        // [Array Node]
        // Array of Sankey nodes for rendering.
        nodes: [],

        // [Array Link]
        // Array of Sankey links for rendering.
        links: []
    })
};
</script>
