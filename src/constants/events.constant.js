/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                                                 *
 *    Copyright (c) 2022 Sgobbi Federico                                                           *
 *    All rights reserved.                                                                         *
 *                                                                                                 *
 *    This file is licensed under the MIT License.                                                 *
 *    License text available at https://opensource.org/licenses/MIT                                *
 *                                                                                                 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// > > > > > > > > > > > > > > > > > > > > > > > The code
const AUTHENTICATED = 'websocket:authenticated';
const CONNECTED = 'websocket:connected';
const CONNECTING = 'websocket:connectring';
const DISCONNECTED = 'websocket:disconnected';
const DISCONNECTING = 'websocket:disconnecting';
const ERROR = 'websocket:error';

// > > > > > > > > > > > > > > > > > > > > > > > Module exports
module.exports = {
  AUTHENTICATED,
  CONNECTED,
  CONNECTING,
  DISCONNECTED,
  DISCONNECTING,
  ERROR
};
