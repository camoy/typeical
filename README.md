# TYPEical

Install the application with `npm`.

```
npm install
```

Assuming you have the database stored at `~/data.db`, run the server by setting the right environment variable.

```
TYPEICAL_DB=~/data.db npm run serve
```

Running on server:

```
BASE_MODE=server TYPEICAL_DB=realdata.db npm run serve -- --port 8006
BASE_MODE=server TYPEICAL_DB=400pkgs.db TYPEICAL_DB_DET=400pkgs-det.db npm run serve -- --port 8006
```
