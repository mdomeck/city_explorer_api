DROP TABLE IF EXISTS city_explorer;

CREATE TABLE city_explorer (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7)
);

INSERT INTO cities (search_query, formatted_query, latitude, longitude) VALUES ('Seattle', 'Seattle, King County, Washington, USA', '47.6038321', '-122.4400625')