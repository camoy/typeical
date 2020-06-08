<template>
  <v-container>
    <div id="flow-svg-div">
      <!-- <svg id="flow-svg" :viewBox="viewBox" preserveAspectRatio="xMidYMid meet"> -->
      <svg id="flow-svg" preserveAspectRatio="xMidYMid meet">
        <!-- No Data -->
        <g v-if="nodes.length === 0">
          <rect
            width="98%"
            height="98%"
            fill="none"
            stroke-width="1"
            stroke="#666"
          />
          <text x="50%" y="50%" fill="#666" text-anchor="middle">
            No Data
          </text>
        </g>

        <!-- Data -->
        <g id="flow-g">
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
            <title>{{ node.name }} ({{ exactFormat(node.value) }})</title>
          </rect>

          <!-- Type Label -->
          <text
            v-for="(node, k) in nodes"
            class="flow-type-text"
            :dominant-baseline="typeAlign.call(this, node, true)"
            :text-anchor="typeAlign.call(this, node, false)"
            :dx="typePosition.call(this, node, true)"
            :dy="typePosition.call(this, node, false)"
            :x="(node.x0 + node.x1) / 2"
            :y="(node.y1 + node.y0) / 2"
            :key="'flow-type-text-' + k"
          >
            <tspan>{{ node.name }}</tspan>
            <!-- prettier-ignore -->
            <tspan
            fill-opacity="0.7"
            dy="1.5em"
            :dx="typePosition.call(this, node, true)"
            :x="(node.x0 + node.x1) / 2"
            >{{ plainFormat(node.value) }}</tspan>
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
            <title>
              {{ typeFormat(link.names) }} ({{ exactFormat(link.value) }})
            </title>
          </path>
        </g>
      </svg>
    </div>

    <!-- Pagination -->
    <div>
      <v-pagination v-if="nodes.length > 0" v-model="page" :length="pages" />
    </div>
  </v-container>
</template>

<style>
/*
#flow-svg-container {
  margin: 5px;
  padding: 0px;
  min-width: 900px;
  width: 100%;
}

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
*/

#flow-svg-div {
  margin: 0px;
  padding: 0px;
  /* min-width: 1050px; */
}
#flow-svg {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 636px;
  cursor: move;
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
import {
  sankey,
  sankeyLeft,
  sankeyHorizontal,
  sankeyLinkHorizontal,
  sankeyVertical,
  sankeyLinkVertical
} from "d3-sankey";
import * as d3 from "d3";
import * as d3dag from "d3-dag";
import PromiseWorker from "promise-worker";
import Decrosser from "worker-loader!@/decrosser";

//
// Constants
//
const KEYS = [
  "fun_name",
  "arg_t0",
  "arg_t1",
  "arg_t2",
  "arg_t3",
  "arg_t4",
  "arg_t5",
  "arg_t6",
  "arg_t7",
  "arg_t8",
  "arg_t9",
  "arg_t10",
  "arg_t11",
  "arg_t12",
  "arg_t13",
  "arg_t14",
  "arg_t15",
  "arg_t16",
  "arg_t17",
  "arg_t18",
  "arg_t19",
  "arg_t_r"
];
const DEFAULT_COLOR = d3.scaleOrdinal(d3.schemePastel2);
const HIGHLIGHT_COLOR = d3.color("#da4f81");
const UNFOCUSED_OPACITY = 0.25;
const ALIGN = sankeyLeft;
const DECROSS_TIMEOUT = 2000;

const NODE_WIDTH = 2;
const NODE_PADDING = 40;
const HEIGHT_PADDING = 12;
const WIDTH_PADDING = 12;
const PX_PER_FLOW = 200;

//
// Methods
//

// Number → String
// Returns the given number in plain-English (approximate) format.
const plainFormat = x => numeral(x).format("0a");

// Number → String
// Returns the given number exactly, but readable (usually comma separated).
const exactFormat = x => x.toLocaleString();

// [Array String] → String
// Given an array of strings, starting with the function name and listing all
// the argument and return types, gives back a type signature string.
function typeFormat(xs) {
  return xs[0] + " : " + xs.slice(1).join(" → ");
}

// Link → String
// Returns the name of the function from the given link.
const linkFun = link => link.names[0];

// Node → String
//
function typeAlign(node, baseline) {
  const last = node.sourceLinks.length === 0;
  if (baseline) {
    if (last) return this.horizontalLayout ? "auto" : "baseline";
    return this.horizontalLayout ? "auto" : "hanging";
  } else {
    if (last) return this.horizontalLayout ? "end" : "middle";
    return this.horizontalLayout ? "start" : "middle";
  }
}

// Node → String
//
function typePosition(node, dx) {
  const last = node.sourceLinks.length === 0;
  if (dx) {
    return (last ? "-" : "") + (this.horizontalLayout ? "1em" : "0");
  } else {
    if (last) return this.horizontalLayout ? "0" : "-2em";
    return this.horizontalLayout ? "0" : "1em";
  }
}

