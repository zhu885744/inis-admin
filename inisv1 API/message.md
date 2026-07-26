# Message API 文档

## 接口概述

Message 控制器负责用户消息通知管理，支持系统消息推送、评论通知、点赞通知等核心通知类型。提供消息状态管理（已读/未读）、自动清理机制（超过30天已读消息自动清理）以及完整的消息查询与管理接口。

### 接口类型说明

| 接口类型 | 说明 |
| :--- | :--- |
| **基础接口** | 支持15个基础接口：one、all、count、column、sum、min、max、rand、remove、delete、clear、restore、save、create、update |
| **业务接口** | 特殊业务接口：unread、read、send-to-all、clean |

### 消息类型

| 类型 | 值 | 说明 |
| :--- | :--- | :--- |
| **系统消息** | `system` | 系统推送的通知消息 |
| **评论通知** | `comment` | 用户收到的评论通知 |
| **点赞通知** | `like` | 用户收到的点赞通知 |

### 消息状态

| 状态 | 值 | 说明 |
| :--- | :--- | :--- |
| **未读** | `0` | 消息未被阅读 |
| **已读** | `1` | 消息已被阅读 |

---

## 状态码规范

| 状态码 | 使用场景 | 开发注意事项 |
|--------|----------|--------------|
| 200 | 接口调用成功且数据返回正常 | 所有正常响应必须返回200，data为有效业务数据 |
| 202 | 业务逻辑处理完成但有特殊状态 | 如操作失败、参数错误等 |
| 204 | 接口调用成功但无数据返回 | 空数据场景必须返回204 |
| 400 | 请求参数错误或业务校验失败 | 参数校验失败、必填字段缺失 |
| 401 | 未登录或登录态失效 | 用户未登录时返回 |
| 403 | 无权限访问 | 非root用户访问受限接口时返回 |
| 405 | 请求方法不允许 | 调用了未定义的method |
| 500 | 服务器异常 | 生产环境屏蔽具体错误 |

---

## 接口列表

### 1. GET 请求接口

#### 1.1 获取指定消息 [基础接口-获取指定]

- **路径**: `/api/message/one`
- **方法**: `GET`
- **描述**: 根据ID获取单条消息（支持普通消息和广播消息）
- **权限**: 登录用户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | int | **是** | 消息ID |
| `field` | string | 否 | 返回字段，逗号分隔 |
| `onlyTrashed` | bool | 否 | 是否只查询已删除 |
| `withTrashed` | bool | 否 | 是否包含已删除 |

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "数据请求成功！",
  "data": {
    "id": 1,
    "uid": 1,
    "type": "system",
    "title": "系统通知",
    "content": "欢迎使用系统！",
    "status": 0,
    "bind_type": "default",
    "bind_id": 0,
    "create_time": 1784904168,
    "update_time": 1784904168
  }
}
```

**前端使用示例**:
```javascript
// 使用 fetch
const response = await fetch('/api/message/one?id=1');
const result = await response.json();

// 使用 axios
const result = await axios.get('/api/message/one', {
  params: { id: 1 }
});

// 返回数据
console.log(result.data); // { id: 1, title: '系统通知', status: 0, ... }
```

#### 1.2 获取消息列表 [基础接口-获取全部]

- **路径**: `/api/message/all`
- **方法**: `GET`
- **描述**: 获取当前用户消息列表（包含个人消息和广播消息，支持分页、筛选）
- **权限**: 登录用户

**请求参数**:

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `page` | int | 否 | 1 | 页码 |
| `limit` | int | 否 | 10 | 每页数量 |
| `field` | string | 否 | - | 字段过滤 |
| `where` | string | 否 | - | 条件查询（JSON字符串） |
| `order` | string | 否 | create_time desc | 排序 |
| `onlyTrashed` | bool | 否 | false | 是否只查询已删除 |
| `withTrashed` | bool | 否 | false | 是否包含已删除 |

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "数据请求成功！",
  "data": {
    "data": [
      {
        "id": 1,
        "uid": 0,
        "type": "system",
        "title": "系统通知",
        "content": "欢迎使用系统！",
        "status": 0,
        "create_time": 1784904168
      },
      {
        "id": 2,
        "uid": 1,
        "type": "comment",
        "title": "评论通知",
        "content": "您的文章收到了新评论",
        "status": 1,
        "create_time": 1784904168
      }
    ],
    "count": 2,
    "page": 1
  }
}
```

