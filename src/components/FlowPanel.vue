<template>
  <v-container id="flow-svg-container">
    <svg
      id="flow-svg"
      :viewBox="viewBox"
      preserveAspectRatio="xMidYMid meet"
      @dblclick="clickOnSvg()"
    >
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
          fill="#9a9a9a"
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
          :dominant-baseline="horizontalLayout ? 'auto' : 'hanging'"
          :text-anchor="horizontalLayout ? 'start' : 'middle'"
          :dx="horizontalLayout ? '1em' : '0'"
          :dy="horizontalLayout ? '0' : '1em'"
          :x="(node.x0 + node.x1) / 2"
          :y="(node.y1 + node.y0) / 2"
          :key="'flow-type-text-' + k"
        >
          <title>{{ node.fullName }}</title>
          <tspan>{{ node.name }}</tspan>
          <!-- prettier-ignore -->
          <tspan
            fill-opacity="0.7"
            dy="1.5em"
            :dx="horizontalLayout ? '1em' : '0'"
            :x="(node.x0 + node.x1) / 2"
            >{{ plainFormat(node.value) }}</tspan>
        </text>

        <!-- Flow -->
        <path
          v-for="(link, k) in links"
          class="flow-path"
          :d="layout(link)"
          :key="'flow-path-' + k"
          :fill="color(link)"
          @mouseenter="highlight(link, true)"
          @mouseleave="highlight(link, false)"
          @click="clickOnLink(link)"
        >
          <title>
            {{ typeFormat(link.names) }} ({{ exactFormat(link.value) }})
          </title>
        </path>
      </g>
    </svg>

    <!-- Pagination -->
    <div>
      <v-pagination v-if="nodes.length > 0" v-model="page" :length="pages" />
    </div>
  </v-container>
</template>

<style>
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
  transition: fill 0.3s;
}

.flow-rect {
  pointer-events: none;
}

.flow-type-text {
  font-size: 10px;
}
</style>

