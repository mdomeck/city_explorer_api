'use strict'

// libraries
const express = require('express');
const app = express(); //server library
const cors = require('cors'); //really bad body guard lets anyone talk to server
app.use(cors()); // allow all clients into our server
const superagent = require('superagent'); //gets stuff from API
require('dotenv').config(); //privacy library

const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => {
  console.log('ERROR', err);
});


// global variables
const PORT = process.env.PORT || 3001;

// app.get('/bananas', (request, response) => {
//   response.send('we are alive');
// })


//=============LOCATION========================//
app.get('/location', handleLocation);

function handleLocation(request, response) {
  let city = request.query.city;

  let sql = 'SELECT * FROM locations WHERE search_query=$1;';
  let safeValues = [city];

  client.query(sql, safeValues)
    .then(resultsFromPostgres => {
      if (resultsFromPostgres.rowCount) {
        let locationOject = resultsFromPostgres.rows[0];
        response.status(200).send(locationOject);
      } else {

        let url = `https://us1.locationiq.com/v1/search.php`;

        let queryParams = {
          key: process.env.GEOCODE_API_KEY,
          q: city,
          format: 'json',
          limit: 1
        };

        superagent.get(url)
          .query(queryParams)
          .then(resultsFromSuperagent => {
            let geoData = resultsFromSuperagent.body;
            const obj = new Location(city, geoData);

            let sql = 'INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';

            let safeValues = [obj.search_query, obj.formatted_query, obj.latitude, obj.longitude];

            client.query(sql, safeValues);

            response.status(200).send(obj);
          }).catch((error) => {
            console.log('ERROR', error);
            response.status(500).send('Sorry, something went wrong');
          });
      }
    })
}



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


//============Movies========================//

app.get('/movies', handleMovies);

function handleMovies(request, response) {
  let url = `https://api.themoviedb.org/3/search/movie`

  let queryParams = {
    api_key: process.env.MOVIE_API_KEY,
    query: request.query.search_query,
  }
  superagent.get(url)
    .query(queryParams)
    .then(resultsFromSuperagent => {
      console.log('results from superagent', resultsFromSuperagent.body);
      let moviesArr = resultsFromSuperagent.body.results.map(route => {
        return new Movies(route);
      })
      response.status(200).send(moviesArr);
    }).catch((error) => {
      console.log('ERROR', error);
      response.status(500).send('Sorry, something went wrong');
    });
}

function Movies(obj) {
  this.title = obj.original_title
  this.overview = obj.overview
  this.average_votes = obj.vote_average
  this.total_votes = obj.vote_count
  this.image_url = `https://image.tmdb.org/t/p/original${obj.poster_path}`
  this.popularity = obj.popularity
  this.released_on = obj.release_date
}

//======================YELP========================//

// app.get('/restaurants', handleRestaurants);

// function handleRestaurants(request,response){
//   id:
//   search_query

// }



app.use('*', (request, response) => {
  response.status(404).send('page not found');
});

client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`listening on ${PORT}`));
  }).catch(err => console.log('ERROR', err));


// app.listen(PORT, () => console.log(`listening on ${PORT}`));
