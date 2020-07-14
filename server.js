'use strict'

const express = require('express');

const app = express();

require('dotenv').config();

const cors = require('cors');

app.use(cors());

const PORT = process.env.PORT || 3001;

// app.get('/bananas', (request, response) => {
//   response.send('this process is bananas');
// })


app.get('/location', (request, response) => {
  let city = request.query.city;
  let geoData = require('./data/location.json');
  
const obj = new Location(city, geoData);
  response.send(obj);
});

function Location(location, geoData) {
  this.search_query = location;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})