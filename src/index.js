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
const EventEmitter = require('events');
const WebSocket = require('ws');

// > > > > > > > > > > > > > > > > > > > > > > > Import internals
const {
  HASS_CALL_SERVICE,
  HASS_GET_CONFIG,
  HASS_GET_PANELS,
  HASS_GET_SERVICES,
  HASS_GET_STATES,
  HASS_SUBSCRIBE_EVENTS,
  HASS_UNSUBSCRIBE_EVENTS,
  SOCKET_AUTHENTICATED,
  SOCKET_CONNECTED,
  SOCKET_CONNECTING,
  SOCKET_DISCONNECTED,
  SOCKET_DISCONNECTING,
  SOCKET_ERROR,
  SOCKET_READY
} = require('./constants/events.constant');

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
  let emitter = new EventEmitter();
  let socket = null;

  let lastRequestId = 1;
  let requestPromises = {};

  // Private functions
  const _promiseCallback = async (promiseReference,  callbackReference) => {
    return new Promise((resolve, reject) => {
      promiseReference
        .then((value) => {
          callbackReference(value, null);
          resolve(value);
        })
        .catch((err) => {
          callbackReference(null, err);
          reject(err);
        });
    });
  };

  const _sendRequest = async (data) => {
    if (!data.id) {
      data.id = lastRequestId++;
    }

    return new Promise((resolve, reject) => {
      requestPromises[data.id] = {
        resolve,
        reject
      };

      socket.send(JSON.stringify(data));
    });
  };

  const _handleResponse = async (data) => {
    data = JSON.parse(data);

    switch(data.type) {
      case 'auth_ok':
        emitter.emit(SOCKET_AUTHENTICATED);
        emitter.emit(SOCKET_READY);
        break;
      case 'auth_required':
        socket.send(JSON.stringify({ type: 'auth', access_token: options.token }));
        break;
      case 'auth_invalid':
        emitter.emit(SOCKET_ERROR, 'Invalid password');
        break;
      case 'result':
        if (data.success) {
          requestPromises[data.id].resolve(data.result);
        } else {
          requestPromises[data.id].reject(data.error);
        }
        break;
      case 'event':
        emitter.emit(data.event_type, data.event);
        emitter.emit('*', data.event);
        break;
      default:
        console.log(data);
    }
  };

  // Connection functions
  const connect = async (callback) => {
    if (typeof callback === 'function') {
      on(SOCKET_READY, callback);
    }

    emitter.emit(SOCKET_CONNECTING);

    socket = new WebSocket(`${options.url.protocol}://${options.url.host}:${options.url.port}/api/websocket`);

    socket.on('open', () => {
      emitter.emit(SOCKET_CONNECTED);
    });

    socket.on('error', (err) => {
      emitter.emit(SOCKET_ERROR, err);

      if (socket) {
        connect();
      }
    });

    socket.on('message', _handleResponse);
    
    socket.on('close', () => {
      emitter.emit(SOCKET_DISCONNECTED);

      if (socket) {
        connect();
      }
    });
  };

  const disconnect = async (callback) => {
    if (typeof callback === 'function') {
      on(SOCKET_DISCONNECTED, callback);
    }

    emitter.emit(SOCKET_DISCONNECTING);

    socket.close();
    socket = null;
  };

  // Call service
  const callService = async (service, domain, options = {}, callback = () => {}) => {
    if (!service || typeof service !== 'string' || service === '') {
      throw Error('Service must be a string, and it required');
    } else if (!domain || typeof domain !== 'string' || domain === '') {
      throw Error('Domain must be a string, and it required');
    } else if (callback && typeof callback !== 'function') {
      throw Error('Callback must be a function');
    }

    return _promiseCallback(
      _sendRequest({ ...options, service, domain, type: HASS_CALL_SERVICE}),
      callback
    );
  };

  // Get config
  const getConfig = async (callback = () => {}) => {
    if (callback && typeof callback !== 'function') {
      throw Error('Callback must be a function');
    }

    return _promiseCallback(
      _sendRequest({ type: HASS_GET_CONFIG }),
      callback
    );
  };
  
  // Get single service
  const getPanel = async (panel, callback = () => {}) => {
    if (!panel || typeof panel !== 'string' || panel === '') {
      throw Error('Panel must be a string, and it required');
    } else if (callback && typeof callback !== 'function') {
      throw Error('Callback must be a function');
    }

    return _promiseCallback(
      getPanels().then((panels) => panels[panel]),
      callback
    );
  };

  // Get all services
  const getPanels = async (callback = () => {}) => {
    if (callback && typeof callback !== 'function') {
      throw Error('Callback must be a function');
    }

    return _promiseCallback(
      _sendRequest({ type: HASS_GET_PANELS }),
      callback
    );
  };

  // Get single service
  const getService = async (service, callback = () => {}) => {
    if (!service || typeof service !== 'string' || service === '') {
      throw Error('Service must be a string, and it required');
    } else if (callback && typeof callback !== 'function') {
      throw Error('Callback must be a function');
    }

    return _promiseCallback(
      getServices().then((services) => services[service]),
      callback
    );
  };

  // Get all services
  const getServices = async (callback = () => {}) => {
    if (callback && typeof callback !== 'function') {
      throw Error('Callback must be a function');
    }

    return _promiseCallback(
      _sendRequest({ type: HASS_GET_SERVICES }),
      callback
    );
  };

  // Get single state
  const getState = async (entity, callback = () => {}) => {
    if (!entity || typeof entity !== 'string' || entity === '') {
      throw Error('Entity must be a string, and it required');
    } else if (callback && typeof callback !== 'function') {
      throw Error('Callback must be a function');
    }

    return _promiseCallback(
      getStates().then((list) => list.findIndex((row) => row.entity_id = entity)),
      callback
    );
  };

  // Get all states
  const getStates = async (callback = () => {}) => {
    if (callback && typeof callback !== 'function') {
      throw Error('Callback must be a function');
    }

    let requestData = { 
      type: HASS_GET_STATES
    };

    return _promiseCallback(
      _sendRequest(requestData), 
      callback
    );
  };

  // Bind events
  const subscribeEvents = (event = '*', options = {}, callback = () => {}) => {
    if (typeof event !== 'string') {
      throw Error('Event must be a string');
    } else if (typeof callback !== 'function') {
      throw Error('Callback must be a function');
    }

    let requestData = {
      ...options,
      type: HASS_SUBSCRIBE_EVENTS
    };
    if (event !== '*') {
      requestData.event_type = event;
    }

    return _promiseCallback(
      _sendRequest(requestData), 
      callback
    );
  };

  const on = (event, callback) => {
    emitter.on(event, callback);
  };

  // Unbind events
  const unsubscribeEvents = (event, callback) => {
    //TODO
    let todo = HASS_UNSUBSCRIBE_EVENTS;
  };

  const off = (event, callback) => {
    emitter.off(event, callback);
  };

  return {
    callService,
    connect,
    disconnect,
    getConfig,
    getPanel,
    getPanels,
    getService,
    getServices,
    getState,
    getStates,
    on,
    off,
    subscribeEvents,
    unsubscribeEvents
  };
};

// > > > > > > > > > > > > > > > > > > > > > > > Module exports
module.exports = HassClient;