// Link Boolean → Any
// Given a link and a boolean indicating if the path should be highlighted,
// modifies all incoming and outgoing links to be highlighted.
function highlight(link, shouldHighlight) {
  this.focusedFun = shouldHighlight && linkFun(link);
  pathLinks(link).forEach(link => (link.highlighted = shouldHighlight));
}

// Link → Color
// Returns the color for a link. If it's highlighted, then it's the highlight
// color. If there's a function under focus, but this link isn't connected to
// that function then it's opacity is reduced. Otherwise, give a default color
// based on the type name.
function color(link) {
  if (link.highlighted) return HIGHLIGHT_COLOR;

  if (this.focusedFun && linkFun(link) !== this.focusedFun) {
    return d3
      .color(DEFAULT_COLOR(link.target.name))
      .copy({ opacity: UNFOCUSED_OPACITY });
  }

  return DEFAULT_COLOR(link.target.name);
}

//
// Path Links
//

// Link → [Array Link]
// Returns all incoming and outgoing links (i.e. the flow path) from the
// given one.
const pathLinks = link => ancestors(link).concat(descendants(link));

// Link → [Array Link]
// Returns the list of all links that are ancestors of the given one.
function ancestors(link) {
  let names = link.names.join();
  return link.source.targetLinks
    .filter(x => names.startsWith(x.names.join()))
    .flatMap(ancestors)
    .concat([link]);
}

// Link → [Array Link]
// Returns the list of all links that are descendants of the given one.
function descendants(link) {
  let names = link.names.join();
  return link.target.sourceLinks
    .filter(x => x.names.join().startsWith(names))
    .flatMap(descendants)
    .concat([link]);
}

//
// Sankey
//

// → Any
// Update Sankey, but also reset the page number.
function updateSankeyWithReset() {
  this.page = 1;
  updateSankey.call(this);
}

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
  const { nodes, links } = makeGraph(
    limitPageFlow(data, this.flowsPerPage, this.page)
  );
  this.$store.commit("incrementPending");
  decrossSankey.call(this, true, nodes, links);
}

// Boolean Nodes Links → Any
// Updates Sankey diagram according the decrosser. Uses a worker to calculate the decrossing.
// If the optimal one doesn't finish within the timeout, use a less optimal setting.
function decrossSankey(opt, nodes, links) {
  const decrosser = new Decrosser();
  const promise = new PromiseWorker(decrosser);
  let done = false;
  promise.postMessage([opt, links]).then(decrossedDag => {
    done = true;
    layoutSankey.call(this, decrossedDag, nodes, links);
  });

  // Terminate optimal decrosser after timeout and fallback to faster method
  if (opt) {
    setTimeout(() => {
      if (done) return;
      decrosser.terminate();
      decrossSankey.call(this, false, nodes, links);
    }, DECROSS_TIMEOUT);
  } else {
    // If the faster method times out too, give up on decrossing
    setTimeout(() => {
      if (done) return;
      decrosser.terminate();

      let dag = d3dag.dagConnect()(links.map(x => [x.source, x.target]));
      layoutSankey.call(this, dag, nodes, links);
    }, DECROSS_TIMEOUT);
  }
}

// DAG Nodes Links → Any
// Update the nodes and links according to the Sankey layout.
function layoutSankey(dag, nodes, links) {
  this.$store.commit("decrementPending");
  const { nodeSort, linkSort } = sankeySorts(dag, links);
  const { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT } = d3
    .select("#flow-svg-div")
    .node()
    .getBoundingClientRect();
  const [width, height] = this.horizontalLayout
    ? [Math.max(DEFAULT_WIDTH, dagHeight(links) * PX_PER_FLOW), DEFAULT_HEIGHT]
    : [DEFAULT_WIDTH, Math.max(DEFAULT_HEIGHT, dagHeight(links) * PX_PER_FLOW)];
  const extent = [
    [WIDTH_PADDING, HEIGHT_PADDING],
    [width - WIDTH_PADDING, height - HEIGHT_PADDING]
  ];
  const layout = sankey()
    .nodeSort(nodeSort)
    .linkSort(linkSort)
    .nodeWidth(NODE_WIDTH)
    .nodePadding(NODE_PADDING)
    .extent(extent)
    .nodeAlign(ALIGN)
    .nodeOrientation(this.orientation);
  const zoom = d3
    .zoom()
    .scaleExtent([1, 1])
    .translateExtent([
      [0, 0],
      [width, height]
    ])
    .on("zoom", () => {
      let transform = d3.event.transform;
      d3.select("#flow-g").attr("transform", transform);
    });
  (this.width = width), (this.height = height);
  d3.select("#flow-svg").call(zoom);

  //links.forEach(d => d.value = Math.log2(d.value) + 1);
  const { nodes: newNodes, links: newLinks } = layout({
    nodes: nodes.map(d => Object.assign({}, d)),
    links: links.map(d => Object.assign({}, d))
  });

  // Correct log for labels after laying out
  /*
    newNodes.forEach(d => {
        return d.value = (d.sourceLinks.length === 0 ? d.targetLinks : d.sourceLinks)
            .map(x => Math.pow(2, x.value - 1))
            .reduce((x, y) => x + y, 0);
    });
    newLinks.forEach(d => d.value = Math.pow(2, d.value - 1));
   */

  // Update nodes and links
  this.nodes = newNodes;
  this.links = newLinks;
}