**字段说明**:
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | int | 消息ID |
| `uid` | int | 用户ID（0表示广播消息，所有用户可见） |
| `type` | string | 消息类型（system/comment/like） |
| `title` | string | 消息标题 |
| `content` | string | 消息内容 |
| `status` | int | 已读状态（0未读，1已读） |
| `bind_type` | string | 绑定类型（如：article、comment） |
| `bind_id` | int | 绑定ID（关联的文章ID、评论ID等） |
| `create_time` | int64 | 创建时间戳 |
| `update_time` | int64 | 更新时间戳 |

**前端使用示例**:
```javascript
// 获取消息列表（第一页，每页10条）
const result = await axios.get('/api/message/all', {
  params: {
    page: 1,
    limit: 10
  }
});

// 获取指定类型的消息
const result = await axios.get('/api/message/all', {
  params: {
    page: 1,
    limit: 10,
    where: JSON.stringify({ type: 'system' })
  }
});

// 获取未读消息
const result = await axios.get('/api/message/all', {
  params: {
    page: 1,
    limit: 10,
    where: JSON.stringify({ status: 0 })
  }
});

// 渲染消息列表
const messages = result.data.data;
messages.forEach(msg => {
  console.log(`${msg.title} - ${msg.status === 0 ? '未读' : '已读'}`);
});
```

#### 1.3 查询消息数量 [基础接口-查询数量]

- **路径**: `/api/message/count`
- **方法**: `GET`
- **描述**: 查询消息数量
- **权限**: 登录用户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `where` | string | 否 | 条件查询 |
| `onlyTrashed` | bool | 否 | 是否只查询已删除 |
| `withTrashed` | bool | 否 | 是否包含已删除 |

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "查询成功！",
  "data": {
    "count": 10
  }
}
```

**前端使用示例**:
```javascript
// 查询消息总数
const result = await axios.get('/api/message/count');
console.log(`消息总数: ${result.data.count}`);

// 查询未读消息数量
const result = await axios.get('/api/message/count', {
  params: {
    where: JSON.stringify({ status: 0 })
  }
});
```

#### 1.4 查询列 [基础接口-列查询]

- **路径**: `/api/message/column`
- **方法**: `GET`
- **描述**: 查询指定列的数据
- **权限**: 登录用户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `column` | string | **是** | 列名 |
| `where` | string | 否 | 条件查询 |

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "查询成功！",
  "data": [1, 2, 3]
}
```

#### 1.5 随机获取 [基础接口-随机获取]

- **路径**: `/api/message/rand`
- **方法**: `GET`
- **描述**: 随机获取消息
- **权限**: 登录用户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `limit` | int | 否 | 返回数量限制 |
| `except` | string | 否 | 排除ID列表 |

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "好的！",
  "data": [
    {
      "id": 5,
      "title": "消息标题"
    }
  ]
}
```

#### 1.6 求和 [基础接口-求和]

- **路径**: `/api/message/sum`
- **方法**: `GET`
- **描述**: 指定字段求和
- **权限**: 登录用户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `sum_field` | string | **是** | 要求和的字段 |

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "查询成功！",
  "data": {
    "sum": 100
  }
}
```

#### 1.7 最小值 [基础接口-最小值]

