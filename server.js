'use strict';

// const mongoose = require('mongoose');
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
// const { response } = require('express');
const axios = require('axios')


app.use(cors());
// app.use(express.json());

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