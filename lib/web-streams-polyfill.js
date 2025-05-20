/**
 * Web Streams Polyfill
 * 
 * This file provides a polyfill for web streams that works with React Native.
 */

import * as webStreams from 'web-streams-polyfill';

// Export all the web streams polyfill components
export const ReadableStream = webStreams.ReadableStream;
export const WritableStream = webStreams.WritableStream;
export const TransformStream = webStreams.TransformStream;
export const ByteLengthQueuingStrategy = webStreams.ByteLengthQueuingStrategy;
export const CountQueuingStrategy = webStreams.CountQueuingStrategy;

// Export the default object as well
export default webStreams;
