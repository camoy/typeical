# TypeVis

Install the application with `npm`.

```
npm install
```

Assuming you have the database stored at `~/data.db`, run the server by setting the right environment variable.

```
TYPEVIS_DB=~/data.db npm run serve
```

Running on server:

```
BASE_MODE=server TYPEVIS_DB=realdata.db npm run serve -- --port 8006
BASE_MODE=server TYPEVIS_DB=400pkgs.db npm run serve -- --port 8006
```
