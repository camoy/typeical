//
// Express
//
let express = require("express");
let cors = require("cors");
let router = express.Router();

//
// Database
//
const url = process.env.TYPEVIS_DB;
const sqlite3 = require("sqlite3").verbose();
let db = new sqlite3.Database(url);

//
// Queries
//

const ANALYZED = `SELECT * FROM analyzed_packages`;
const ALL_FUNS = where =>
  `SELECT DISTINCT package, fun_name FROM sums WHERE ${where}`;

const PKGS = where => `SELECT package, SUM(count) as count FROM sums
            WHERE ${where} GROUP BY package ORDER BY count DESC`;
const FUNS = where => `SELECT fun_name, SUM(count) as count FROM sums
            WHERE ${where} GROUP BY fun_name ORDER BY count DESC`;
const TYPES = where => `SELECT * FROM aggregated_types WHERE ${where}
            GROUP BY fun_name ORDER BY count DESC`;
const TYPES_ALL = where => `SELECT * FROM aggregated_types_all_analyzed WHERE ${where}
            ORDER BY count DESC`;

const DATASET_STATS = `SELECT *  FROM stats`;

const ANALYZED_EQ = "package_being_analyzed = ?";
const PKG_EQ = "package = ?";
const PKG_FUN_EQ = "(package = ? AND fun_name = ?)";

const LIMIT = where => ` LIMIT ${where}`;
const DEFAULT_LIMIT = 36;

//
// Util
//

const TRUE = "0 = 0";
const FALSE = "0 = 1";
const OR = (clause, n, empty) =>
  n === 0 ? empty : "(" + FALSE + ` OR ${clause}`.repeat(n) + ")";

function query(sql, params, f) {
  db.all(sql, params, (err, rows) => {
    if (err) {
      throw err;
    }
    f(rows);
  });
}

//
// Export
//
module.exports = (app, server) => {
  app.use(server.options.publicPath, router);
  router.all("*", cors());

  //
  // GET /api/analyzed
  //
  router.get("/api/analyzed", function(req, res) {
    query(ANALYZED, [], names => res.json(names));
  });

  //
  // GET /api/analyzed
  //
  router.get("/api/stats", function(req, res) {
    query(DATASET_STATS, [], items => res.json(items));
  });

  //
  // GET /api/all_funs
  //
  router.get("/api/all_funs", function(req, res) {
    const analyzed = req.query.analyzed || [];
    const where = OR(ANALYZED_EQ, analyzed.length, TRUE);
    query(ALL_FUNS(where), analyzed, names => res.json(names));
  });

  //
  // GET /api/pkgs
  //
  router.get("/api/pkgs", function(req, res) {
    const analyzed = req.query.analyzed || [];
    const where = OR(ANALYZED_EQ, analyzed.length, TRUE);
    query(PKGS(where), analyzed, function(items) {
      res.json(items);
    });
  });

  //
  // GET /api/funs
  //
  router.get("/api/funs", function(req, res) {
    const analyzed = req.query.analyzed || [];
    const pkg = req.query.pkg;
    const where = OR(ANALYZED_EQ, analyzed.length, TRUE) + " AND " + PKG_EQ;
    query(FUNS(where), analyzed.concat([pkg]), function(items) {
      res.json(items);
    });
  });

  //
  // GET /api/types
  //
  router.get("/api/types", function(req, res) {
    const analyzed = req.query.analyzed || [];
    const limitVal = req.query.limit || DEFAULT_LIMIT;
    const whereAnalyzed = OR(ANALYZED_EQ, analyzed.length, TRUE);

    const funs = (req.query.funs || []).map(JSON.parse);
    const defaultData = funs.length === 0;
    const whereFuns = OR(PKG_FUN_EQ, funs.length, TRUE);

    const pkg = req.query.pkg && defaultData ? [req.query.pkg] : [];
    const wherePkg = defaultData ? OR(PKG_EQ, pkg.length, TRUE) : TRUE;

    const limit = defaultData ? LIMIT(limitVal) : "";
    const where = [whereAnalyzed, whereFuns, wherePkg].join(" AND ");
    const params = analyzed.concat(funs.flat()).concat(pkg);
    const QUERY = analyzed.length == 0 ? TYPES_ALL : TYPES;

    query(QUERY(where) + limit, params, results => res.json(results));
  });
};
