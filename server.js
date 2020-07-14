'use strict'

const express = require('express');

const { response } = require('express');

const app = express();

require('dotenv').config();

const cors = require('cors');

app.use(cors());

const PORT = process.env.PORT || 3001;

// app.get('/bananas', (request, response) => {
//   response.send('this process is bananas');
// })


app.get('/location', (request, response) => {
  console.log('This is the city, right?', request.query.city);
  let city = request.query.city;
  let GeoData = require('./data/location.json');
  
const obj = new Location(city, geoData);

  // let obj = {
  //   search_query: city,
  //   formatted_query: geoData[0].display_name,
  //   latitude: geoData[0].lat,
  //   longitude: geoData[0].lon
  // }
  response.send(obj);
})

function Location(location, obj) {
  this.search_query = location;
  this.formatted_query = obj[0].display_name;
  this.latitude = obj[0].lat;
  this.longitude = obj[0].lon;
}

// app.listen(PORT, () => {
//   console.log(`listening on ${PORT}`);
// })