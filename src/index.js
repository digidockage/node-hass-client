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
const EventEmitter = require('events')
const WebSocket = require('ws');

// > > > > > > > > > > > > > > > > > > > > > > > Import internals
const { AUTHENTICATED, CONNECTED, CONNECTING, DISCONNECTED, DISCONNECTING, ERROR } = require('./constants/events.constant');

// > > > > > > > > > > > > > > > > > > > > > > > The code
const defaultUrl = {
  protocol: 'ws',
  host: 'localhost',
  port: 8123
};

const HassClient = ({ url, token }) => {
  // Client options
  const options = {};
  options.url = url || defaultUrl;
  options.token = token;

  // Variables
  const emitter = new EventEmitter();
  var socket;

  // Functions
  const connect = () => {
    emitter.emit(CONNECTING);

    socket = new WebSocket(`${options.url.protocol}://${options.url.host}:${options.url.port}/api/websocket`);

    socket.on('open', () => {
      emitter.emit(CONNECTED);
    });

    socket.on('error', (err) => {
      emitter.emit(ERROR, err);

      if (socket) {
        connect();
      }
    });

    socket.on('message', (data) => {
      data = JSON.parse(data);

      if (data.type == 'auth_ok') {
        emitter.emit(AUTHENTICATED);
      } else if (data.type == 'auth_required') {
        return socket.send(JSON.stringify({type: 'auth', access_token: options.token}));
      } else if (data.type == 'auth_invalid') {
        emitter.emit(ERROR, 'Invalid password');
      }
    });

    socket.on('close', () => {
      emitter.emit(DISCONNECTED);

      if (socket) {
        connect();
      }
    });
  };

  const disconnect = () => {
    emitter.emit(DISCONNECTING);

    socket = null;

    socket.disconnect();
  };

  // Bind on authenticated event
  const onAuthenticated = (callback, remove) => {
    if (remove) {
      emitter.removeListener(AUTHENTICATED, callback);
    } else {
      emitter.on(AUTHENTICATED, callback);
    }
  };

  // Bind on connected event
  const onConnected = (callback, remove) => {
    if (remove) {
      emitter.removeListener(CONNECTED, callback);
    } else {
      emitter.on(CONNECTED, callback);
    }
  };

  // Bind on disconnected event
  const onDisconnected = (callback, remove) => {
    if (remove) {
      emitter.removeListener(DISCONNECTED, callback);
    } else {
      emitter.on(DISCONNECTED, callback);
    }
  };

  // Bind on error event
  const onError = (callback, remove) => {
    if (remove) {
      emitter.removeListener(ERROR, callback);
    } else {
      emitter.on(ERROR, callback);
    }
  };

  return {
    connect,
    disconnect,
    onAuthenticated,
    onConnected,
    onDisconnected,
    onError
  };
};

// > > > > > > > > > > > > > > > > > > > > > > > Module exports
module.exports = HassClient;
