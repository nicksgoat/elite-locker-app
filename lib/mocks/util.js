/**
 * Mock implementation of the util module for React Native
 * 
 * This file provides a minimal mock implementation of the util module
 * that works in React Native without requiring Node.js modules.
 */

// Utility function to check if a value is an object
function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

// Utility function to check if a value is a date
function isDate(d) {
  return isObject(d) && Object.prototype.toString.call(d) === '[object Date]';
}

// Utility function to check if a value is an error
function isError(e) {
  return isObject(e) && (Object.prototype.toString.call(e) === '[object Error]' || e instanceof Error);
}

// Utility function to check if a value is a function
function isFunction(arg) {
  return typeof arg === 'function';
}

// Utility function to check if a value is a primitive type
function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||
         typeof arg === 'undefined';
}

// Utility function to check if a value is a buffer
function isBuffer(b) {
  return b && typeof b === 'object' && typeof b.length === 'number' && b.copy && b.fill && b.readUInt8;
}

// Utility function to check if a value is a RegExp
function isRegExp(re) {
  return isObject(re) && Object.prototype.toString.call(re) === '[object RegExp]';
}

// Utility function to check if a value is a string
function isString(arg) {
  return typeof arg === 'string';
}

// Utility function to check if a value is a number
function isNumber(arg) {
  return typeof arg === 'number';
}

// Utility function to check if a value is a boolean
function isBoolean(arg) {
  return typeof arg === 'boolean';
}

// Utility function to check if a value is null
function isNull(arg) {
  return arg === null;
}

// Utility function to check if a value is undefined
function isUndefined(arg) {
  return arg === undefined;
}

// Utility function to check if a value is a symbol
function isSymbol(arg) {
  return typeof arg === 'symbol';
}

// Utility function to check if a value is an array
function isArray(arg) {
  return Array.isArray(arg);
}

// Utility function to format a string with placeholders
function format(f) {
  if (!isString(f)) {
    const objects = [];
    for (let i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  let i = 1;
  const args = arguments;
  const len = args.length;
  let str = String(f).replace(/%[sdj%]/g, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (let x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
}

// Simple inspect function
function inspect(obj, opts) {
  if (isNull(obj)) return 'null';
  if (isUndefined(obj)) return 'undefined';
  if (isString(obj)) return `'${obj}'`;
  if (isNumber(obj) || isBoolean(obj)) return obj.toString();
  if (isFunction(obj)) return '[Function]';
  if (isArray(obj)) {
    return `[ ${obj.map(item => inspect(item)).join(', ')} ]`;
  }
  if (isObject(obj)) {
    const keys = Object.keys(obj);
    return `{ ${keys.map(key => `${key}: ${inspect(obj[key])}`).join(', ')} }`;
  }
  return String(obj);
}

// Inherits function
function inherits(ctor, superCtor) {
  if (ctor === undefined || ctor === null) {
    throw new TypeError('The constructor to "inherits" must not be null or undefined');
  }

  if (superCtor === undefined || superCtor === null) {
    throw new TypeError('The super constructor to "inherits" must not be null or undefined');
  }

  if (superCtor.prototype === undefined) {
    throw new TypeError('The super constructor to "inherits" must have a prototype');
  }

  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
}

// Promisify function
function promisify(original) {
  if (typeof original !== 'function') {
    throw new TypeError('The "original" argument must be of type Function');
  }

  return function(...args) {
    return new Promise((resolve, reject) => {
      original.call(this, ...args, (err, ...values) => {
        if (err) {
          reject(err);
        } else {
          resolve(values.length === 1 ? values[0] : values);
        }
      });
    });
  };
}

// Export the util functions
module.exports = {
  isArray,
  isBoolean,
  isBuffer,
  isDate,
  isError,
  isFunction,
  isNull,
  isNumber,
  isObject,
  isPrimitive,
  isRegExp,
  isString,
  isSymbol,
  isUndefined,
  format,
  inspect,
  inherits,
  promisify,
  // Add other util functions as needed
  deprecate: function(fn, msg) {
    return fn;
  },
  debuglog: function() {
    return function() {};
  },
  types: {
    isDate,
    isRegExp
  }
};
