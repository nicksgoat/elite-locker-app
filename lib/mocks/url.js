/**
 * Mock implementation of the url module for React Native
 * 
 * This file provides a minimal mock implementation of the url module
 * that works in React Native without requiring Node.js modules.
 */

import { URL, URLSearchParams } from 'react-native-url-polyfill';

// Export the URL and URLSearchParams from the polyfill
exports.URL = URL;
exports.URLSearchParams = URLSearchParams;

// Parse function
exports.parse = function parse(urlStr, parseQueryString, slashesDenoteHost) {
  try {
    const url = new URL(urlStr);
    
    return {
      protocol: url.protocol,
      slashes: true,
      auth: url.username ? (url.password ? `${url.username}:${url.password}` : url.username) : null,
      host: url.host,
      port: url.port,
      hostname: url.hostname,
      hash: url.hash,
      search: url.search,
      query: parseQueryString ? Object.fromEntries(url.searchParams) : url.search.slice(1),
      pathname: url.pathname,
      path: `${url.pathname}${url.search}`,
      href: url.href
    };
  } catch (e) {
    return {};
  }
};

// Format function
exports.format = function format(urlObj) {
  if (typeof urlObj === 'string') return urlObj;
  
  const { protocol, host, pathname, search, hash } = urlObj;
  
  let result = '';
  
  if (protocol) {
    result += protocol;
    if (protocol.slice(-1) !== ':') result += ':';
    result += '//';
  }
  
  if (host) {
    result += host;
  }
  
  if (pathname) {
    if (pathname.charAt(0) !== '/') result += '/';
    result += pathname;
  }
  
  if (search) {
    if (search.charAt(0) !== '?') result += '?';
    result += search.charAt(0) === '?' ? search.slice(1) : search;
  }
  
  if (hash) {
    if (hash.charAt(0) !== '#') result += '#';
    result += hash.charAt(0) === '#' ? hash.slice(1) : hash;
  }
  
  return result;
};

// Resolve function
exports.resolve = function resolve(from, to) {
  try {
    return new URL(to, from).href;
  } catch (e) {
    return to;
  }
};

module.exports = exports;
