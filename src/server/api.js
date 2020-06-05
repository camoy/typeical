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
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(url);

//
// Queries
//

const ANALYZED = `SELECT * FROM analyzed_packages`;
const ALL_FUNS =
  where => `SELECT DISTINCT package, fun_name FROM sums WHERE ${where}`;

const PKGS =
  where => `SELECT package, SUM(count) as count FROM sums
            WHERE ${where} GROUP BY package ORDER BY count DESC`;
const FUNS =
  where => `SELECT fun_name, SUM(count) as count FROM sums
            WHERE ${where} GROUP BY fun_name ORDER BY count DESC`;
const TYPES = 
  where => `SELECT * FROM aggregated_types WHERE ${where}
            GROUP BY package_being_analyzed ORDER BY count DESC`;
const TYPES_ALL = 
  where => `SELECT * FROM aggregated_types_all_analyzed WHERE ${where}
            ORDER BY count DESC`;

const ANALYZED_EQ = "package_being_analyzed = ?";
const PKG_EQ = "package = ?";
const PKG_FUN_EQ = "(package = ? AND fun_name = ?)";

const LIMIT = " LIMIT 15";

//
// Util
//

const TRUE = "0 = 0";
const FALSE = "0 = 1";
const OR =
  (clause, n, empty) => (n === 0) ?
                        empty :
                        "(" + FALSE + ` OR ${clause}`.repeat(n) + ")";

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
  //router.all("*", cors());

  //
  // GET /api/analyzed
  //
  router.get("/api/analyzed", function(req, res) {
    query(ANALYZED, [], names => res.json(names));
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
    const where = OR(ANALYZED_EQ, analyzed.length, TRUE) +
                  " AND " +
                  PKG_EQ;
    query(FUNS(where), analyzed.concat([pkg]), function(items) {
      res.json(items);
    });
  });

  //
  // GET /api/types
  //
  router.get("/api/types", function(req, res) {
    let analyzed = req.query.analyzed || [];
    let funs = req.query.funs || [];
    funs = funs.map(JSON.parse);
    let where = OR(PKG_FUN_EQ, funs.length, FALSE);
    if (analyzed.length == 0) {
      query(TYPES_ALL(where), funs.flat(), function(results) {
        res.json(results);
      });
    }
    else {
      where = where + " AND " + OR(ANALYZED_EQ, analyzed.length, TRUE);
      query(TYPES(where), funs.flat().concat(analyzed), function(results) {
        res.json(results);
      });
    }
  });

  router.get("/api/types_limited", function(req, res) {
    let analyzed = req.query.analyzed || [];
    const pkg = req.query.pkg;
    const where = PKG_EQ;
    if (analyzed.length == 0) {
      query(TYPES_ALL(pkg === "" ? TRUE : where) + LIMIT, 
        pkg === "" ? [] : [pkg], function(results) {
        res.json(results);
      });
    }
    else {
      where = where + " AND " + OR(ANALYZED_EQ, analyzed.length, TRUE);
      query(TYPES(where) + LIMIT, [pkg].concat(analyzed), function(results) {
        res.json(results);
      });
    }
  });
}
