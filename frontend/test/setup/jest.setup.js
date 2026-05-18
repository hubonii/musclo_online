// Shared Jest test setup (DOM matchers + minimal Node polyfills used by app code).
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return []; }
};

// Mock react-markdown and remark-gfm to prevent ESM parse errors in Jest environment
jest.mock('react-markdown', () => {
  const React = require('react');
  return function DummyMarkdown({ children }) {
    return React.createElement(React.Fragment, null, children);
  };
});

jest.mock('remark-gfm', () => {
  return {};
});