// JSON → JSON
// Adjusts type data by removing all NA fields and shifting over the return type
// after the last argument.
function removeNA(data) {
  return data.map(row => {
    let d = { value: row.count, package: row.package };
    for (let k of KEYS) {
      if (row[k] == "NA" && k != "fun_name") {
        d[k] = row["arg_t_r"];
        break;
      }
      d[k] = row[k];
    }
    return d;
  });
}

// JSON Natural Natural → JSON
// Return only rows that correspond to the current page of results.
function limitPageFlow(data, limit, page) {
  return data.slice((page - 1) * limit, page * limit);
}

// JSON → [Array Node] [Array Links]
// Convert JSON representation of type data into a graph representation usable
// by the D3 Sankey library (from https://observablehq.com/@d3/parallel-sets).
function makeGraph(data) {
  let index = -1;
  const nodes = [];
  const nodeByKey = new Map();
  const indexByKey = new Map();
  const links = [];

  for (const k of KEYS) {
    for (const d of data) {
      const key = JSON.stringify([k, d[k]]);
      if (!d[k] || nodeByKey.has(key)) continue;
      const node = { name: d[k] };
      nodes.push(node);
      nodeByKey.set(key, node);
      indexByKey.set(key, ++index);
    }
  }

  for (let i = 1; i < KEYS.length; ++i) {
    const a = KEYS[i - 1];
    const b = KEYS[i];
    const prefix = KEYS.slice(0, i + 1);
    const linkByKey = new Map();
    for (const d of data) {
      if (!d[a] || !d[b]) continue;
      const names = prefix.map(k => d[k]);
      const key = JSON.stringify(names);
      const value = d.value || 1;
      let link = linkByKey.get(key);
      if (link) {
        link.value += value;
        continue;
      }
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

// Data → { NodeComparator, LinkComparator }
// Based on the data, generate node and link comparators that minimize edge crossings.
function sankeySorts(dag, links) {
  const getX = {},
    namesToLink = {};

  extractX(dag, getX);
  extractLinks(links, namesToLink);

  function nodeSort(a, b) {
    if (typeof a === "object") return getX[a.index] - getX[b.index];
    else return getX[a] - getX[b];
  }

  function linkSort(a, b) {
    // Inherit order from parent flows, or use source if root link
    let aParent = parentLink(a, namesToLink),
      bParent = parentLink(b, namesToLink),
      result =
        aParent && bParent
          ? linkSort(aParent, bParent)
          : nodeSort(a.source, b.source);

    // If there's a tie, use the target
    return result === 0 ? nodeSort(a.target, b.target) : result;
  }

  return { nodeSort, linkSort };
}

// Node Object → Any
// Updates the object to map node ID's to x coordinates derivied from Sugiyama layout.
function extractX(node, obj) {
  if (node.data && obj[node.data.id]) return;
  if (node.data) obj[node.data.id] = node.x;
  node.children.forEach(node => extractX(node, obj));
}

// DAG → Natural
// Returns the height of a DAG.
function dagHeight(links) {
  let heights = d3dag
    .dagConnect()(links.map(x => [x.source, x.target]))
    .height()
    .children.map(x => x.value);
  return Math.max.apply(null, heights);
}

// [Listof Link] Object → Any
// Updates the object to map link paths to the links themselves.
function extractLinks(links, linkObj) {
  links.forEach(x => (linkObj[JSON.stringify(x.names)] = x));
}

// Link Object → Link
// Returns the link that flows into the given one.
function parentLink(link, namesToLink) {
  return namesToLink[JSON.stringify(link.names.slice(0, -1))];
}

//
// Exports
//
export default {
  name: "FlowPanel",

  // Request default data.
  created() {
    this.$store.dispatch("queryTypes");
  },

  // Update visualization when this.$store.types changes or page changes.
  watch: {
    types: updateSankeyWithReset,
    horizontalLayout: updateSankey,
    page: updateSankey,
    flowsPerPage: updateSankey
  },

  computed: {
    pages() {
      return this.types ? Math.ceil(this.types.length / this.flowsPerPage) : 1;
    },
    layout() {
      return this.horizontalLayout
        ? sankeyLinkHorizontal()
        : sankeyLinkVertical();
    },
    orientation() {
      return this.horizontalLayout ? sankeyHorizontal : sankeyVertical;
    },
    viewBox() {
      return `0 0 ${this.width} ${this.height}`;
    },
    ...mapState(["types", "selectedFuns", "flowsPerPage", "horizontalLayout"])
  },

  methods: {
    plainFormat,
    exactFormat,
    typeFormat,
    typeAlign,
    typePosition,
    highlight,
    color
  },

  data: () => ({
    // [Or false String]
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
    links: [],

    // Natural
    // Width of the Sankey viewport.
    width: 0,

    // Natural
    // Width of the Sankey viewport.
    height: 0
  })
};
</script>
