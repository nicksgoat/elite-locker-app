/**
 * Empty polyfill module for Node.js modules that are not available in React Native
 * This prevents bundling errors when packages try to import Node.js-only modules
 */

module.exports = {};

// For modules that might expect specific exports, provide common patterns
module.exports.Socket = function() { 
  throw new Error('Socket not available in React Native'); 
};

module.exports.createConnection = function() { 
  throw new Error('createConnection not available in React Native'); 
};

module.exports.connect = function() { 
  throw new Error('connect not available in React Native'); 
};

module.exports.createServer = function() { 
  throw new Error('createServer not available in React Native'); 
};

// For file system operations
module.exports.readFile = function() { 
  throw new Error('File system not available in React Native'); 
};

module.exports.writeFile = function() { 
  throw new Error('File system not available in React Native'); 
};

// For child process operations
module.exports.spawn = function() { 
  throw new Error('Child processes not available in React Native'); 
};

module.exports.exec = function() { 
  throw new Error('Child processes not available in React Native'); 
}; 