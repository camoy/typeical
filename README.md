# TYPEical

Install the application with `npm`.

```
npm install
```

To create a database, edit `data/migrate.sql` and change `MY_PATH.csv` to the path of the data.
Run the following to create the database in `data.db`:

```
sqlite3 data.db
.read data/migrate.sql
.exit
```

Assuming you have the database stored at `data.db`,
run the server by setting the right environment variable.

```
TYPEICAL_DB=data.db npm run serve
```

<!-- PRAGUE SERVER NOTES -->
<!--
Running on server:

```
BASE_MODE=server TYPEICAL_DB=realdata.db npm run serve -- --port 8006
BASE_MODE=server TYPEICAL_DB=400pkgs.db TYPEICAL_DB_DET=400pkgs-det.db npm run serve -- --port 8006
```
-->