- **路径**: `/api/message/min`
- **方法**: `GET`
- **描述**: 指定字段求最小值
- **权限**: 登录用户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `min_field` | string | **是** | 要求最小值的字段 |

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "查询成功！",
  "data": {
    "min": 1
  }
}
```

#### 1.8 最大值 [基础接口-最大值]

- **路径**: `/api/message/max`
- **方法**: `GET`
- **描述**: 指定字段求最大值
- **权限**: 登录用户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `max_field` | string | **是** | 要求最大值的字段 |

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "查询成功！",
  "data": {
    "max": 100
  }
}
```

#### 1.9 获取未读消息数量 [业务接口]

- **路径**: `/api/message/unread`
- **方法**: `GET`
- **描述**: 获取当前用户未读消息数量（包含个人消息和广播消息）
- **权限**: 登录用户

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "",
  "data": {
    "count": 5
  }
}
```

**前端使用示例**:
```javascript
// 获取未读消息数量（用于消息角标）
async function getUnreadCount() {
  const response = await axios.get('/api/message/unread');
  const count = response.data.count;
  
  // 更新页面角标
  const badge = document.querySelector('.message-badge');
  if (badge) {
    badge.textContent = count > 0 ? count : '';
    badge.style.display = count > 0 ? 'block' : 'none';
  }
  
  return count;
}

// 页面加载时调用
getUnreadCount();

// 每隔30秒轮询一次（可选）
setInterval(getUnreadCount, 30000);
```

---

### 2. POST 请求接口

#### 2.1 保存消息 [基础接口-保存数据]

- **路径**: `/api/message/save`
- **方法**: `POST`
- **描述**: 保存消息（有ID则更新，无ID则新增）
- **权限**: 登录用户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | int | 否 | 消息ID（更新时必填） |
| `type` | string | 否 | 消息类型（system/comment/like） |
| `title` | string | **是** | 消息标题 |
| `content` | string | **是** | 消息内容 |
| `bind_type` | string | 否 | 绑定类型 |
| `bind_id` | int | 否 | 绑定ID |

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "创建成功！",
  "data": {
    "id": 1
  }
}
```

#### 2.2 创建消息 [基础接口-添加数据]

- **路径**: `/api/message/create`
- **方法**: `POST`
- **描述**: 创建新消息（发送给指定用户）
- **权限**: 登录用户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `uid` | int | 否 | 接收用户ID（不传则发送给当前用户） |
| `type` | string | 否 | 消息类型（system/comment/like） |
| `title` | string | **是** | 消息标题 |
| `content` | string | **是** | 消息内容 |
| `bind_type` | string | 否 | 绑定类型（如：article、comment） |
| `bind_id` | int | 否 | 绑定ID（关联的文章ID、评论ID等） |

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "创建成功！",
  "data": {
    "id": 1
  }
}
```

**前端使用示例**:
```javascript
// 创建评论通知
const result = await axios.post('/api/message/create', {
  uid: 1,
  type: 'comment',
  title: '评论通知',
  content: '用户张三评论了您的文章',
  bind_type: 'article',
  bind_id: 100
});

// 创建点赞通知
const result = await axios.post('/api/message/create', {
  uid: 1,
  type: 'like',
  title: '点赞通知',
  content: '用户李四点赞了您的动态',
  bind_type: 'moments',
  bind_id: 200
});
```

#### 2.3 标记消息已读 [业务接口]

- **路径**: `/api/message/read`
- **方法**: `POST`
- **描述**: 标记消息为已读（支持单条消息和全部消息）
- **权限**: 登录用户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | int | 否 | 消息ID（不传则标记所有未读消息） |

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "已标记为已读！",
  "data": null
}
```

**前端使用示例**:
```javascript
// 标记单条消息已读
async function markAsRead(messageId) {
  const result = await axios.post('/api/message/read', {
    id: messageId
  });
  
  if (result.code === 200) {
    // 更新本地状态
    console.log('标记已读成功');
  }
}

// 标记所有消息已读
async function markAllAsRead() {
  const result = await axios.post('/api/message/read', {});
  
  if (result.code === 200) {
    // 更新本地状态
    console.log('所有消息已标记为已读');
    // 刷新未读数量
    getUnreadCount();
  }
}

// 点击消息时标记已读
document.querySelectorAll('.message-item').forEach(item => {
  item.addEventListener('click', async () => {
    const id = parseInt(item.dataset.id);
    await markAsRead(id);
    item.classList.add('read');
  });
});

// 点击"全部已读"按钮
document.querySelector('.mark-all-read').addEventListener('click', markAllAsRead);
```

