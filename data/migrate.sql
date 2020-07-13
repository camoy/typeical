--
-- types table
--

CREATE TABLE types(
  package_being_analyzed TEXT,
  package TEXT,
  fun_name TEXT,
  fun_id TEXT,
  dispatch TEXT,
  has_dots BOOLEAN,
  arg_t_r TEXT,
  arg_c_r TEXT,
  arg_a_r TEXT,
  arg_t0 TEXT,
  arg_c0 TEXT,
  arg_a0 TEXT,
  arg_t1 TEXT,
  arg_c1 TEXT,
  arg_a1 TEXT,
  arg_t2 TEXT,
  arg_c2 TEXT,
  arg_a2 TEXT,
  arg_t3 TEXT,
  arg_c3 TEXT,
  arg_a3 TEXT,
  arg_t4 TEXT,
  arg_c4 TEXT,
  arg_a4 TEXT,
  arg_t5 TEXT,
  arg_c5 TEXT,
  arg_a5 TEXT,
  arg_t6 TEXT,
  arg_c6 TEXT,
  arg_a6 TEXT,
  arg_t7 TEXT,
  arg_c7 TEXT,
  arg_a7 TEXT,
  arg_t8 TEXT,
  arg_c8 TEXT,
  arg_a8 TEXT,
  arg_t9 TEXT,
  arg_c9 TEXT,
  arg_a9 TEXT,
  arg_t10 TEXT,
  arg_c10 TEXT,
  arg_a10 TEXT,
  arg_t11 TEXT,
  arg_c11 TEXT,
  arg_a11 TEXT,
  arg_t12 TEXT,
  arg_c12 TEXT,
  arg_a12 TEXT,
  arg_t13 TEXT,
  arg_c13 TEXT,
  arg_a13 TEXT,
  arg_t14 TEXT,
  arg_c14 TEXT,
  arg_a14 TEXT,
  arg_t15 TEXT,
  arg_c15 TEXT,
  arg_a15 TEXT,
  arg_t16 TEXT,
  arg_c16 TEXT,
  arg_a16 TEXT,
  arg_t17 TEXT,
  arg_c17 TEXT,
  arg_a17 TEXT,
  arg_t18 TEXT,
  arg_c18 TEXT,
  arg_a18 TEXT,
  arg_t19 TEXT,
  arg_c19 TEXT,
  arg_a19 TEXT,
  count BIGINT);

CREATE INDEX types_index ON types(
  count,
  package_being_analyzed,
  package,
  fun_name);

CREATE INDEX main_index ON types(package, fun_name, package_being_analyzed);

CREATE INDEX count_index ON types(count);
CREATE INDEX analyzed_index ON types(package_being_analyzed);
CREATE INDEX package_index ON types(package);

--
-- import from CSV (dropping header)
--

.mode csv
.import "MYPATH.csv" types

-- apparently, csv has been merged from multiple csv-files,
-- so there are multiple title lines
DELETE FROM types WHERE fun_id='fun_id' AND package='package' AND fun_name='fun_name';

--
-- aggregated info (keep only type information)
--

CREATE TABLE aggregated_types(
  package_being_analyzed TEXT,
  package TEXT,
  fun_name TEXT,
--  fun_id TEXT,
--  dispatch TEXT,
--  has_dots BOOLEAN,
  arg_t_r TEXT,
  arg_t0 TEXT,
  arg_t1 TEXT,
  arg_t2 TEXT,
  arg_t3 TEXT,
  arg_t4 TEXT,
  arg_t5 TEXT,
  arg_t6 TEXT,
  arg_t7 TEXT,
  arg_t8 TEXT,
  arg_t9 TEXT,
  arg_t10 TEXT,
  arg_t11 TEXT,
  arg_t12 TEXT,
  arg_t13 TEXT,
  arg_t14 TEXT,
  arg_t15 TEXT,
  arg_t16 TEXT,
  arg_t17 TEXT,
  arg_t18 TEXT,
  arg_t19 TEXT,
  count BIGINT
);

CREATE INDEX main_aggr_index ON aggregated_types(package, fun_name, package_being_analyzed);
CREATE INDEX analyzed_aggr_index ON aggregated_types(package_being_analyzed);
CREATE INDEX count_aggr_index ON aggregated_types(count);

INSERT INTO aggregated_types
--SELECT package_being_analyzed, package, fun_name, fun_id, dispatch, has_dots,
SELECT package_being_analyzed, package, fun_name,
  arg_t_r, arg_t0, arg_t1, arg_t2, arg_t3, arg_t4, arg_t5,
  arg_t6, arg_t7, arg_t8, arg_t9, arg_t10, arg_t11, arg_t12,
  arg_t13, arg_t14, arg_t15, arg_t16, arg_t17, arg_t18, arg_t19,
  SUM(count) as count
