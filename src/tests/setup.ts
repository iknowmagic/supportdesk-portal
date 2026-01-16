import React from 'react';

// Mock ResizeObserver for tests
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Add ResizeObserver to the global scope
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserver
});

// Mock IntersectionObserver as well, since it's commonly needed in tests
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }
});

// Mock matchMedia for useMediaQuery hook
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// Mock CSS import
Object.defineProperty(window, 'CSS', {
  writable: true,
  value: {
    supports: () => true,
    escape: (str: string) => str,
  },
});

Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window.HTMLElement.prototype, 'hasPointerCapture', {
  writable: true,
  value: vi.fn().mockReturnValue(false),
});

Object.defineProperty(window.HTMLElement.prototype, 'setPointerCapture', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window.HTMLElement.prototype, 'releasePointerCapture', {
  writable: true,
  value: vi.fn(),
});

vi.mock('@mdxeditor/editor', () => ({
  MDXEditor: ({
    markdown,
    onChange,
  }: {
    markdown: string;
    onChange: (value: string) => void;
  }) =>
    React.createElement('textarea', {
      'data-testid': 'notes-editor',
      value: markdown,
      onChange: (event: { target: { value: string } }) =>
        onChange(event.target.value),
    }),
  BlockTypeSelect: () => null,
  BoldItalicUnderlineToggles: () => null,
  CreateLink: () => null,
  headingsPlugin: () => ({}),
  quotePlugin: () => ({}),
  linkPlugin: () => ({}),
  linkDialogPlugin: () => ({}),
  toolbarPlugin: () => ({}),
}));

vi.mock('@mdxeditor/editor/style.css', () => ({}));
