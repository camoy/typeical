//
// Database
//
const url = process.env.TYPEVIS_DB;
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(url);

//
// Packages
//
const PKG_FUNS = (where) => `SELECT * FROM sums WHERE ${where}`;
const PKG_ANALYZED = `SELECT * FROM analyzed_packages`;
const TYPES = (where) => `SELECT * FROM aggregated_types WHERE ${where}`
const PKG_FUN_EQ = "(package = ? AND fun_name = ?)";
const PKG_ANALYZED_EQ = "package_being_analyzed = ?";

//
// Util
//

function query(sql, params, f) {
  db.all(sql, params, (err, rows) => {
    if (err) { throw err; }
    f(rows);
  });
}

//
// Export
//
module.exports = app => {
  app.get("/api/pkgs", function(req, res) {
    // Query
    let analyzed = req.query.analyzed || [];
    let where =
      analyzed.length === 0 ? "0 = 0" :
       ("0 = 1" + ` OR ${PKG_ANALYZED_EQ}`.repeat(analyzed.length));

    query(PKG_FUNS(where), analyzed, function(names) {
      let result = {}

      for (const e of names) {
        let { package, fun_name, count } = e;

        if (!(result[package]))
          result[package] = { name: package, children: [] }

        result[package].children.push({ name: fun_name, value: count });
      }

      res.json({ name: "packages", children: Object.values(result) });
    });
  });

  app.get("/api/analyzed", function(req, res) {
    query(PKG_ANALYZED, [], (names) => res.json(names));
  });

  app.get("/api/types", function(req, res) {
    // Parameters
    let analyzed = req.query.analyzed || [];
    let funs = req.query.funs || [];
    funs = funs.map(JSON.parse);

    // Query
    let where =
      "(0 = 1" +
      ` OR ${PKG_FUN_EQ}`.repeat(funs.length) +
      ")" +
      (analyzed.length === 0 ? "" :
        (" AND (0 = 1" +
         ` OR ${PKG_ANALYZED_EQ}`.repeat(analyzed.length) +
         ")"));

    query(TYPES(where), funs.flat().concat(analyzed), function(results) {
      res.json(results);
    });
  });
}
