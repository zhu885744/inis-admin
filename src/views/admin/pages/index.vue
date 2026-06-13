<template>
  <div class="admin-dashboard">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="status-item" :class="connected ? 'status-success' : 'status-danger'">
            <el-icon class="status-icon" :size="24">
              <component :is="connected ? 'Connection' : 'CircleClose'" />
            </el-icon>
            <div class="status-content">
              <div class="status-label">连接状态</div>
              <div class="status-value">{{ connected ? '已连接' : '未连接' }}</div>
            </div>
            <el-button v-if="!connected" type="primary" size="small" @click="reconnect">重连</el-button>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="status-item status-info">
            <el-icon class="status-icon" :size="24"><User /></el-icon>
            <div class="status-content">
              <div class="status-label">在线人数</div>
              <div class="status-value">{{ onlineCount }} 人</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="status-item status-primary">
            <el-icon class="status-icon" :size="24"><Timer /></el-icon>
            <div class="status-content">
              <div class="status-label">刷新频率</div>
              <div class="status-value">{{ refreshRate }} 秒</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="status-item" :class="systemHealth">
            <el-icon class="status-icon" :size="24">
              <component :is="systemHealth === 'status-success' ? 'CircleCheck' : 'Warning'" />
            </el-icon>
            <div class="status-content">
              <div class="status-label">系统状态</div>
              <div class="status-value">{{ systemHealthText }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 系统概览 -->
    <div class="section-title">
      <el-icon><InfoFilled /></el-icon>
      <span>系统概览</span>
    </div>

    <el-row :gutter="16" class="mb-4">
      <!-- 系统基本信息 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <el-icon><Cpu /></el-icon>
              <span>基本信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="应用名称">
              <el-tag size="small">{{ systemInfoParsed?.app_name || '-' }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Go 版本">
              {{ systemInfoParsed?.go_version || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="操作系统">
              {{ systemInfoParsed?.os || '-' }} {{ systemInfoParsed?.arch || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="CPU 核心">
              {{ systemInfoParsed?.cpu_count || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="协程数">
              <el-tag size="small" type="info">{{ systemInfoParsed?.goroutines || '-' }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="当前时间">
              {{ systemInfoParsed?.current_time || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 数据库状态 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <el-icon><Connection /></el-icon>
              <span>数据库状态</span>
              <el-tag size="small" :type="databaseStatusParsed?.connected ? 'success' : 'danger'" class="ml-auto">
                {{ databaseStatusParsed?.connected ? '正常' : '异常' }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="连接状态">
              <el-tag size="small" :type="databaseStatusParsed?.connected ? 'success' : 'danger'">
                {{ databaseStatusParsed?.connected ? '已连接' : '未连接' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="响应时间">
              <span :class="databaseStatusParsed?.latency ? 'text-success' : ''">
                {{ databaseStatusParsed?.latency || '-' }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
          <el-divider content-position="left">数据统计</el-divider>
          <el-row :gutter="12">
            <el-col :span="6" v-for="(item, key) in databaseCounts" :key="key">
              <div class="stat-item">
                <div class="stat-value">{{ item.value }}</div>
                <div class="stat-label">{{ item.label }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 缓存状态 -->
    <el-card shadow="hover" class="mb-4">
      <template #header>
        <div class="card-header">
          <el-icon><Tickets /></el-icon>
          <span>缓存服务</span>
        </div>
      </template>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="8">
          <div class="cache-status-item">
            <el-icon :size="32" :class="cacheStatusParsed?.enabled ? 'text-success' : 'text-muted'">
              <component :is="cacheStatusParsed?.enabled ? 'CircleCheckFilled' : 'CircleCloseFilled'" />
            </el-icon>
            <div class="cache-status-content">
              <div class="cache-status-label">启用状态</div>
              <div class="cache-status-value">{{ cacheStatusParsed?.enabled ? '已启用' : '未启用' }}</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="cache-status-item">
            <el-icon :size="32" class="text-primary">
              <Box />
            </el-icon>
            <div class="cache-status-content">
              <div class="cache-status-label">缓存类型</div>
              <div class="cache-status-value">
                <el-tag size="small">{{ cacheStatusParsed?.type?.toUpperCase() || '-' }}</el-tag>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="cache-status-item">
            <el-icon :size="32" :class="cacheStatusParsed?.working ? 'text-success' : 'text-danger'">
              <component :is="cacheStatusParsed?.working ? 'CircleCheckFilled' : 'CircleCloseFilled'" />
            </el-icon>
            <div class="cache-status-content">
              <div class="cache-status-label">工作状态</div>
              <div class="cache-status-value">{{ cacheStatusParsed?.working ? '正常运行' : '异常' }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 系统资源 -->
    <div class="section-title">
      <el-icon><Monitor /></el-icon>
      <span>系统资源</span>
    </div>

    <el-row :gutter="16" class="mb-4">
      <!-- CPU 状态 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="dashboard-card resource-card">
          <template #header>
            <div class="card-header">
              <el-icon><Cpu /></el-icon>
              <span>CPU</span>
              <span class="ml-auto text-muted">{{ systemResourcesParsed?.cpu?.usage || '0%' }}</span>
            </div>
          </template>
          <el-progress
            :percentage="parseFloat(systemResourcesParsed?.cpu?.usage || 0)"
            :color="getProgressColor(systemResourcesParsed?.cpu?.usage)"
            :stroke-width="20"
          />
          <el-divider />
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="CPU 核心">{{ systemResourcesParsed?.cpu?.count || '-' }}</el-descriptions-item>
            <el-descriptions-item label="1分钟负载">{{ systemResourcesParsed?.cpu?.load_1m || '-' }}</el-descriptions-item>
            <el-descriptions-item label="5分钟负载">{{ systemResourcesParsed?.cpu?.load_5m || '-' }}</el-descriptions-item>
            <el-descriptions-item label="15分钟负载" :span="3">{{ systemResourcesParsed?.cpu?.load_15m || '-' }}</el-descriptions-item>
            <el-descriptions-item label="CPU 型号" :span="3">
              <span class="text-truncate">{{ systemResourcesParsed?.cpu?.model || '-' }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 内存状态 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="dashboard-card resource-card">
          <template #header>
            <div class="card-header">
              <el-icon><Monitor /></el-icon>
              <span>内存</span>
              <span class="ml-auto text-muted">{{ systemResourcesParsed?.memory?.system_usage || '0%' }}</span>
            </div>
          </template>
          <el-progress
            :percentage="parseFloat(systemResourcesParsed?.memory?.system_usage || 0)"
            :color="getProgressColor(systemResourcesParsed?.memory?.system_usage)"
            :stroke-width="20"
          />
          <el-divider />
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="总量">{{ systemResourcesParsed?.memory?.system_total || '-' }}</el-descriptions-item>
            <el-descriptions-item label="已用">{{ systemResourcesParsed?.memory?.system_used || '-' }}</el-descriptions-item>
            <el-descriptions-item label="可用">{{ systemResourcesParsed?.memory?.system_free || '-' }}</el-descriptions-item>
            <el-descriptions-item label="已分配">{{ systemResourcesParsed?.memory?.alloc || '-' }}</el-descriptions-item>
            <el-descriptions-item label="总分配">{{ systemResourcesParsed?.memory?.total_alloc || '-' }}</el-descriptions-item>
            <el-descriptions-item label="GC次数">{{ systemResourcesParsed?.memory?.gc_count || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mb-4">
      <!-- 网络状态 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <el-icon><Link /></el-icon>
              <span>网络</span>
            </div>
          </template>
          <el-row :gutter="12">
            <el-col :span="12" v-for="(item, key) in networkStats" :key="key">
              <div class="mini-stat-item">
                <div class="mini-stat-label">{{ item.label }}</div>
                <div class="mini-stat-value">{{ item.value || '-' }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <!-- 磁盘状态 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="dashboard-card resource-card">
          <template #header>
            <div class="card-header">
              <el-icon><FolderOpened /></el-icon>
              <span>磁盘</span>
              <span class="ml-auto text-muted">{{ systemResourcesParsed?.disk?.usage || '0%' }}</span>
            </div>
          </template>
          <el-progress
            :percentage="parseFloat(systemResourcesParsed?.disk?.usage || 0)"
            :color="getProgressColor(systemResourcesParsed?.disk?.usage)"
            :stroke-width="20"
          />
          <el-divider />
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="总量">{{ systemResourcesParsed?.disk?.total || '-' }}</el-descriptions-item>
            <el-descriptions-item label="已用">{{ systemResourcesParsed?.disk?.used || '-' }}</el-descriptions-item>
            <el-descriptions-item label="可用">{{ systemResourcesParsed?.disk?.free || '-' }}</el-descriptions-item>
            <el-descriptions-item label="文件系统">{{ systemResourcesParsed?.disk?.fs_type || '-' }}</el-descriptions-item>
            <el-descriptions-item label="IO延迟">{{ systemResourcesParsed?.disk?.io_latency || '-' }}</el-descriptions-item>
            <el-descriptions-item label="读写总量">
              {{ systemResourcesParsed?.disk?.read || '-' }} / {{ systemResourcesParsed?.disk?.write || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统信息 -->
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Platform /></el-icon>
          <span>系统信息</span>
        </div>
      </template>
      <el-descriptions :column="4" border size="small">
        <el-descriptions-item label="操作系统">{{ systemResourcesParsed?.system?.os || '-' }}</el-descriptions-item>
        <el-descriptions-item label="系统版本">{{ systemResourcesParsed?.system?.os_version || '-' }}</el-descriptions-item>
        <el-descriptions-item label="内核版本">{{ systemResourcesParsed?.system?.kernel || '-' }}</el-descriptions-item>
        <el-descriptions-item label="启动时间">{{ systemResourcesParsed?.system?.boot_time || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import socket from '{src}/utils/socket'

// 连接状态
const connected = ref(false)
const onlineCount = ref(0)
const refreshRate = ref('0')
const systemStatus = ref('healthy')

// 解析后的数据
const systemInfoParsed = ref({})
const databaseStatusParsed = ref({})
const cacheStatusParsed = ref({})
const systemResourcesParsed = ref({})

let lastUpdateTime = 0

// 计算属性
const systemHealth = computed(() => {
  const usage = parseFloat(systemResourcesParsed.value?.cpu?.usage || 0)
  const memory = parseFloat(systemResourcesParsed.value?.memory?.system_usage || 0)
  const disk = parseFloat(systemResourcesParsed.value?.disk?.usage || 0)

  if (usage >= 90 || memory >= 90 || disk >= 95) return 'status-danger'
  if (usage >= 70 || memory >= 70 || disk >= 80) return 'status-warning'
  return 'status-success'
})

const systemHealthText = computed(() => {
  const map = {
    'status-success': '正常运行',
    'status-warning': '负载较高',
    'status-danger': '资源紧张'
  }
  return map[systemHealth.value] || '未知'
})

const databaseCounts = computed(() => {
  const counts = databaseStatusParsed.value?.counts || {}
  return [
    { label: '用户', value: counts.users || 0 },
    { label: '文章', value: counts.articles || 0 },
    { label: '评论', value: counts.comments || 0 },
    { label: '页面', value: counts.pages || 0 },
    { label: '标签', value: counts.tags || 0 },
    { label: '友链', value: counts.links || 0 }
  ]
})

const networkStats = computed(() => {
  const net = systemResourcesParsed.value?.network || {}
  return [
    { label: '上行速率', value: net.up || '-' },
    { label: '下行速率', value: net.down || '-' },
    { label: '总发送量', value: net.total_sent || '-' },
    { label: '总接收量', value: net.total_received || '-' },
    { label: '发送包数', value: net.packets_sent || '-' },
    { label: '接收包数', value: net.packets_recv || '-' }
  ]
})

// 获取进度条颜色
const getProgressColor = (value) => {
  const num = parseFloat(value || 0)
  if (num < 50) return '#67c23a'
  if (num < 80) return '#e6a23c'
  return '#f56c6c'
}

// 处理状态消息
const handleStatus = (content) => {
  console.log('处理状态消息:', content)

  // 检查是否是在线状态消息
  if (content.online_count !== undefined) {
    onlineCount.value = content.online_count
    return
  }

  if (content.online_users !== undefined) {
    onlineCount.value = Array.isArray(content.online_users) ? content.online_users.length : 0
    return
  }

  // 检查是否是系统状态消息（包含 info, database, cache, resource 字段）
  if (content.info || content.database || content.cache || content.resource) {
    updateSystemStatus(content)
    return
  }

  // 如果 content 本身是嵌套的 content（某些服务端返回格式）
  if (content.content && (content.content.info || content.content.database)) {
    if (content.content.online_count !== undefined) {
      onlineCount.value = content.content.online_count
    }
    updateSystemStatus(content.content)
    return
  }
}

// 更新系统状态
const updateSystemStatus = (content) => {
  try {
    systemInfoParsed.value = content.info || {}
    databaseStatusParsed.value = content.database || {}
    cacheStatusParsed.value = content.cache || {}
    systemResourcesParsed.value = content.resource || {}

    const now = Date.now() / 1000
    if (lastUpdateTime > 0) {
      refreshRate.value = (now - lastUpdateTime).toFixed(1)
    }
    lastUpdateTime = now
  } catch (error) {
    console.error('更新状态失败:', error)
  }
}

// 初始化 Socket 连接
const initSocket = () => {
  socket.connect()

  socket.on('open', () => {
    connected.value = true
    console.log('WebSocket 连接已建立')
  })

  socket.on('connect', (data) => {
    console.log('连接成功，客户端ID:', data?.id)
  })

  socket.on('status', handleStatus)

  socket.on('broadcast', (data) => {
    ElMessage.info(data?.content?.message || '收到广播消息')
  })

  socket.on('single', (data) => {
    ElMessage.info(data?.content?.message || '收到单播消息')
  })

  socket.on('private', (data) => {
    ElMessage.success(`收到私聊: ${data?.content?.message || ''}`)
  })

  socket.on('close', () => {
    connected.value = false
    console.log('WebSocket 连接已关闭')
  })

  socket.on('error', (error) => {
    console.error('WebSocket 错误:', error)
  })

  if (socket.isConnected()) {
    connected.value = true
  }
}

// 手动重连
const reconnect = () => {
  socket.close()
  initSocket()
}

onMounted(() => {
  initSocket()
})

onBeforeUnmount(() => {
  socket.close()
})
</script>

<style lang="scss" scoped>
// 基础间距变量
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 12px;
$spacing-lg: 16px;
$spacing-xl: 24px;

.mb-4 {
  margin-bottom: $spacing-lg;
}

.section-title {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: $spacing-md;
  padding-left: $spacing-xs;
}

// 状态栏
.status-bar {
  margin-bottom: $spacing-xl;
}

.status-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg;
  border-radius: 8px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  margin-bottom: $spacing-md;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &.status-success {
    background: linear-gradient(135deg, #67c23a15 0%, #67c23a08 100%);
    border-color: #67c23a40;
    .status-icon { color: #67c23a; }
  }

  &.status-danger {
    background: linear-gradient(135deg, #f56c6c15 0%, #f56c6c08 100%);
    border-color: #f56c6c40;
    .status-icon { color: #f56c6c; }
  }

  &.status-warning {
    background: linear-gradient(135deg, #e6a23c15 0%, #e6a23c08 100%);
    border-color: #e6a23c40;
    .status-icon { color: #e6a23c; }
  }

  &.status-primary {
    background: linear-gradient(135deg, #409eff15 0%, #409eff08 100%);
    border-color: #409eff40;
    .status-icon { color: #409eff; }
  }

  &.status-info {
    background: linear-gradient(135deg, #90939915 0%, #90939908 100%);
    border-color: #90939940;
    .status-icon { color: #909399; }
  }
}

.status-icon {
  flex-shrink: 0;
}

.status-content {
  flex: 1;
  min-width: 0;
}

.status-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: $spacing-xs;
}

.status-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.ml-auto {
  margin-left: auto;
}

// 卡片样式
.dashboard-card {
  height: 100%;

  :deep(.el-card__header) {
    padding: $spacing-md $spacing-lg;
    background: var(--el-fill-color-light);
    margin-bottom: $spacing-md;
  }

  :deep(.el-card__body) {
    padding: $spacing-lg;
  }

  :deep(.el-divider--horizontal) {
    margin: $spacing-md 0;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

// 统计项
.stat-item {
  text-align: center;
  padding: $spacing-md $spacing-sm;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  margin-bottom: $spacing-sm;
  transition: all 0.3s;

  &:hover {
    background: var(--el-fill-color);
  }
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-color-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: $spacing-xs;
}

// 缓存状态
.cache-status-item {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  padding: $spacing-lg;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  margin-bottom: $spacing-md;
}

.cache-status-content {
  flex: 1;
}

.cache-status-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: $spacing-xs;
}

.cache-status-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

// 网络统计
.mini-stat-item {
  padding: $spacing-md;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  margin-bottom: $spacing-sm;
}

.mini-stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.mini-stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

// 工具类
.text-success { color: #67c23a; }
.text-danger { color: #f56c6c; }
.text-warning { color: #e6a23c; }
.text-primary { color: #409eff; }
.text-muted { color: var(--el-text-color-secondary); }

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

:deep(.el-progress-bar__outer) {
  border-radius: 10px;
}

:deep(.el-progress-bar__inner) {
  border-radius: 10px;
}
</style>