#### 2.4 群发系统消息 [业务接口]

- **路径**: `/api/message/send-to-all`
- **方法**: `POST`
- **描述**: 发送系统消息给所有用户（广播消息）
- **权限**: 管理员（root）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `title` | string | **是** | 消息标题 |
| `content` | string | **是** | 消息内容 |

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "发送成功！",
  "data": null
}
```

**前端使用示例（管理员后台）**:
```javascript
// 群发系统消息
async function sendToAll(title, content) {
  const result = await axios.post('/api/message/send-to-all', {
    title,
    content
  });
  
  if (result.code === 200) {
    console.log('群发消息发送成功');
  }
}

// 示例：发送系统维护通知
sendToAll(
  '系统维护通知',
  '系统将于今晚22:00进行例行维护，预计持续2小时，期间服务将暂停，请提前做好准备。'
);
```

---

### 3. PUT 请求接口

#### 3.1 更新消息 [基础接口-更新数据]

- **路径**: `/api/message/update`
- **方法**: `PUT`
- **描述**: 更新消息（仅能更新自己的消息，管理员可更新所有消息）
- **权限**: 登录用户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | int | **是** | 消息ID |
| `type` | string | 否 | 消息类型 |
| `title` | string | 否 | 消息标题 |
| `content` | string | 否 | 消息内容 |
| `bind_type` | string | 否 | 绑定类型 |
| `bind_id` | int | 否 | 绑定ID |

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "更新成功！",
  "data": {
    "id": 1
  }
}
```

#### 3.2 恢复消息 [基础接口-恢复数据]

- **路径**: `/api/message/restore`
- **方法**: `PUT`
- **描述**: 恢复已删除的消息
- **权限**: 登录用户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `ids` | string/array | **是** | 消息ID列表 |

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "恢复成功！",
  "data": null
}
```

**前端使用示例**:
```javascript
// 恢复单条消息
await axios.put('/api/message/restore', {
  ids: [1]
});

// 恢复多条消息
await axios.put('/api/message/restore', {
  ids: [1, 2, 3]
});
```

---

### 4. DELETE 请求接口

#### 4.1 软删除 [基础接口-软删除]

- **路径**: `/api/message/remove`
- **方法**: `DELETE`
- **描述**: 软删除消息（移至回收站，可恢复）
- **权限**: 登录用户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `ids` | string/array | **是** | 消息ID列表 |

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "删除成功！",
  "data": null
}
```

**前端使用示例**:
```javascript
// 删除单条消息
async function deleteMessage(id) {
  const result = await axios.delete('/api/message/remove', {
    data: { ids: [id] }
  });
  
  if (result.code === 200) {
    // 从列表中移除
    document.querySelector(`[data-id="${id}"]`).remove();
  }
}

// 批量删除消息
async function batchDelete(ids) {
  const result = await axios.delete('/api/message/remove', {
    data: { ids }
  });
  
  if (result.code === 200) {
    // 更新列表
    loadMessages();
  }
}
```

#### 4.2 彻底删除 [基础接口-彻底删除]

- **路径**: `/api/message/delete`
- **方法**: `DELETE`
- **描述**: 彻底删除消息（不可恢复）
- **权限**: 登录用户

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `ids` | string/array | **是** | 消息ID列表 |

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "彻底删除成功！",
  "data": null
}
```

**前端使用示例**:
```javascript
// 彻底删除消息（从回收站）
async function permanentDelete(ids) {
  const result = await axios.delete('/api/message/delete', {
    data: { ids }
  });
  
  if (result.code === 200) {
    console.log('彻底删除成功');
  }
}
```

#### 4.3 清空回收站 [基础接口-清空回收站]

- **路径**: `/api/message/clear`
- **方法**: `DELETE`
- **描述**: 清空所有已删除的消息（不可恢复）
- **权限**: 管理员（root）

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "清空成功！",
  "data": null
}
```

