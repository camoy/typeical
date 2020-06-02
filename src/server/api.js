//
// Express
//
let express = require("express");
let router = express.Router();

//
// Database
//
const url = process.env.TYPEVIS_DB;
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(url);

//
// Queries
//
const PKG_FUNS =
  where => `SELECT package, fun_name, SUM(count) as count FROM sums
            WHERE ${where} GROUP BY fun_name`;
const PKG_ANALYZED = `SELECT * FROM analyzed_packages`;
const TYPES = where => `SELECT * FROM aggregated_types WHERE ${where}`;
const PKGS_LIST =
  where => `SELECT package, SUM(count) as count FROM sums
            WHERE ${where} GROUP BY package ORDER BY count DESC`;
const PKG_FUN_EQ = "(package = ? AND fun_name = ?)";
const PKG_ANALYZED_EQ = "package_being_analyzed = ?";

//
// Util
//

const TRUE = "0 = 0";
const FALSE = "0 = 1";
const OR =
  (clause, n, empty) => (n === 0) ? empty : FALSE + ` OR ${clause}`.repeat(n);

function query(sql, params, f) {
  db.all(sql, params, (err, rows) => {
    if (err) { throw err; }
    f(rows);
  });
}

//
// Export
//
module.exports = (app, server) => {
  app.use(server.options.publicPath, router);

  //
  // GET /api/pkgs
  //
  router.get("/api/pkgs", function(req, res) {
    const analyzed = req.query.analyzed || [];
    const where = OR(PKG_ANALYZED_EQ, analyzed.length, TRUE);

    query(PKG_FUNS(where), analyzed, function(names) {
      let result = {}
      for (const e of names) {
        let { package, fun_name, count } = e;
        if (!result[package])
          result[package] = { name: package, children: [] }
        result[package].children.push({ name: fun_name, value: count });
      }
      res.json({ name: "packages", children: Object.values(result) });
    });
  });

  //
  // GET /api/analyzed
  //
  router.get("/api/analyzed", function(req, res) {
    query(PKG_ANALYZED, [], names => res.json(names));
  });

  //
  // GET /api/types
  //
  router.get("/api/types", function(req, res) {
    let analyzed = req.query.analyzed || [];
    let funs = req.query.funs || [];
    funs = funs.map(JSON.parse);
    let where =
      OR(PKG_FUN_EQ, funs.length, FALSE) +
      " AND " +
      OR(PKG_ANALYZED_EQ, analyzed.length, TRUE);

    query(TYPES(where), funs.flat().concat(analyzed), function(results) {
      res.json(results);
    });
  });

  //
  // GET /api/pkgslist
  //
  router.get("/api/pkgslist", function(req, res) {
    const analyzed = req.query.analyzed || [];
    const where = OR(PKG_ANALYZED_EQ, analyzed.length, TRUE);

    query(PKGS_LIST(where), analyzed, function(items) {
      res.json(items);
    });
  });
}
