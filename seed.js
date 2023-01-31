'use strict';

const mongoose = require('mongoose');

require('dotenv').config();
mongoose.connect(process.env.DB_URL);

const Trip = require('./models/trips.js');

async function seed() {


  await Trip.create({
    duration: 12432,
    distance: 1234324,
    tripOrigin: 'Chicago',
    tripDestination: 'London',
    gasMileage: 324,
    username: 'Bobby',
    gasPrice: 4.20
  });

  console.log('Trip');

  await Trip.create({
    duration: 234,
    distance: 23421,
    tripOrigin: 'Seattle',
    tripDestination: 'Denver',
    gasMileage: 324,
    username: 'Jordan',
    gasPrice: 5.32
  });

  console.log('Trip');

  mongoose.disconnect();
}

seed();