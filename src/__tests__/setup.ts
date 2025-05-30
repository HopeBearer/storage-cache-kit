import { vi } from 'vitest';

// 为测试环境创建全局模拟对象
const globalAny: any = global;

// 模拟 localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    length: 0,
  };
})();

// 模拟 sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    length: 0,
  };
})();

// 模拟 document 和 cookie
const mockDocument = {
  cookie: '',
};

// 设置全局模拟对象
globalAny.window = {
  localStorage: mockLocalStorage,
  sessionStorage: mockSessionStorage,
  document: mockDocument,
};

// 将window对象属性复制到global
globalAny.localStorage = mockLocalStorage;
globalAny.sessionStorage = mockSessionStorage;
globalAny.document = mockDocument; 