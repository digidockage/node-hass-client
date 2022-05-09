/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                                                 *
 *    Copyright (c) 2022 Sgobbi Federico                                                           *
 *    All rights reserved.                                                                         *
 *                                                                                                 *
 *    This file is licensed under the MIT License.                                                 *
 *    License text available at https://opensource.org/licenses/MIT                                *
 *                                                                                                 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// > > > > > > > > > > > > > > > > > > > > > > > Import externals
const dotenv = require('dotenv');

// > > > > > > > > > > > > > > > > > > > > > > > Import internals
const HassClient = require('../src/index');

// > > > > > > > > > > > > > > > > > > > > > > > The code
dotenv.config();

const options = {
  url: {
    protocol: process.env.HASS_PROTOCOL,
    host: process.env.HASS_HOST,
    port: process.env.HASS_PORT
  },
  token: process.env.HASS_TOKEN
};

const client = HassClient(options);

client.onAuthenticated(() => {
  console.log(`Authenticated!`);
});

client.onConnected(() => {
  console.log(`Connected!`);
});

client.onDisconnected(() => {
  console.log(`Disconnected!`);
});

client.onError((err) => {
  console.log(`${err}`);
});

client.connect();

setTimeout(() => {
  console.log('End timeout');
}, 60000);