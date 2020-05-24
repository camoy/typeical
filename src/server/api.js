const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('/home/camoy/wrk/type-vis/data/sample-data.db');

//
// Packages
//
const PKG_FUNS = `SELECT * FROM init_functions`;

//
// Util
//

function query(sql, f) {
  db.all(sql, [], (err, rows) => {
    if (err) { throw err; }
    f(rows);
  });
}

//
// Export
//
module.exports = app => {
  app.get("/api/pkgs", function(req, res) {
    query(PKG_FUNS, function(names) {
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
}