**前端使用示例（管理员后台）**:
```javascript
// 清空回收站
async function clearTrash() {
  if (confirm('确定要清空回收站吗？此操作不可恢复！')) {
    const result = await axios.delete('/api/message/clear');
    
    if (result.code === 200) {
      console.log('回收站已清空');
    }
  }
}
```

#### 4.4 清理过期消息 [业务接口]

- **路径**: `/api/message/clean`
- **方法**: `DELETE`
- **描述**: 清理超过30天且已读的消息
- **权限**: 管理员（root）

**成功响应** (200):
```json
{
  "code": 200,
  "msg": "清理完成！",
  "data": null
}
```

**前端使用示例（管理员后台）**:
```javascript
// 手动清理过期消息
async function cleanExpired() {
  const result = await axios.delete('/api/message/clean');
  
  if (result.code === 200) {
    console.log('过期消息清理完成');
  }
}
```

---

## 前端完整使用示例

### 消息中心组件示例（Vue.js）

```vue
<template>
  <div class="message-center">
    <!-- 顶部 -->
    <div class="header">
      <h2>消息中心</h2>
      <button @click="markAllAsRead" class="mark-all-btn">全部已读</button>
    </div>
    
    <!-- 未读角标 -->
    <div v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</div>
    
    <!-- 消息列表 -->
    <div class="message-list">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['message-item', { read: msg.status === 1 }]"
        @click="handleMessageClick(msg)"
      >
        <div class="message-icon" :class="msg.type">
          <span v-if="msg.type === 'system'">📢</span>
          <span v-else-if="msg.type === 'comment'">💬</span>
          <span v-else-if="msg.type === 'like'">❤️</span>
        </div>
        <div class="message-content">
          <h3 class="message-title">{{ msg.title }}</h3>
          <p class="message-text">{{ msg.content }}</p>
          <span class="message-time">{{ formatTime(msg.create_time) }}</span>
        </div>
        <div v-if="msg.status === 0" class="unread-dot"></div>
      </div>
      
      <div v-if="messages.length === 0" class="empty-state">
        <p>暂无消息</p>
      </div>
    </div>
    
    <!-- 分页 -->
    <div v-if="total > limit" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage >= totalPages">下一页</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'MessageCenter',
  data() {
    return {
      messages: [],
      unreadCount: 0,
      currentPage: 1,
      limit: 10,
      total: 0
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.limit);
    }
  },
  mounted() {
    this.loadMessages();
    this.loadUnreadCount();
  },
  methods: {
    // 加载消息列表
    async loadMessages() {
      try {
        const response = await axios.get('/api/message/all', {
          params: {
            page: this.currentPage,
            limit: this.limit
          }
        });
        
        if (response.data.code === 200) {
          this.messages = response.data.data.data;
          this.total = response.data.data.count;
        }
      } catch (error) {
        console.error('加载消息失败:', error);
      }
    },
    
    // 加载未读数量
    async loadUnreadCount() {
      try {
        const response = await axios.get('/api/message/unread');
        
        if (response.data.code === 200) {
          this.unreadCount = response.data.data.count;
        }
      } catch (error) {
        console.error('加载未读数量失败:', error);
      }
    },
    
    // 点击消息
    async handleMessageClick(msg) {
      // 如果未读，标记为已读
      if (msg.status === 0) {
        await this.markAsRead(msg.id);
      }
      
      // 处理点击逻辑（如跳转到对应页面）
      if (msg.bind_type === 'article') {
        window.location.href = `/article/${msg.bind_id}`;
      }
    },
    
    // 标记单条消息已读
    async markAsRead(id) {
      try {
        await axios.post('/api/message/read', { id });
        
        // 更新本地状态
        const msg = this.messages.find(m => m.id === id);
        if (msg) {
          msg.status = 1;
        }
        
        // 更新未读数量
        this.loadUnreadCount();
      } catch (error) {
        console.error('标记已读失败:', error);
      }
    },
    
    // 标记所有消息已读
    async markAllAsRead() {
      try {
        await axios.post('/api/message/read', {});
        
        // 更新本地状态
        this.messages.forEach(msg => {
          msg.status = 1;
        });
        
        // 更新未读数量
        this.loadUnreadCount();
      } catch (error) {
        console.error('标记全部已读失败:', error);
      }
    },
    
    // 删除消息
    async deleteMessage(id) {
      try {
        await axios.delete('/api/message/remove', {
          data: { ids: [id] }
        });
        
        // 更新列表
        this.loadMessages();
        this.loadUnreadCount();
      } catch (error) {
        console.error('删除消息失败:', error);
      }
    },
    
    // 分页
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadMessages();
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.loadMessages();
      }
    },
    
    // 格式化时间
    formatTime(timestamp) {
      const date = new Date(timestamp * 1000);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      // 小于1分钟
      if (diff < 60000) {
        return '刚刚';
      }
      
      // 小于1小时
      if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`;
      }
      
      // 小于24小时
      if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`;
      }
      
      // 小于7天
      if (diff < 604800000) {
        return `${Math.floor(diff / 86400000)}天前`;
      }
      
      // 其他情况
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  }
};
</script>

<style scoped>
.message-center {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.mark-all-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.message-list {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.message-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.message-item:hover {
  background: #f8f9fa;
}

.message-item.read {
  opacity: 0.7;
}

.message-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 12px;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
}

.message-text {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #ff4d4f;
  border-radius: 50%;
  margin-top: 8px;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #999;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 16px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

### 管理员消息管理示例（React）

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminMessage() {
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // 加载消息列表（管理员可查看所有消息）
  useEffect(() => {
    loadMessages();
  }, [page]);
  
  async function loadMessages() {
    const response = await axios.get('/api/message/all', {
      params: { page, limit, withTrashed: true }
    });
    
    if (response.data.code === 200) {
      setMessages(response.data.data.data);
      setTotal(response.data.data.count);
    }
  }
  
  // 群发消息
  async function handleSendToAll() {
    const title = prompt('请输入消息标题');
    const content = prompt('请输入消息内容');
    
    if (title && content) {
      const response = await axios.post('/api/message/send-to-all', {
        title,
        content
      });
      
      if (response.data.code === 200) {
        alert('群发成功！');
        loadMessages();
      }
    }
  }
  
  // 清理过期消息
  async function handleCleanExpired() {
    if (confirm('确定要清理超过30天且已读的消息吗？')) {
      const response = await axios.delete('/api/message/clean');
      
      if (response.data.code === 200) {
        alert('清理完成！');
        loadMessages();
      }
    }
  }
  
  return (
    <div className="admin-message">
      <h2>消息管理</h2>
      
      <div className="actions">
        <button onClick={handleSendToAll}>群发系统消息</button>
        <button onClick={handleCleanExpired}>清理过期消息</button>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>类型</th>
            <th>标题</th>
            <th>用户ID</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {messages.map(msg => (
            <tr key={msg.id}>
              <td>{msg.id}</td>
              <td>{msg.type}</td>
              <td>{msg.title}</td>
              <td>{msg.uid === 0 ? '广播消息' : msg.uid}</td>
              <td>{msg.status === 0 ? '未读' : '已读'}</td>
              <td>{new Date(msg.create_time * 1000).toLocaleString()}</td>
              <td>
                {msg.delete_time ? (
                  <button onClick={() => restoreMessage(msg.id)}>恢复</button>
                ) : (
                  <button onClick={() => deleteMessage(msg.id)}>删除</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* 分页 */}
      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))}>上一页</button>
        <span>{page} / {Math.ceil(total / limit)}</span>
        <button onClick={() => setPage(p => Math.min(Math.ceil(total / limit), p + 1))}>下一页</button>
      </div>
    </div>
  );
}
```

