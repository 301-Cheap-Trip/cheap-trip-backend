'use strict';

const mongoose = require('mongoose');
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios')


app.use(cors());
// app.use(express.json());
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

app.get('/gas', getGas);

async function getGas(request, response, next) {
  let state = request.query.state;


  try {
    let url = `https://api.collectapi.com/gasPrice/stateUsaPrice?state=WA`
    let gasData = await axios.get(url, {
      headers: {
        authorization: process.env.GAS_API_KEY
      }
    });
    let groomData = gasData.data.result.state

    let dataToSend = new GasPrice(groomData)

    response.status(200).send(dataToSend)
  } catch (error) {
    next(error);
  }
}

app.get('/directions', getDirections);

async function getDirections(request, response, next) {



  try {

    let cityOne = request.query.cityOne;
    let cityTwo = request.query.cityTwo;

    let url = `http://api.openweathermap.org/geo/1.0/direct?q=${cityOne}&limit=1&appid=${process.env.LOCATION_API_KEY}`
    let url2 = `http://api.openweathermap.org/geo/1.0/direct?q=${cityTwo}&limit=1&appid=${process.env.LOCATION_API_KEY}`

    let cityOneData = await axios.get(url);
    let cityTwoData = await axios.get(url2);


    let latOne = cityOneData.data[0].lat;
    console.log(latOne);
    let lonOne = cityOneData.data[0].lon;


    let latTwo = cityTwoData.data[0].lat;
    let lonTwo = cityTwoData.data[0].lon;

    let directionData = await axios.get(`https://us1.locationiq.com/v1/directions/driving/${lonOne},${latOne};${lonTwo},${latTwo}?key=${process.env.LOCATION_API_KEY_TWO}&geometries=geojson&overview=full`)

    response.status(200).send(directionData.data);

  } catch (error) {
    next(error)
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













app.get('*', (request, response) => {
  response.status(404).send('This page does not exist');
});


app.use((error, request, response, next) => {
  response.status(500).send(error.message);
});



app.listen(PORT, () => console.log(`We are currently on port: ${PORT}`));