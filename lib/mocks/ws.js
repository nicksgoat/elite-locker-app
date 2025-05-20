/**
 * Mock implementation of the ws package for React Native
 * 
 * This file provides a minimal mock implementation of the ws package
 * that works in React Native without requiring Node.js modules.
 */

import { EventEmitter } from 'events';

// Mock WebSocket class
class WebSocket extends EventEmitter {
  constructor(url, protocols) {
    super();
    this.url = url;
    this.protocols = protocols;
    this.readyState = WebSocket.CONNECTING;
    
    // Use the native WebSocket implementation
    this._ws = new global.WebSocket(url, protocols);
    
    this._ws.onopen = () => {
      this.readyState = WebSocket.OPEN;
      this.emit('open');
    };
    
    this._ws.onclose = (event) => {
      this.readyState = WebSocket.CLOSED;
      this.emit('close', event.code, event.reason);
    };
    
    this._ws.onerror = (error) => {
      this.emit('error', error);
    };
    
    this._ws.onmessage = (event) => {
      this.emit('message', event.data);
    };
  }
  
  send(data) {
    if (this.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    
    this._ws.send(data);
  }
  
  close(code, reason) {
    if (this.readyState === WebSocket.CLOSED) return;
    
    this.readyState = WebSocket.CLOSING;
    this._ws.close(code, reason);
  }
  
  // WebSocket states
  static get CONNECTING() { return 0; }
  static get OPEN() { return 1; }
  static get CLOSING() { return 2; }
  static get CLOSED() { return 3; }
}

// Mock WebSocketServer class (does nothing in React Native)
class WebSocketServer extends EventEmitter {
  constructor() {
    super();
    console.warn('WebSocketServer is not supported in React Native');
  }
  
  close() {
    // Do nothing
  }
}

// Export the mock classes
module.exports = {
  WebSocket,
  WebSocketServer,
  createWebSocketStream: () => {
    console.warn('createWebSocketStream is not supported in React Native');
    return null;
  }
};
