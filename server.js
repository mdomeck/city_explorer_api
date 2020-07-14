'use strict'

// libraries
const express = require('express');

const app = express(); //server library

require('dotenv').config(); //privacy library

const cors = require('cors'); //really bad body guard lets anyone talk to server

const superagent = require('superagent'); //gets stuff from API
const { json } = require('express');


app.use(cors()); // allow all clients into our server


// global variables
const PORT = process.env.PORT || 3001;
let weatherArr = [];

//=============LOCATION========================//
app.get('/location', (request, response) => {
  
  let city = request.query.city;
  let geoData = require('./data/location.json');
  let url = `https://us1.locationiq.com/v1/search.php`

  let queryParams = {
    key: process.env.GEOCODE_API_KEY,
    q: city,
    format: 'json',
    limit: 1
  }

  superagent.get(url)
  .query(queryParams)
  .then(resultsFromSuperagent => {
    console.log('these are my results from superagent:', resultsFromSuperagent.body);
  let geoData = resultsFromSuperagent.body;
  const obj = new Location(city, geoData);
  response.status(200).send(obj);
  }).catch((error) => { 
    console.log('ERROR', error);
    response.status(500).send('Sorry, somehing went wrong');
    })
}

function Location(location, geoData) {
  this.search_query = location;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

//================WEATHER===================//
app.get('/weather', (request, response) => {
  let weatherInfo = require('./data/weather.json')
  

  //use a .map not a forEach
  weatherInfo['data'].forEach(date => {
    weatherArr.push(new Weather(date));
  })
  response.send(weatherArr);
  
});

app.use('*', (request, response) => {
  response.status(404).send('page not found');
})

function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = new Date(obj.datetime).toDateString(); // datetime or valid_date???
}




app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})
