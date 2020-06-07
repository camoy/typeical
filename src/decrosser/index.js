import registerPromiseWorker from "promise-worker/register";
import * as d3dag from "d3-dag";

registerPromiseWorker(([opt, links]) => {
  const decross = opt
    ? d3dag.decrossOpt()
    : d3dag.decrossTwoLayer().order(d3dag.twolayerOpt());
  let dag = d3dag.dagConnect()(links.map(x => [x.source, x.target]));
  const sugiyama = d3dag
    .sugiyama()
    .size([800, 800])
    .decross(decross);
  return sugiyama(dag);
});