FROM types
--GROUP BY package_being_analyzed, package, fun_name, fun_id, dispatch, has_dots,
GROUP BY package_being_analyzed, package, fun_name,
  arg_t_r, arg_t0, arg_t1, arg_t2, arg_t3, arg_t4, arg_t5,
  arg_t6, arg_t7, arg_t8, arg_t9, arg_t10, arg_t11, arg_t12,
  arg_t13, arg_t14, arg_t15, arg_t16, arg_t17, arg_t18, arg_t19
ORDER BY count DESC;

--
-- aggregation for the entire dataset (useful when analyzed packages
-- aren't limited)
--

CREATE TABLE aggregated_types_all_analyzed(
  package TEXT,
  fun_name TEXT,
--  fun_id TEXT,
--  dispatch TEXT,
--  has_dots BOOLEAN,
  arg_t_r TEXT,
  arg_t0 TEXT,
  arg_t1 TEXT,
  arg_t2 TEXT,
  arg_t3 TEXT,
  arg_t4 TEXT,
  arg_t5 TEXT,
  arg_t6 TEXT,
  arg_t7 TEXT,
  arg_t8 TEXT,
  arg_t9 TEXT,
  arg_t10 TEXT,
  arg_t11 TEXT,
  arg_t12 TEXT,
  arg_t13 TEXT,
  arg_t14 TEXT,
  arg_t15 TEXT,
  arg_t16 TEXT,
  arg_t17 TEXT,
  arg_t18 TEXT,
  arg_t19 TEXT,
  count BIGINT
);

--CREATE INDEX main_aggr_all_index ON aggregated_types_all_analyzed(package, fun_name, fun_id);
CREATE INDEX main_aggr_all_index ON aggregated_types_all_analyzed(package, fun_name);
CREATE INDEX count_aggr_all_index ON aggregated_types_all_analyzed(count);

INSERT INTO aggregated_types_all_analyzed
--SELECT package, fun_name, fun_id, dispatch, has_dots,
SELECT package, fun_name,
  arg_t_r, arg_t0, arg_t1, arg_t2, arg_t3, arg_t4, arg_t5,
  arg_t6, arg_t7, arg_t8, arg_t9, arg_t10, arg_t11, arg_t12,
  arg_t13, arg_t14, arg_t15, arg_t16, arg_t17, arg_t18, arg_t19,
  SUM(count) as count
FROM aggregated_types
--GROUP BY package, fun_name, fun_id, dispatch, has_dots,
GROUP BY package, fun_name,
  arg_t_r, arg_t0, arg_t1, arg_t2, arg_t3, arg_t4, arg_t5,
  arg_t6, arg_t7, arg_t8, arg_t9, arg_t10, arg_t11, arg_t12,
  arg_t13, arg_t14, arg_t15, arg_t16, arg_t17, arg_t18, arg_t19
ORDER BY count DESC;

--
-- initial data cache tables
--

CREATE TABLE stats(
  "name" TEXT,
  "count" BIGINT
);

INSERT INTO stats
SELECT 'distinct_record' as name, COUNT(*) as count
FROM aggregated_types;

INSERT INTO stats
SELECT 'call' as name, SUM(count) as count
FROM aggregated_types;

INSERT INTO stats
SELECT "distinct_package_being_analyzed" as name, COUNT(DISTINCT package_being_analyzed) as count
FROM aggregated_types;

INSERT INTO stats
SELECT "distinct_package" as name, COUNT(DISTINCT package) as count
FROM aggregated_types;

INSERT INTO stats
SELECT "distinct_fun_name" as name, COUNT(DISTINCT fun_name) as count
FROM aggregated_types;

INSERT INTO stats
SELECT 'distinct_ret_type' as name, COUNT(DISTINCT arg_t_r) as count
FROM aggregated_types;


CREATE TABLE analyzed_packages(
   "package_being_analyzed" TEXT,
   "count" BIGINT
);

INSERT INTO analyzed_packages
SELECT package_being_analyzed, SUM(count) as count FROM aggregated_types
GROUP BY package_being_analyzed
ORDER BY count DESC;


CREATE TABLE init_packages(
    "package" TEXT,
    "count" BIGINT
);

INSERT INTO init_packages
SELECT package, SUM(count) as count FROM aggregated_types
GROUP BY package
ORDER BY count DESC;


CREATE TABLE init_functions(
    "package" TEXT,
    "fun_name" TEXT,
    "count" BIGINT
);

INSERT INTO init_functions
SELECT package, fun_name, SUM(count) as count FROM aggregated_types
GROUP BY package, fun_name
ORDER BY count DESC;


CREATE TABLE sums(
   "package_being_analyzed" TEXT, "package" TEXT, "fun_name" TEXT, --"fun_id" TEXT,
   "count" BIGINT
);

INSERT INTO sums
--SELECT package_being_analyzed, package, fun_name, fun_id, SUM(count) as count
SELECT package_being_analyzed, package, fun_name, SUM(count) as count
FROM aggregated_types
--GROUP BY package_being_analyzed, package, fun_name, fun_id
GROUP BY package_being_analyzed, package, fun_name
ORDER BY count DESC;

CREATE INDEX package_sums_index ON sums(package);
