//
// Express
//
let express = require("express");
let cors = require("cors");
let router = express.Router();

//
// Database
//
const url    = process.env.TYPEICAL_DB;       // base information
const urlDet = process.env.TYPEICAL_DB_DET ?  // detailed information
  process.env.TYPEICAL_DB_DET :
  process.env.TYPEICAL_DB;
const sqlite3 = require("sqlite3").verbose();
let db    = new sqlite3.Database(url);
let dbDet = new sqlite3.Database(urlDet);

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
const ARG_LIMITED = "(arg_t7 = 'NA')";

const LIMIT = where => ` LIMIT ${where}`;
const DEFAULT_LIMIT = 36;

const DEFAULT_DETAILS = false;

//
// Util
//

const TRUE = "0 = 0";
const FALSE = "0 = 1";
const OR = (clause, n, empty) =>
  n === 0 ? empty : "(" + FALSE + ` OR ${clause}`.repeat(n) + ")";

function query(getDetails, sql, params, f) {
  const dbToUse = getDetails ? dbDet : db;
  dbToUse.all(sql, params, (err, rows) => {
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
    query(false, ANALYZED, [], names => res.json(names));
  });

  //
  // GET /api/stats
  //
  router.get("/api/stats", function(req, res) {
    const details = (req.query.details == 'true') || false;
    query(details, DATASET_STATS, [], items => res.json(items));
  });

  //
  // GET /api/all_funs
  //
  router.get("/api/all_funs", function(req, res) {
    const analyzed = req.query.analyzed || [];
    const where = OR(ANALYZED_EQ, analyzed.length, TRUE);
    query(DEFAULT_DETAILS, ALL_FUNS(where), analyzed,
      names => res.json(names)
     );
  });

  //
  // GET /api/pkgs
  //
  router.get("/api/pkgs", function(req, res) {
    const analyzed = req.query.analyzed || [];
    const where = OR(ANALYZED_EQ, analyzed.length, TRUE);
    query(false, PKGS(where), analyzed, function(items) {
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
    query(DEFAULT_DETAILS, FUNS(where), analyzed.concat([pkg]),
      function(items) {
        res.json(items);
      }
    );
  });

  //
  // GET /api/types
  //
  router.get("/api/types", function(req, res) {
    const details = (req.query.details == 'true') || false;
    
    const analyzed = req.query.analyzed || [];
    const limitVal = req.query.limit || DEFAULT_LIMIT;
    const whereAnalyzed = OR(ANALYZED_EQ, analyzed.length, TRUE);

    const funs = (req.query.funs || []).map(JSON.parse);
    const defaultData = funs.length === 0;
    const whereFuns = OR(PKG_FUN_EQ, funs.length, TRUE);

    const pkg = req.query.pkg && defaultData ? [req.query.pkg] : [];
    const wherePkg = defaultData ? OR(PKG_EQ, pkg.length, TRUE) : TRUE;

    const limit = defaultData ? LIMIT(limitVal) : "";
    const whereClauses = [whereAnalyzed, whereFuns, wherePkg];
    // to make preview nicer, limit signatures to certain number of arguments
    if (defaultData)
      whereClauses.push(ARG_LIMITED);
    const where = whereClauses.join(" AND ");
    const params = analyzed.concat(funs.flat()).concat(pkg);
    const QUERY = analyzed.length == 0 ? TYPES_ALL : TYPES;

    query(details, QUERY(where) + limit, params,
      results => res.json(results)
    );
  });
};
