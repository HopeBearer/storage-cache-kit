import { LocalStorageAdapter } from './localStorage';
import { SessionStorageAdapter } from './sessionStorage';
import { MemoryStorageAdapter } from './memoryStorage';
import { CookieStorageAdapter } from './cookieStorage';

export {
  LocalStorageAdapter,
  SessionStorageAdapter,
  MemoryStorageAdapter,
  CookieStorageAdapter
};

// 适配器类型常量
export const ADAPTER_TYPES = {
  LOCAL_STORAGE: 'localStorage',
  SESSION_STORAGE: 'sessionStorage',
  MEMORY: 'memory',
  COOKIE: 'cookie'
} as const;

// 适配器类型
export type AdapterType = typeof ADAPTER_TYPES[keyof typeof ADAPTER_TYPES]; 