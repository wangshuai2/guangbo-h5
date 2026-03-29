# 测试配置说明

## 测试账户信息

| 信息 | 值 |
|------|-----|
| 用户 ID | 1 |
| 手机号 | 13800138000 |
| 密码 | test123456 |
| 昵称 | 测试用户 |
| 头像 | https://picsum.photos/100/100 |

## JWT Token

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzc0Nzg5NDU3LCJleHAiOjE3NzUzOTQyNTd9.3gXUc_Pa-OVWDI-gXVqTOHHxft2F3VTUNe2AxDjiX8o
```

**Token 有效期：** 7 天

## 使用方法

### 方式一：自动注入（开发环境）

在开发环境启动时，会自动检查 localStorage 中是否有 token，如果没有则自动注入测试 token。

```typescript
// 已在 main.ts 中配置
if (import.meta.env.DEV) {
  import('@/config/test').then(({ initTestToken }) => {
    initTestToken()
  })
}
```

### 方式二：手动设置

在浏览器 Console 中执行：

```javascript
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzc0Nzg5NDU3LCJleHAiOjE3NzUzOTQyNTd9.3gXUc_Pa-OVWDI-gXVqTOHHxft2F3VTUNe2AxDjiX8o');
```

### 方式三：在代码中直接使用

```typescript
import { TEST_TOKEN, TEST_ACCOUNT } from '@/config/test'

// 在请求中使用
headers: {
  Authorization: `Bearer ${TEST_TOKEN}`
}
```

## API 请求示例

```typescript
// 使用 axios
axios.get('https://dev-api.museumapp.cn/api/v1/collections/groups', {
  headers: {
    Authorization: `Bearer ${TEST_TOKEN}`
  }
})

// 使用封装的 request（自动注入 token）
import { request } from '@/utils/request'
request.get('/collections/groups')
```

## 注意事项

1. **仅在开发环境使用** - 生产环境请使用真实的登录流程
2. **Token 自动刷新** - 如需延长有效期，请联系后端开发
3. **清除 Token** - 使用 `clearTestToken()` 函数清除

```typescript
import { clearTestToken } from '@/config/test'
clearTestToken()
```

## 测试接口列表

所有 H5 端接口均可使用此 Token：

- `/api/v1/collections/groups` - 收藏分组管理
- `/api/v1/collections` - 收藏列表
- `/api/v1/users/me` - 用户信息
- `/api/v1/museums` - 博物馆列表
- `/api/v1/checkins` - 打卡记录
- `/api/v1/medals` - 勋章列表
- 等所有需要认证的接口...