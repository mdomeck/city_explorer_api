'use strict'

// libraries
const express = require('express');
const cors = require('cors'); //really bad body guard lets anyone talk to server
const superagent = require('superagent'); //gets stuff from API
require('dotenv').config(); //privacy library

const app = express(); //server library
app.use(cors()); // allow all clients into our server


// global variables
const PORT = process.env.PORT || 3001;

//=============LOCATION========================//
app.get('/location', handleLocation);

function handleLocation(request, response) {

  let city = request.query.city;
  let url = `https://us1.locationiq.com/v1/search.php`;

  let queryParams = {
    key: process.env.GEOCODE_API_KEY,
    q: city,
    format: 'json',
    limit: 1
  }

  superagent.get(url)
    .query(queryParams)
    .then(resultsFromSuperagent => {
      let geoData = resultsFromSuperagent.body;
      const obj = new Location(city, geoData);
      response.status(200).send(obj);
    }).catch((error) => {
      console.log('ERROR', error);
      response.status(500).send('Sorry, something went wrong');
    });
};

function Location(location, geoData) {
  this.search_query = location;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

//================WEATHER===================//

app.get('/weather', handleWeather);

function handleWeather(request, response) {

  let url = `https://api.weatherbit.io/v2.0/forecast/daily`

  let queryParams = {
    key: process.env.WEATHER_API_KEY,
    lat: request.query.latitude,
    lon: request.query.longitude,
    days: 8

  }
  superagent.get(url)
    .query(queryParams)
    .then(resultsFromSuperagent => {
      let resultsBody = resultsFromSuperagent.body;
      let weatherArr = resultsBody['data'].map(date => {
        return new Weather(date);
      })
      response.status(200).send(weatherArr);
    }).catch((error) => {
      console.log('ERROR', error);
      response.status(500).send('Sorry, something went wrong');
    });
}

function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = new Date(obj.datetime).toDateString();
}

//=================TRAILS=========================//
app.get('/trails', handleTrails);

function handleTrails(request, response) {

  let url = `https://www.hikingproject.com/data/get-trails`

  let queryParams = {
    key: process.env.TRAIL_API_KEY,
    lat: request.query.latitude,
    lon: request.query.longitude,
    maxResults: 10
  }

  superagent.get(url)
    .query(queryParams)
    .then(resultsFromSuperagent => {
      console.log('these are my results from superagent:', resultsFromSuperagent.body);
      let trailsArr = resultsFromSuperagent.body['trails'].map(route => {
        return new Trails(route);
      })
      response.status(200).send(trailsArr);
    }).catch((error) => {
      console.log('ERROR', error);
      response.status(500).send('Sorry, something went wrong');
    });
}

function Trails(obj) {
  this.name = obj.name
  this.location = obj.location
  this.length = obj.length
  this.stars = obj.stars
  this.stars_votes = obj.starVotes
  this.summary = obj.summary
  this.trail_url = obj.url
  this.conditions = obj.conditionDetails
  this.conditions_date = obj.conditionDate.substring(0, 10)
  this.conditions_time = obj.conditionDate.substring(11, 19)
}


app.use('*', (request, response) => {
  response.status(404).send('page not found');
});


app.listen(PORT, () => {
  console.log(`listening on ${PORT}`)
});
