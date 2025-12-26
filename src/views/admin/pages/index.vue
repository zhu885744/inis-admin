<template>
  <div class="container-fluid container-box"> 
  <div class="dashboard-container">
    <!-- 页面标题区 -->
    <div class="dashboard-header">
      <h1 class="page-title">控制台</h1>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData">刷新数据</el-button>
        <el-button>导出报告</el-button>
      </div>
    </div>

    <!-- 核心数据概览 -->
    <div class="stats-grid">
      <el-card>
        <div class="stat-info">
          <p class="stat-label">总用户数</p>
          <h3 class="stat-value">{{ totalUsers }}</h3>
          <p class="stat-change positive">今日新增 4</p>
        </div>
      </el-card>

      <el-card>
        <div class="stat-info">
          <p class="stat-label">活跃用户</p>
          <h3 class="stat-value">{{ activeUsers }}</h3>
          <p class="stat-change positive">昨天活跃 21</p>
        </div>
      </el-card>

      <el-card>
        <div class="stat-info">
          <p class="stat-label">文章总量</p>
          <h3 class="stat-value">{{ totalContents }}</h3>
          <p class="stat-change positive">昨天发布 2篇</p>
        </div>
      </el-card>

      <el-card>
        <div class="stat-info">
          <p class="stat-label">系统状态</p>
          <h3 class="stat-value">正常</h3>
          <p class="stat-change positive">响应时间: 8ms</p>
        </div>
      </el-card>
    </div>

    <!-- 图表与数据区域 -->
    <div class="charts-section">
      <el-card>
        <div class="chart-header">
          <h2>已注册用户</h2>
          <el-button text>详情</el-button>
        </div>
        <div class="chart-content">
          <!-- 这里可以放置图表组件 -->
          <div class="placeholder-chart">开发中</div>
        </div>
      </el-card>

      <el-card>
        <div class="chart-header">
          <h2>已发布文章</h2>
          <el-button text>详情</el-button>
        </div>
        <div class="chart-content">
          <!-- 这里可以放置图表组件 -->
          <div class="placeholder-chart">开发中</div>
        </div>
      </el-card>
    </div>

    <!-- 最近动态 -->
    <el-card>
      <h2>最近动态</h2>
      <el-table :data="activities" border>
        <el-table-column prop="time" label="时间" width="180"></el-table-column>
        <el-table-column prop="event" label="事件"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'success' ? 'success' : 'warning'">
              {{ scope.row.status === 'success' ? '完成' : '处理中' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
  </div> 
</template>

<script setup>
import { ref } from 'vue'

// 模拟数据
const totalUsers = ref('51')
const activeUsers = ref('13')
const totalContents = ref('29')
const timeRange = ref('30d')

const activities = ref([
  { time: '2025-12-15 09:23', event: '检测到系统有新版本更新，开始自动更新', status: 'success' },
  { time: '2025-12-15 08:45', event: '系统自动备份完成', status: 'success' },
  { time: '2025-12-15 07:12', event: '用户「不语」登录了系统', status: 'success' },
  { time: '2025-12-14 23:10', event: '内容审核队列处理中', status: 'warning' },
  { time: '2025-12-14 21:56', event: '服务器负载过高预警', status: 'warning' }
])

// 方法
const refreshData = () => {
  // 刷新数据逻辑
}

const changeTimeRange = (val) => {
  // 切换时间范围逻辑
}
</script>