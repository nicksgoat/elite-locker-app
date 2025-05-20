/**
 * Mock implementation of the http module for React Native
 * 
 * This file provides a minimal mock implementation of the http module
 * that works in React Native without requiring Node.js modules.
 */

import { EventEmitter } from 'events';

// Mock Server class
class Server extends EventEmitter {
  constructor() {
    super();
    console.warn('HTTP Server is not supported in React Native');
  }
  
  listen() {
    console.warn('HTTP Server.listen is not supported in React Native');
    return this;
  }
  
  close() {
    console.warn('HTTP Server.close is not supported in React Native');
    return this;
  }
}

// Mock request function
function request(options, callback) {
  console.warn('HTTP request is not fully supported in React Native');
  
  // Create a mock ClientRequest
  const req = new EventEmitter();
  
  req.end = () => {
    // Create a mock IncomingMessage
    const res = new EventEmitter();
    res.headers = {};
    res.statusCode = 200;
    res.statusMessage = 'OK';
    
    if (callback) {
      callback(res);
    }
    
    // Simulate response data
    setTimeout(() => {
      res.emit('data', Buffer.from('Mock response data'));
      res.emit('end');
    }, 10);
  };
  
  req.abort = () => {
    req.emit('abort');
  };
  
  return req;
}

// Mock get function
function get(options, callback) {
  const req = request(options, callback);
  req.end();
  return req;
}

// Export the mock module
module.exports = {
  Server,
  request,
  get,
  createServer: () => new Server()
};
