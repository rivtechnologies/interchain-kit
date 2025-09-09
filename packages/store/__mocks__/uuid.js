module.exports = {
  v1: jest.fn(() => 'mock-uuid-v1'),
  v4: jest.fn(() => 'mock-uuid-v4'),
  default: {
    v1: jest.fn(() => 'mock-uuid-v1'),
    v4: jest.fn(() => 'mock-uuid-v4'),
  },
};