---

## 特殊说明

### 1. 消息自动清理机制

系统会在每天凌晨0点自动执行清理任务，清理条件：
- 消息状态为已读（status=1）
- 创建时间超过30天

### 2. 缓存机制

- 查询接口（one/all）支持缓存，缓存标签为 `[GET]message`
- 写操作后自动清除相关缓存
- 缓存配置可在 `config/cache.toml` 中调整

### 3. 权限控制

- 普通用户只能操作自己的消息（uid匹配）
- 管理员（root）可以操作所有消息
- `send-to-all`、`clear`、`clean` 接口仅管理员可调用

### 4. 消息类型使用建议

| 类型 | 使用场景 | 示例 |
| :--- | :--- | :--- |
| `system` | 系统通知 | 系统维护通知、功能更新通知 |
| `comment` | 评论通知 | 您的文章收到了新评论 |
| `like` | 点赞通知 | 您的动态收到了点赞 |

### 5. 数据库索引

系统自动创建以下索引：
- `idx_message_uid` - 用户ID索引
- `idx_message_type` - 类型索引
- `idx_message_create_time` - 创建时间索引
- `idx_message_reads_message_id` - 消息已读记录消息ID索引
- `idx_message_reads_uid` - 消息已读记录用户ID索引

### 6. 广播消息机制

