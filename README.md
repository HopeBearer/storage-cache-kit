# Storage Cache Kit

一个用于统一管理各种类型客户端存储和缓存的轻量级库。支持浏览器和Node.js环境。

## 目录

1. [特性](#特性)
2. [安装](#安装)
3. [快速开始](#快速开始)
4. [浏览器环境使用指南](#浏览器环境使用指南)
5. [Node.js环境使用指南](#nodejs环境使用指南)
6. [高级用法](#高级用法)
7. [API参考](#api参考)
8. [最佳实践](#最佳实践)
9. [常见问题](#常见问题)
10. [版本兼容性与功能支持](#版本兼容性与功能支持)

## 特性

- 统一的API接口管理不同存储类型（localStorage, sessionStorage, cookie, 内存存储）
- 支持数据过期时间控制
- 支持简单的数据加密
- 支持命名空间隔离
- 完全类型化的API（TypeScript）
- 异步API设计，支持未来扩展
- 跨平台支持（浏览器和Node.js）
- 简化API，更易于使用

## 安装

```bash
# 使用npm
npm install @ort-fe/storage-cache-kit

# 使用yarn
yarn add @ort-fe/storage-cache-kit

# 使用pnpm
pnpm add @ort-fe/storage-cache-kit
```

## 快速开始

### 浏览器环境

浏览器环境默认情况下使用localStorage进行存储。如果需要使用sessionStorage，cookie, memoey请往下看。
```typescript
// 导入store对象 (推荐)
import { store } from '@ort-fe/storage-cache-kit';

// 存储数据
await store.put('user', { id: 1, name: 'John' });

// 获取数据
const user = await store.get('user');
console.log(user); // { id: 1, name: 'John' }

// 删除数据
await store.del('user');
```

### Node.js环境

Node.js环境支持两种模块导入方式：CommonJS (require) 和 ES Modules (import)。

#### CommonJS 方式 (require)

```javascript
// 使用 CommonJS 导入方式
const { store } = require('@ort-fe/storage-cache-kit');

// 在Node.js中，自动使用内存存储
store.put('config', { port: 3000, debug: true })
  .then(() => store.get('config'))
  .then(config => {
    console.log(config); // { port: 3000, debug: true }
  });

// 使用 async/await (在异步函数内)
async function example() {
  await store.put('config', { port: 3000, debug: true });
  const config = await store.get('config');
  console.log(config); // { port: 3000, debug: true }
}

example();
```

#### ES Modules 方式 (import)

```javascript
// 使用 ES Modules 导入方式
// 在 package.json 中设置 "type": "module" 或使用 .mjs 扩展名
import { store } from '@ort-fe/storage-cache-kit';

// 使用 async/await
async function example() {
  await store.put('config', { port: 3000, debug: true });
  const config = await store.get('config');
  console.log(config); // { port: 3000, debug: true }
}

example();
```

### 完整API (适用于两种环境)

```typescript
// 导入StorageManager实例
import storageManager from '@ort-fe/storage-cache-kit';

// 存储数据
await storageManager.set('user', { id: 1, name: 'John' });

// 获取数据
const user = await storageManager.get('user');

// 删除数据
await storageManager.remove('user');
```

## 浏览器环境使用指南

在浏览器环境中，Storage Cache Kit支持多种存储方式，包括localStorage、sessionStorage、cookie和内存存储。

### 默认存储（localStorage）

默认情况下，Storage Cache Kit使用localStorage作为存储方式：

```typescript
import { store } from '@ort-fe/storage-cache-kit';

// 使用localStorage存储
await store.put('preferences', { theme: 'dark', fontSize: 16 });
const preferences = await store.get('preferences');
```

### 使用不同存储适配器

```typescript
import { store, ADAPTER_TYPES } from '@ort-fe/storage-cache-kit';

// 使用sessionStorage（会话存储，浏览器关闭后数据消失）
await store.put('temporaryData', { id: 123 }, { 
  adapter: ADAPTER_TYPES.SESSION_STORAGE 
});

// 使用cookie存储（可跨页面请求传递）
await store.put('authToken', 'xyz123', { 
  adapter: ADAPTER_TYPES.COOKIE,
  expires: 7 * 24 * 60 * 60 * 1000 // 7天过期
});

// 使用内存存储（页面刷新后数据消失）
await store.put('pageState', { scrollPosition: 350 }, { 
  adapter: ADAPTER_TYPES.MEMORY 
});
```

### 使用字符串映射适配器

从 v1.1.0 版本开始，你可以直接使用字符串来指定适配器类型，而不必导入 `ADAPTER_TYPES` 常量：

```typescript
import { store } from '@ort-fe/storage-cache-kit';

// 使用字符串指定适配器类型
await store.put('sessionData', { user: 'John' }, { adapter: 'sessionStorage' });
await store.put('cookieData', { token: 'xyz' }, { adapter: 'cookie' });
await store.put('memoryData', { temp: true }, { adapter: 'memory' });

// 大小写不敏感
await store.put('data', { value: 123 }, { adapter: 'LOCAL' }); // 使用localStorage
```

支持的字符串映射包括：

| 字符串名称         | 对应适配器                      |
| ------------------ | ------------------------------- |
| `'localStorage'`   | `ADAPTER_TYPES.LOCAL_STORAGE`   |
| `'sessionStorage'` | `ADAPTER_TYPES.SESSION_STORAGE` |
| `'cookie'`         | `ADAPTER_TYPES.COOKIE`          |
| `'memory'`         | `ADAPTER_TYPES.MEMORY`          |

### 设置数据过期时间

```typescript
import { store } from '@ort-fe/storage-cache-kit';

// 设置1小时后过期
await store.put('sessionToken', 'abc123', { 
  expires: 60 * 60 * 1000 // 毫秒
});

// 设置10分钟后过期
await store.put('verificationCode', '123456', { 
  expires: 10 * 60 * 1000
});
```

### Cookie存储高级配置

当使用Cookie存储时，可以通过创建自定义实例来设置更多Cookie相关选项：

```typescript
import { SimpleStore, ADAPTER_TYPES } from '@ort-fe/storage-cache-kit';

const cookieStore = new SimpleStore({
  defaultAdapter: ADAPTER_TYPES.COOKIE,
  defaultExpires: 30 * 24 * 60 * 60 * 1000, // 30天默认过期时间
});

// 使用自定义Cookie存储适配器
import { CookieStorageAdapter, StorageManager } from '@ort-fe/storage-cache-kit';

const cookieAdapter = new CookieStorageAdapter({
  path: '/app',
  domain: 'example.com',
  secure: true,
  sameSite: 'strict',
  defaultDays: 14 // 14天默认过期
});

const manager = new StorageManager();
manager.registerAdapter('secureCookie', cookieAdapter);

await manager.set('sensitiveData', { userId: 12345 }, { adapter: 'secureCookie' });
```

## Node.js环境使用指南

在Node.js环境中，Storage Cache Kit会自动检测环境并默认使用内存存储适配器。

### 基本用法

#### CommonJS 方式

```javascript
// 使用 CommonJS 导入
const { store } = require('@ort-fe/storage-cache-kit');

// 在Node.js中，自动使用内存存储
store.put('serverConfig', { port: 3000, debug: true })
  .then(() => {
    return store.get('serverConfig');
  })
  .then(config => {
    console.log(config); // { port: 3000, debug: true }
  });

// 或者在异步函数中使用
async function example() {
  await store.put('serverConfig', { port: 3000, debug: true });
  const config = await store.get('serverConfig');
  console.log(config); // { port: 3000, debug: true }
}
```

#### ES Modules 方式

```javascript
// 使用 ES Modules 导入 (需要在 package.json 中设置 "type": "module")
import { store } from '@ort-fe/storage-cache-kit';

// 在Node.js中，自动使用内存存储
await store.put('serverConfig', { port: 3000, debug: true });
const config = await store.get('serverConfig');
console.log(config); // { port: 3000, debug: true }
```

### 内存存储的局限性

需要注意，在Node.js环境中使用内存存储有以下局限性：

1. **非持久化**：服务器重启后，所有数据都会丢失
2. **进程隔离**：不同的Node.js进程无法共享存储数据
3. **内存占用**：大量数据可能导致内存占用过高

### 适用场景

Node.js环境中的内存存储适合以下场景：

1. **请求级缓存**：在单个请求处理过程中缓存数据
2. **短期会话数据**：存储短期有效的会话信息
3. **开发和测试**：在开发和测试环境中模拟存储行为

### 持久化存储建议

如果需要在Node.js环境中进行持久化存储，建议：

1. 使用数据库（MongoDB、Redis、MySQL等）
2. 使用文件系统存储
3. 使用专门的缓存服务

## 高级用法

### 命名空间

使用命名空间可以隔离不同模块或功能的存储数据：

```typescript
import { SimpleStore } from '@ort-fe/storage-cache-kit';

const userStore = new SimpleStore({ namespace: 'user' });
const settingsStore = new SimpleStore({ namespace: 'settings' });

// 这两个操作使用相同的键，但存储在不同的命名空间
await userStore.put('profile', { name: 'John' });
await settingsStore.put('profile', { darkMode: true });

// 获取各自命名空间的数据
const userProfile = await userStore.get('profile'); // { name: 'John' }
const settingsProfile = await settingsStore.get('profile'); // { darkMode: true }
```

### 数据加密

启用加密功能可以保护敏感数据：

```typescript
import { SimpleStore } from '@ort-fe/storage-cache-kit';

const secureStore = new SimpleStore({
  defaultEncrypt: true // 启用加密
});

await secureStore.put('creditCard', { number: '1234-5678-9012-3456', cvv: '123' });
// 数据将以加密形式存储
```

### 批量操作

```typescript
import { store } from '@ort-fe/storage-cache-kit';

// 批量存储
const data = {
  user: { id: 1, name: 'John' },
  settings: { theme: 'dark' },
  token: 'abc123'
};

// 使用Promise.all进行批量操作
await Promise.all(
  Object.entries(data).map(([key, value]) => store.put(key, value))
);

// 批量获取
const keys = ['user', 'settings', 'token'];
const values = await Promise.all(keys.map(key => store.get(key)));

// 批量删除
await Promise.all(keys.map(key => store.del(key)));
```

### 自定义适配器

你可以创建并注册自己的存储适配器：

```typescript
import { StorageAdapter, StorageItem, StorageManager } from '@ort-fe/storage-cache-kit';

// 创建自定义适配器
class MyCustomAdapter implements StorageAdapter {
  private storage = new Map<string, string>();
  
  async setItem<T>(key: string, item: StorageItem<T>): Promise<void> {
    this.storage.set(key, JSON.stringify(item));
  }
  
  async getItem<T>(key: string): Promise<StorageItem<T> | undefined> {
    const data = this.storage.get(key);
    return data ? JSON.parse(data) as StorageItem<T> : undefined;
  }
  
  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }
  
  async clear(): Promise<void> {
    this.storage.clear();
  }
  
  async keys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }
}

// 注册自定义适配器
const manager = new StorageManager();
manager.registerAdapter('custom', new MyCustomAdapter());

// 使用自定义适配器
await manager.set('key', 'value', { adapter: 'custom' });
```

## API参考

### 简化API (SimpleStore)

- `put<T>(key: string, value: T, options?): Promise<void>` - 设置存储项
- `get<T>(key: string, options?): Promise<T | undefined>` - 获取存储项
- `del(key: string, options?): Promise<void>` - 删除存储项
- `has(key: string, options?): Promise<boolean>` - 检查键是否存在
- `keys(options?): Promise<string[]>` - 获取所有键名
- `clear(options?): Promise<void>` - 清空存储

### 完整API (StorageManager)

- `set<T>(key: string, value: T, options?): Promise<void>` - 设置存储项
- `get<T>(key: string, options?): Promise<T | undefined>` - 获取存储项
- `remove(key: string, options?): Promise<void>` - 移除存储项
- `clear(options?): Promise<void>` - 清空存储
- `keys(options?): Promise<string[]>` - 获取所有键名
- `has(key: string, options?): Promise<boolean>` - 检查键是否存在
- `registerAdapter(name: string, adapter: StorageAdapter): void` - 注册自定义适配器

### 存储适配器类型

- `ADAPTER_TYPES.LOCAL_STORAGE` - localStorage适配器
- `ADAPTER_TYPES.SESSION_STORAGE` - sessionStorage适配器
- `ADAPTER_TYPES.COOKIE` - Cookie适配器
- `ADAPTER_TYPES.MEMORY` - 内存存储适配器

### 配置选项

```typescript
interface StorageManagerOptions {
  // 默认存储适配器类型
  defaultAdapter?: AdapterType;
  
  // 默认过期时间（毫秒）
  defaultExpires?: number;
  
  // 是否默认加密数据
  defaultEncrypt?: boolean;
  
  // 命名空间前缀
  namespace?: string;
}
```

## 最佳实践

### 1. 使用await处理异步操作

虽然所有操作都返回Promise，但强烈建议使用await等待操作完成：

```typescript
// 推荐
async function saveUserData() {
  await store.put('user', userData);
  console.log('用户数据已保存');
}

// 不推荐
function saveUserData() {
  store.put('user', userData);
  console.log('这条消息可能在数据实际保存前就显示了');
}
```

### 2. 适当设置过期时间

为敏感数据或临时数据设置合理的过期时间：

```typescript
// 身份验证令牌 - 1小时过期
await store.put('authToken', token, { expires: 60 * 60 * 1000 });

// 用户偏好设置 - 长期存储（不设置过期时间）
await store.put('userPreferences', preferences);
```

### 3. 选择合适的存储类型

- **localStorage**: 持久性数据，如用户偏好
- **sessionStorage**: 会话级数据，如表单状态
- **cookie**: 需要随HTTP请求发送的数据，如认证令牌
- **memory**: 临时数据，如页面状态

### 4. 使用命名空间隔离数据

```typescript
const authStore = new SimpleStore({ namespace: 'auth' });
const uiStore = new SimpleStore({ namespace: 'ui' });
```

### 5. 错误处理

```typescript
try {
  await store.put('complexData', largeObject);
  await store.put('sensitiveData', sensitiveInfo, { encrypt: true });
} catch (error) {
  console.error('存储操作失败:', error);
  // 实现备用存储策略或通知用户
}
```
## 许可证

MIT 