'use strict';

const mongoose = require('mongoose');
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios')
const Trip = require('./models/trips.js');
const verifyUser = require('./auth');



app.use(cors());
app.use(express.json());
mongoose.connect(process.env.DB_URL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Mongoose is connected');
});


const PORT = process.env.PORT || 3003;

app.get('/', (request, response) => {
  response.status(200).send('Cheap Trip is Live');
});

app.use(verifyUser);

app.get('/gas', getGas);

async function getGas(request, response, next) {
  let state = request.query.state;

  try {
    let url = `https://api.collectapi.com/gasPrice/stateUsaPrice?state=${state}`
    console.log('test')
    let gasData = await axios.get(url, {
      headers: {
        authorization: process.env.GAS_API_KEY
      }
    });
    let groomData = gasData.data.result.state
    let dataToSend = new GasPrice(groomData)
    
    response.status(200).send(dataToSend)
  } catch (error) {
    console.log(error)
    next(error);
  }
}

app.get('/directions', getDirections);

async function getDirections(request, response, next) {

  try {

    let cityOne = request.query.cityOne;
    let cityTwo = request.query.cityTwo;

    let url = `http://api.openweathermap.org/geo/1.0/direct?q=${cityOne}&limit=1&appid=${process.env.WEATHER_API_KEY}`
    let url2 = `http://api.openweathermap.org/geo/1.0/direct?q=${cityTwo}&limit=1&appid=${process.env.WEATHER_API_KEY}`

    let cityOneData = await axios.get(url);
    let cityTwoData = await axios.get(url2);

    let originLat = cityOneData.data[0].lat;
    let originLon = cityOneData.data[0].lon;

    let destLat = cityTwoData.data[0].lat;
    let destLon = cityTwoData.data[0].lon;
    
    let url3 = `https://us1.locationiq.com/v1/directions/driving/${originLon},${originLat};${destLon},${destLat}?key=${process.env.LOCATIONIQ_API_KEY}&geometries=geojson&overview=simplified`

    let directionData = await axios.get(url3)
    
    
    
    let center = [];
    center = directionData.data.routes[0].geometry.coordinates[(Math.floor(directionData.data.routes[0].geometry.coordinates.length / 2))];
 
    let centerLat = center[0];
    let centerLon = center[1];
   
    let groomData = directionData.data.routes[0].legs[0];

    let dataToSend = new Directions(groomData, centerLat, centerLon, originLat, originLon, destLat, destLon);
    
    response.status(200).send(dataToSend);

  } catch (error) {
    next(error)
  }
}

// app.get('/vehicle', getVehicle)

// async function getVehicle(request, response, next) {

// try {
//   let year = request.query.year;
//   let make = request.query.make;
//   let model = request.query.model;
//   let url = `https://fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${make}&model=${model}`
//   console.log(url)
//   let vehicleData = await axios.get(url)
//   console.log(vehicleData.data);

//   response.status(200).send(vehicleData.data);

// } catch (error) {
//   next(error)
// }


// }

app.post('/trips', postTrip)

async function postTrip(request, response, next) {
  try {
    let createdTrip = await Trip.create(request.body);
    console.log(request.body);
    response.status(201).send(createdTrip);

  } catch (error) {
    console.log(error);
    next(error);
  }
}

app.put('/trips/:tripID', updateTrip)

async function updateTrip(request, response, next) {
  try {
    let id = request.params.tripID;
    let data = request.body;

    const updatedTrip = await Trip.findByIdAndUpdate(id, data, { new: true, overwrite: true })

    response.status(200).send(updatedTrip);

  } catch (error) {
    next(error);
  }
  
  



}
app.delete('/trips/:tripID', deleteTrip);
async function deleteTrip(request, response, next) {
  try {
    console.log(request.params);
    console.log(request.params.tripID);
    let id = request.params.tripID;

    await Trip.findByIdAndDelete(id);

    response.status(200).send('Trip Deleted')

  } catch (error) {
    next(error);
  }
}

app.get('/trips', getTrips);

async function getTrips(request, response, next) {
  try {
    let allTrips = await Trip.find({});
    response.status(200).send(allTrips)

  } catch (error) {
    next(error);
  }
}


class GasPrice {
  constructor(gasObj) {
    this.name = gasObj.lowerName;
    this.gas = gasObj.gasoline;
    this.midGrade = gasObj.midGrade;
    this.premium = gasObj.premium;
    this.diesel = gasObj.diesel;
  }
}

class Directions {
  constructor(directionObj, centerLat, centerLon, originLat, originLon, destLat, destLon) {
    this.duration = directionObj.duration;
    this.distance = directionObj.distance;
    this.originLat = originLat;
    this.originLon = originLon;
    this.destLat = destLat;
    this.destLon = destLon;
    this.centerLat = centerLat;
    this.centerLon = centerLon;
  }

}

app.get('*', (request, response) => {
  console.log(request)
  response.status(404).send('This page does not exist');
});


app.use((error, request, response, next) => {
  response.status(500).send(error.message);
});

app.listen(PORT, () => console.log(`We are currently on port: ${PORT}`));