**设计理念**：系统消息采用广播模式，避免为每个用户创建重复记录。

**核心原理**：
- 群发消息（`send-to-all`）只存储一条记录，`uid` 字段为 `0`
- 用户查询消息时，同时获取自己的普通消息和所有广播消息
- 广播消息的已读状态通过 `message_reads` 表独立跟踪，不影响原始消息

**数据模型**：

| 表名 | 作用 | 说明 |
| :--- | :--- | :--- |
| `messages` | 存储消息内容 | `uid=0` 表示广播消息，所有用户可见 |
| `message_reads` | 跟踪已读状态 | 存储 `message_id + uid` 组合，标记广播消息的个人已读状态 |

**查询逻辑**：
```
普通用户消息 = 个人消息(uid=当前用户) + 广播消息(uid=0)
未读数量 = 个人未读消息数 + 广播消息总数 - 已读广播消息数
```

**优势**：
- **存储空间**：N个用户群发一条消息，只需1条记录（原设计需N条）
- **性能优化**：发送消息时无需遍历所有用户，即时完成
- **扩展性**：支持任意数量用户，不受用户量限制

### 7. 最佳实践

| 场景 | 推荐接口 | 说明 |
| :--- | :--- | :--- |
| 消息列表 | `GET /api/message/all` | 分页获取，配合 `page` 和 `limit` |
| 未读角标 | `GET /api/message/unread` | 获取未读数量，支持轮询 |
| 标记已读 | `POST /api/message/read` | 单条或全部标记 |
| 创建通知 | `POST /api/message/create` | 指定用户发送 |
| 群发消息 | `POST /api/message/send-to-all` | 管理员专用 |
| 删除消息 | `DELETE /api/message/remove` | 软删除，可恢复 |

### 8. 错误处理建议

```javascript
// 统一错误处理
axios.interceptors.response.use(
  response => response,
  error => {
    const { code, msg } = error.response?.data || {};
    
    switch (code) {
      case 401:
        // 未登录，跳转到登录页
        window.location.href = '/login';
        break;
      case 403:
        // 无权限
        alert('您没有权限执行此操作');
        break;
      case 400:
        // 参数错误
        alert(msg || '请求参数错误');
        break;
      default:
        alert(msg || '服务器错误');
    }
    
    return Promise.reject(error);
  }
);
```
