// Jest setup file to handle Node.js environment issues
const { TextEncoder, TextDecoder } = require("util");

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock crypto for Node.js environment
const crypto = require("crypto");
global.crypto = {
  getRandomValues: (arr) => crypto.randomBytes(arr.length),
  subtle: {},
};
