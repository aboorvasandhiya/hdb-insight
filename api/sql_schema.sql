-- api/sql_schema.sql
DROP TABLE IF EXISTS resale_prices;

CREATE TABLE resale_prices (
  id          SERIAL PRIMARY KEY,
  town        TEXT NOT NULL,
  flat_type   TEXT NOT NULL,
  floor_area  NUMERIC NOT NULL,
  price       NUMERIC NOT NULL,
  year        INTEGER NOT NULL
);