<script>
//
// Imports
//
import { mapState } from "vuex";
import numeral from "numeral";
import lodash from "lodash";
import {
  sankey,
  sankeyLeft,
  sankeyJustify,
  sankeyHorizontal,
  sankeyVertical
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
const DECROSS_TIMEOUT = 1200;

const LABEL_ABBREVIATE = 3;
const NODE_WIDTH = 2;
const NODE_PADDING = 40;
const DEFAULT_HEIGHT = 720;
const DEFAULT_WIDTH = 1040;
const HEIGHT_PADDING = 6;
const WIDTH_PADDING = 12;
const OFFSET = 0;

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

// [Array of Flows], Boolean → [Array of Flows]
// If necessary, groups flows by function name
function processFlows(flows, groupByFunName) {
  if (groupByFunName) {
    // group by function names before sorting
    const groupedData = lodash.groupBy(flows, "fun_name");
    const groupedWeighedData = Object.keys(groupedData).map(function(k) {
      return {
        name: k,
        data: groupedData[k],
        count: groupedData[k].reduce((acc, d) => acc + d.count, 0)
      };
    });
    // sort using grouped information
    let sortedData = groupedWeighedData
      .sort((a, b) => b.count - a.count)
      .map(a => a.data)
      .flat();
    return sortedData;
  }
  return flows;
}

// → Any
// Create Sankey diagram from JSON data.
function updateSankey() {
  const flows = processFlows(this.types, this.groupFlowsByFunName);
  const data = removeNA(flows, this.flowsJustified);

  // No data (this is needed since `makeGraph` assumes data).
  if (data.length === 0) {
    this.nodes = this.links = [];
    return;
  }

  // Some data
  const { nodes, links } = makeGraph(
    limitPageFlow(data, this.flowsPerPage, this.page),
    this.flowsJustified
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
  const layout = sankey()
    .nodeSort(nodeSort)
    .linkSort(linkSort)
    .nodeWidth(NODE_WIDTH)
    .nodePadding(NODE_PADDING)
    .extent([
      [WIDTH_PADDING, HEIGHT_PADDING],
      [DEFAULT_WIDTH - WIDTH_PADDING * 3, DEFAULT_HEIGHT - HEIGHT_PADDING]
    ])
    .nodeAlign(this.flowsJustified ? sankeyJustify : sankeyLeft)
    .nodeOrientation(this.orientation);

  const { nodes: newNodes, links: newLinks } = layout({
    nodes: nodes.map(d => Object.assign({}, d)),
    links: links.map(d => Object.assign({}, d))
  });

  // Abbreviate labels that overlap
  const tree = d3.quadtree().addAll(makeBoundingPoints(newNodes));

  for (let node of newNodes) {
    let [x0, y0, x1, y1] = nodeBounds(node);
    node.fullName = node.name;
    search(tree, node, x0, y0, x1, y1 + 1);
  }

  // Update nodes and links
  this.nodes = newNodes;
  this.links = newLinks;
}

// Nodes → [Listof Point]
// Constructs the bounding rectangle points for every node.
function makeBoundingPoints(nodes) {
  let result = [];
  for (let node of nodes) {
    let [x0, y0, x1, y1] = nodeBounds(node);
    result = result.concat([
      [x0, y0, node],
      [x1, y1, node]
    ]);
  }
  return result;
}

// Node → [List Real Real Real Real]
// Given a node, returns the edge points.
function nodeBounds(node) {
  const textSize = node.name.length * 5;
  const center = (node.x0 + node.x1) / 2;
  return [center - textSize / 2, node.y0, center + textSize / 2, node.y0];
}

// Tree Node Real Real Real Real → Any
// Given the current node, abbreviates it if it intersects with any other nodes.
function search(quadtree, cur, x0, y0, x3, y3) {
  quadtree.visit(function(node, x1, y1, x2, y2) {
    if (!node.length) {
      do {
        var d = node.data;
        if (
          d[0] >= x0 &&
          d[0] < x3 &&
          d[1] >= y0 &&
          d[1] < y3 &&
          d[2] !== cur
        ) {
          cur.name = abbreviate(cur.name);
        }
        node = node.next;
      } while (node);
    }
    return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
  });
}

// String → String
// Abbreviate the given string.
function abbreviate(str) {
  return str.substring(0, LABEL_ABBREVIATE) + "…";
}

// JSON Boolean → JSON
// Adjusts type data by removing all NA fields and shifting over the return type
// after the last argument.
function removeNA(data, justified) {
  return data.map(row => {
    let d = { value: row.count, package: row.package };
    for (let k of KEYS) {
      if (row[k] == "NA" && k != "fun_name") {
        d[justified ? "arg_t_r" : k] = `→${row["arg_t_r"]}`;
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

// JSON Boolean → [Array Node] [Array Links]
// Convert JSON representation of type data into a graph representation usable
// by the D3 Sankey library (from https://observablehq.com/@d3/parallel-sets).
function makeGraph(data, justified) {
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
      //const node = { name: transformByKey(k, d) };
      nodes.push(node);
      nodeByKey.set(key, node);
      indexByKey.set(key, ++index);
    }
  }
  for (let i = 1; i < KEYS.length; ++i) {
    const prefix = KEYS.slice(0, i + 1);
    const linkByKey = new Map();
    for (const d of data) {
      let a = KEYS[i - 1];
      let b = KEYS[i];
      // Only use return type if justified
      if (d[a] && !d[b] && justified) b = "arg_t_r";
      else if (!d[a] || !d[b]) continue;

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
        package: d.package,
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
// [[Pkg, Fun]] [Pkg, Fun] → Bool
// Checks if fun is the only fun in selectedFuns
function singleFunIsSelected(selectedFuns, fun) {
  return selectedFuns.length == 1 && selectedFuns.includes(fun);
}

// Link → _
// Click on a highlighted link sets the selection to the clicked function
// if it is not already selected
function clickOnLink(link) {
  const linkFun = JSON.stringify([link.package, link.names[0]]);
  const selectedFuns = this.$store.state.selectedFuns;
  if (!singleFunIsSelected(selectedFuns, linkFun)) {
    this.selectedFunsBeforeZoom = selectedFuns;
    this.$store.dispatch("setSelectedFuns", [linkFun]);
  }
}

// Any Any → Bool
// Checks if two values are equal using JSON.stringify
function jsonEqual(x, y) {
  return JSON.stringify(x) == JSON.stringify(y);
}

// Click outside flows to return to the previous selection
function clickOnSvg() {
  if (!jsonEqual(this.selectedFunsBeforeZoom, this.$store.state.selectedFuns))
    this.$store.dispatch("setSelectedFuns", this.selectedFunsBeforeZoom);
}

// Link → String
// Replacement for sankeyLinkHorizontal (from https://observablehq.com/@enjalot/weird-sankey-links).
function sankeyLinkHorizontal(link) {
  let sx = link.source.x1;
  let tx = link.target.x0 + 1;
  let sy0 = link.y0 - link.width / 2;
  let sy1 = link.y0 + link.width / 2;
  let ty0 = link.y1 - link.width / 2;
  let ty1 = link.y1 + link.width / 2;
  let halfx = (tx - sx) / 2;
  let path = d3.path();
  path.moveTo(sx, sy0);
  let cpx1 = sx + halfx;
  let cpy1 = sy0 + OFFSET;
  let cpx2 = sx + halfx;
  let cpy2 = ty0 - OFFSET;
  path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, tx, ty0);
  path.lineTo(tx, ty1);
  cpx1 = sx + halfx;
  cpy1 = ty1 - OFFSET;
  cpx2 = sx + halfx;
  cpy2 = sy1 + OFFSET;
  path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, sx, sy1);
  path.lineTo(sx, sy0);
  return path.toString();
}

// Link → String
// Replacement for sankeyLinkVertical.
function sankeyLinkVertical(link) {
  let sy = link.source.y1;
  let ty = link.target.y0 + 1;
  let sx0 = link.y0 - link.width / 2;
  let sx1 = link.y0 + link.width / 2;
  let tx0 = link.y1 - link.width / 2;
  let tx1 = link.y1 + link.width / 2;
  let halfy = (ty - sy) / 2;
  let path = d3.path();
  path.moveTo(sx1, sy);
  let cpx1 = sx1 + OFFSET;
  let cpy1 = sy + halfy;
  let cpx2 = tx1 - OFFSET;
  let cpy2 = sy + halfy;
  path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, tx1, ty);
  path.lineTo(tx0, ty);
  cpx1 = tx0 - OFFSET;
  cpy1 = sy + halfy;
  cpx2 = sx0 + OFFSET;
  cpy2 = sy + halfy;
  path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, sx0, sy);
  path.lineTo(sx1, sy);
  return path.toString();
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
    groupFlowsByFunName: updateSankey,
    flowsPerPage: updateSankey
  },

  computed: {
    pages() {
      return this.types ? Math.ceil(this.types.length / this.flowsPerPage) : 1;
    },
    layout() {
      return this.horizontalLayout ? sankeyLinkHorizontal : sankeyLinkVertical;
    },
    orientation() {
      return this.horizontalLayout ? sankeyHorizontal : sankeyVertical;
    },
    viewBox() {
      return `${-WIDTH_PADDING} ${-HEIGHT_PADDING} ${DEFAULT_WIDTH +
        WIDTH_PADDING * 2} ${DEFAULT_HEIGHT + HEIGHT_PADDING * 6}`;
    },
    ...mapState([
      "types",
      "selectedFuns",
      "flowsPerPage",
      "flowsJustified",
      "groupFlowsByFunName",
      "horizontalLayout"
    ])
  },

  methods: {
    plainFormat,
    exactFormat,
    typeFormat,
    highlight,
    color,
    clickOnLink,
    clickOnSvg
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

    // [Array Fun]
    // Functions selected before zooming in
    selectedFunsBeforeZoom: []
  })
};
</script>
