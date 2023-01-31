'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const tripSchema = new Schema({
  duration: { type: Number, required: true },
  distance: { type: Number, required: true },
  tripOrigin: { type: String, required: true },
  tripDestination: { type: String, required: true },
  gasMileage: { type: Number, required: true },
  username: { type: String, required: true },
  gasPrice: { type: Number, required: false },
});

const TripModel = mongoose.model('trip', tripSchema);

module.exports = TripModel;