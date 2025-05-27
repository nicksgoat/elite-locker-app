/**
 * Mock implementation of @supabase/realtime-js for React Native
 * 
 * This mock provides a minimal implementation that doesn't require WebSocket
 * functionality, allowing the app to run without Node.js dependencies.
 */

// Mock RealtimeClient class
class RealtimeClient {
  constructor(endPoint, options = {}) {
    this.endPoint = endPoint;
    this.options = options;
    this.channels = [];
    this.connected = false;
  }

  connect() {
    console.warn('RealtimeClient.connect() is mocked - real-time features disabled');
    this.connected = true;
    return Promise.resolve();
  }

  disconnect() {
    console.warn('RealtimeClient.disconnect() is mocked');
    this.connected = false;
    return Promise.resolve();
  }

  channel(topic, chanParams = {}) {
    const mockChannel = new RealtimeChannel(topic, chanParams, this);
    this.channels.push(mockChannel);
    return mockChannel;
  }

  removeChannel(channel) {
    const index = this.channels.indexOf(channel);
    if (index > -1) {
      this.channels.splice(index, 1);
    }
  }

  removeAllChannels() {
    this.channels = [];
  }

  isConnected() {
    return this.connected;
  }
}

// Mock RealtimeChannel class
class RealtimeChannel {
  constructor(topic, params, socket) {
    this.topic = topic;
    this.params = params;
    this.socket = socket;
    this.state = 'closed';
    this.bindings = [];
  }

  subscribe(callback) {
    console.warn('RealtimeChannel.subscribe() is mocked - real-time features disabled');
    this.state = 'joined';
    if (callback) {
      setTimeout(() => callback('SUBSCRIBED'), 0);
    }
    return this;
  }

  unsubscribe() {
    console.warn('RealtimeChannel.unsubscribe() is mocked');
    this.state = 'closed';
    return Promise.resolve();
  }

  on(type, filter, callback) {
    console.warn(`RealtimeChannel.on(${type}) is mocked - real-time features disabled`);
    this.bindings.push({ type, filter, callback });
    return this;
  }

  off(type, filter) {
    console.warn(`RealtimeChannel.off(${type}) is mocked`);
    this.bindings = this.bindings.filter(binding => 
      binding.type !== type || (filter && binding.filter !== filter)
    );
    return this;
  }

  send(event, payload) {
    console.warn('RealtimeChannel.send() is mocked - real-time features disabled');
    return Promise.resolve();
  }
}

// Mock constants
const REALTIME_PRESENCE_LISTEN_EVENTS = {
  SYNC: 'sync',
  JOIN: 'join',
  LEAVE: 'leave'
};

const REALTIME_LISTEN_TYPES = {
  BROADCAST: 'broadcast',
  PRESENCE: 'presence',
  POSTGRES_CHANGES: 'postgres_changes'
};

const REALTIME_SUBSCRIBE_STATES = {
  SUBSCRIBED: 'SUBSCRIBED',
  TIMED_OUT: 'TIMED_OUT',
  CLOSED: 'CLOSED',
  CHANNEL_ERROR: 'CHANNEL_ERROR'
};

// Export the mock classes and constants
module.exports = {
  RealtimeClient,
  RealtimeChannel,
  REALTIME_PRESENCE_LISTEN_EVENTS,
  REALTIME_LISTEN_TYPES,
  REALTIME_SUBSCRIBE_STATES,
  // Common exports from the real package
  default: RealtimeClient
}; 