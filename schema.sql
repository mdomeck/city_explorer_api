DROP TABLE IF EXISTS city_explorer;

CREATE TABLE city_explorer (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  city VARCHAR(255)
);

INSERT INTO city_explorer (first_name, last_name) VALUES ('Meghan', 'Domeck');
SELECT * FROM city_explorer;