/**
 * Mock implementation of @supabase/supabase-js for React Native
 * 
 * This file provides a minimal mock implementation of the Supabase client
 * that works in React Native without requiring Node.js modules or WebSocket connections.
 */

// Mock Supabase Response type
class SupabaseResponse {
  constructor(data = null, error = null) {
    this.data = data;
    this.error = error;
  }
}

// Mock Auth API
class MockAuth {
  async getSession() {
    console.warn('Supabase Auth is mocked - getSession()');
    return new SupabaseResponse(null, null);
  }

  async signUp(credentials) {
    console.warn('Supabase Auth is mocked - signUp()');
    return new SupabaseResponse(null, null);
  }

  async signInWithPassword(credentials) {
    console.warn('Supabase Auth is mocked - signInWithPassword()');
    return new SupabaseResponse(null, null);
  }

  async signOut() {
    console.warn('Supabase Auth is mocked - signOut()');
    return new SupabaseResponse(null, null);
  }

  onAuthStateChange(callback) {
    console.warn('Supabase Auth is mocked - onAuthStateChange()');
    return {
      data: { subscription: { unsubscribe: () => {} } },
      error: null
    };
  }
}

// Mock Database Query Builder
class MockQueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this._select = '*';
    this._filters = [];
  }

  select(columns = '*') {
    this._select = columns;
    return this;
  }

  insert(data) {
    console.warn(`Supabase Database is mocked - insert into ${this.tableName}`);
    return this;
  }

  update(data) {
    console.warn(`Supabase Database is mocked - update ${this.tableName}`);
    return this;
  }

  delete() {
    console.warn(`Supabase Database is mocked - delete from ${this.tableName}`);
    return this;
  }

  eq(column, value) {
    this._filters.push({ type: 'eq', column, value });
    return this;
  }

  neq(column, value) {
    this._filters.push({ type: 'neq', column, value });
    return this;
  }

  gt(column, value) {
    this._filters.push({ type: 'gt', column, value });
    return this;
  }

  gte(column, value) {
    this._filters.push({ type: 'gte', column, value });
    return this;
  }

  lt(column, value) {
    this._filters.push({ type: 'lt', column, value });
    return this;
  }

  lte(column, value) {
    this._filters.push({ type: 'lte', column, value });
    return this;
  }

  like(column, pattern) {
    this._filters.push({ type: 'like', column, pattern });
    return this;
  }

  in(column, values) {
    this._filters.push({ type: 'in', column, values });
    return this;
  }

  order(column, options = {}) {
    console.warn(`Supabase Database is mocked - order by ${column}`);
    return this;
  }

  limit(count) {
    console.warn(`Supabase Database is mocked - limit ${count}`);
    return this;
  }

  range(from, to) {
    console.warn(`Supabase Database is mocked - range ${from} to ${to}`);
    return this;
  }

  single() {
    console.warn(`Supabase Database is mocked - single()`);
    return this;
  }

  // This is the final method that returns a promise
  async then(resolve, reject) {
    console.warn(`Supabase Database query executed on ${this.tableName}:`, {
      select: this._select,
      filters: this._filters
    });
    
    // Return empty successful response
    const response = new SupabaseResponse([], null);
    return resolve ? resolve(response) : response;
  }

  // Make it thenable for async/await
  catch(onRejected) {
    return this.then(null, onRejected);
  }
}

// Mock Storage API
class MockStorage {
  from(bucketName) {
    console.warn(`Supabase Storage is mocked - bucket: ${bucketName}`);
    return {
      upload: async (path, file, options) => {
        console.warn(`Supabase Storage is mocked - upload to ${path}`);
        return new SupabaseResponse(null, null);
      },
      download: async (path) => {
        console.warn(`Supabase Storage is mocked - download from ${path}`);
        return new SupabaseResponse(null, null);
      },
      remove: async (paths) => {
        console.warn(`Supabase Storage is mocked - remove`, paths);
        return new SupabaseResponse(null, null);
      },
      list: async (path = '', options = {}) => {
        console.warn(`Supabase Storage is mocked - list ${path}`);
        return new SupabaseResponse([], null);
      },
      getPublicUrl: (path) => {
        console.warn(`Supabase Storage is mocked - getPublicUrl ${path}`);
        return { data: { publicUrl: `https://mock-url.com/${path}` } };
      }
    };
  }
}

// Mock Realtime API
class MockRealtime {
  channel(topic) {
    console.warn(`Supabase Realtime is mocked - channel: ${topic}`);
    const channelMock = {
      on: (event, callback) => {
        console.warn(`Supabase Realtime is mocked - listening to ${event}`);
        return channelMock;
      },
      subscribe: () => {
        console.warn(`Supabase Realtime is mocked - subscribed`);
        return channelMock;
      },
      unsubscribe: () => {
        console.warn(`Supabase Realtime is mocked - unsubscribed`);
        return channelMock;
      }
    };
    return channelMock;
  }
}

// Mock Supabase Client
class MockSupabaseClient {
  constructor(supabaseUrl, supabaseKey, options = {}) {
    console.warn('Supabase Client is mocked - initialized with URL:', supabaseUrl);
    this.auth = new MockAuth();
    this.storage = new MockStorage();
    this.realtime = new MockRealtime();
  }

  from(tableName) {
    return new MockQueryBuilder(tableName);
  }

  rpc(fnName, params = {}) {
    console.warn(`Supabase RPC is mocked - calling ${fnName}`);
    return new MockQueryBuilder(`rpc:${fnName}`);
  }
}

// Mock createClient function
export const createClient = (supabaseUrl, supabaseKey, options = {}) => {
  return new MockSupabaseClient(supabaseUrl, supabaseKey, options);
};

// Export default for compatibility
export default {
  createClient
}; 