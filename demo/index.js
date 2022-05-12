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

client.on('socket:ready', async () => {
  console.log(`Ready!`);

  let configList = await client.getConfig((result, err) => { 
    if (err) {
      console.log(`Get config callback error: ${err.message}`);
    } else {
      console.log(`Get cnfig callback success: ${Object.keys(result).length} rows`);
    }
  }).then((result)=> {
    console.log(`Get config promise success: ${Object.keys(result).length} rows`);
  })
  .catch((err) => {
    console.log(`Get config promise error: ${err.message}`);
  });
  //console.log(configList);

  let panelsList = await client.getPanels((result, err) => { 
    if (err) {
      console.log(`Get panels callback error: ${err.message}`);
    } else {
      console.log(`Get panels callback success: ${Object.keys(result).length} rows`);
    }
  }).then((result)=> {
    console.log(`Get panels promise success: ${Object.keys(result).length} rows`);
  })
  .catch((err) => {
    console.log(`Get panels promise error: ${err.message}`);
  });
  //console.log(panelsList);

  let panelRow = await client.getPanel('test', (result, err) => { 
    if (err) {
      console.log(`Get panels callback error: ${err.message}`);
    } else {
      console.log(`Get panels callback success: ${(result) ? 'something': 'nothing'} found`);
    }
  }).then((result)=> {
    console.log(`Get panels promise success: ${(result) ? 'something': 'nothing'} found`);
  })
  .catch((err) => {
    console.log(`Get panels promise error: ${err.message}`);
  });
  //console.log(panelsRow);

  let servicesList = await client.getServices((result, err) => { 
    if (err) {
      console.log(`Get services callback error: ${err.message}`);
    } else {
      console.log(`Get services callback success: ${Object.keys(result).length} rows`);
    }
  }).then((result)=> {
    console.log(`Get services promise success: ${Object.keys(result).length} rows`);
  })
  .catch((err) => {
    console.log(`Get services promise error: ${err.message}`);
  });
  //console.log(servicesList);

  let servicesRow = await client.getService('test', (result, err) => { 
    if (err) {
      console.log(`Get services callback error: ${err.message}`);
    } else {
      console.log(`Get services callback success: ${(result) ? 'something': 'nothing'} found`);
    }
  }).then((result)=> {
    console.log(`Get services promise success: ${(result) ? 'something': 'nothing'} found`);
  })
  .catch((err) => {
    console.log(`Get services promise error: ${err.message}`);
  });
  //console.log(servicesRow);

  let statesList = await client.getStates((result, err) => { 
    if (err) {
      console.log(`Get states callback error: ${err.message}`);
    } else {
      console.log(`Get states callback success: ${Object.keys(result).length} rows`);
    }
  }).then((result)=> {
    console.log(`Get states promise success: ${Object.keys(result).length} rows`);
  })
  .catch((err) => {
    console.log(`Get states promise error: ${err.message}`);
  });
  // console.log(statesList);

  let statesRow = await client.getState('test', (result, err) => { 
    if (err) {
      console.log(`Get state callback error: ${err.message}`);
    } else {
      console.log(`Get state callback success: ${(result) ? 'something': 'nothing'} found`);
    }
  }).then((result)=> {
    console.log(`Get state promise success: ${(result) ? 'something': 'nothing'} found`);
  })
  .catch((err) => {
    console.log(`Get state promise error: ${err.message}`);
  });
  // console.log(statesRow);

  const serviceResponse = await client.callService('test', 'test', {}, (result, err) => { 
    if (err) {
      console.log(`Call service callback error: ${err.message}`);
    } else {
      console.log(`Call service callback success: ${(result) ? 'something': 'nothing'} found`);
    }
  }).then((result)=> {
    console.log(`Call service promise success: ${(result) ? 'something': 'nothing'} found`);
  })
  .catch((err) => {
    console.log(`Call service promise error: ${err.message}`);
  });
  // console.log(statesRow);

  const subscription = await client.subscribeEvents('*', {}, (result, err) => { 
    if (err) {
      console.log(`Subscribe events callback error: ${err.message}`);
    } else {
      console.log(`Subscribe events callback success: ${(result) ? 'something': 'nothing'} found`);
    }
  }).then((result)=> {
    console.log(`Subscribe events promise success: ${(result) ? 'something': 'nothing'} found`);
  })
  .catch((err) => {
    console.log(`Subscribe events promise error: ${err.message}`);
  });
  // console.log(subscription);

  client.on('*', (event) => {
    console.log(`Event fired ${event.time_fired}`);
  });
});

client.on('socket:disconnected', () => {
  console.log(`Disconnected!`);
});

client.on('socket:error', (err) => {
  console.log(`${err}`);
});

client.connect();

setTimeout(() => {
  console.log('End timeout');
}, 10000000);