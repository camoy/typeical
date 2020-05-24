//
// Database
//
const url = process.env.TYPEVIS_DB;
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(url);

//
// Packages
//
const PKG_FUNS = `SELECT * FROM init_functions`;
const PKG_FUN_EQ = "(package = ? AND fun_name = ?)";
const TYPES = (where) => `SELECT * FROM aggregated_types WHERE ${where}`

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
    query(PKG_FUNS, [], function(names) {
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

  app.get("/api/types", function(req, res) {
    let funs = req.query.funs || [];
    funs = funs.map(JSON.parse);

    let where = "0 = 1" + ` OR ${PKG_FUN_EQ}`.repeat(funs.length);
    query(TYPES(where), funs.flat(), function(results) {
      res.json(results);
    });
  });
}
