# @directories/kv

键值存储包，提供统一的键值存储接口和实现。

## 功能特性

- 统一的键值存储接口
- 多种存储后端支持
- 类型安全的 API
- 缓存管理
- 自动序列化/反序列化

## 安装

```bash
pnpm add @directories/kv
```

## 使用方法

### 基本使用

```typescript
import { createKVStore } from '@directories/kv'

const store = createKVStore({
  driver: 'redis',
  url: process.env.REDIS_URL
})

// 设置值
await store.set('key', 'value')

// 获取值
const value = await store.get('key')

// 删除值
await store.delete('key')
```

### 使用类型

```typescript
import { KVStore } from '@directories/kv'

interface User {
  id: string
  name: string
}

const userStore = createKVStore<User>()

await userStore.set('user:1', {
  id: '1',
  name: '张三'
})
```

### 缓存管理

```typescript
const store = createKVStore({
  ttl: 3600 // 默认过期时间（秒）
})

// 设置带过期时间的值
await store.set('key', 'value', { ttl: 60 })
```

## API 参考

### KVStore

主要存储类，提供以下方法：

#### `set(key: string, value: T, options?: SetOptions): Promise<void>`

存储键值对

- `key`: 键名
- `value`: 值
- `options`: 
  - `ttl`: 过期时间（秒）

#### `get(key: string): Promise<T | null>`

获取值

- `key`: 键名
- 返回: 值或 null（如果不存在）

#### `delete(key: string): Promise<boolean>`

删除键值对

- `key`: 键名
- 返回: 是否成功删除

#### `clear(): Promise<void>`

清空存储

### 配置选项

```typescript
interface KVStoreOptions {
  driver: 'redis' | 'memory'
  url?: string
  ttl?: number
  prefix?: string
}
```

## 驱动实现

### Redis 驱动

使用 Upstash Redis 实现

```typescript
const store = createKVStore({
  driver: 'redis',
  url: process.env.UPSTASH_REDIS_URL
})
```

### 内存驱动

用于开发和测试

```typescript
const store = createKVStore({
  driver: 'memory'
})
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 测试

```bash
# 运行单元测试
pnpm test

# 运行类型检查
pnpm typecheck
```

## 许可证

MIT 