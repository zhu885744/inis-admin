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
          <p class="stat-label">文章总数</p>
          <h3 class="stat-value">{{ totalContents }}</h3>
          <p class="stat-change positive">今日新增 0</p>
        </div>
      </el-card>

      <el-card>
        <div class="stat-info">
          <p class="stat-label">总评论数</p>
          <h3 class="stat-value">{{ activeUsers }}</h3>
          <p class="stat-change positive">昨天新增 0</p>
        </div>
      </el-card>

      <el-card>
        <div class="stat-info">
          <p class="stat-label">用户总数</p>
          <h3 class="stat-value">{{ totalUsers }}</h3>
          <p class="stat-change positive">昨天新增 0个</p>
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
  </div>
  </div> 
</template>

<script setup>
import { ref } from 'vue'

// 模拟数据
const totalUsers = ref('0')
const activeUsers = ref('0')
const totalContents = ref('0')

// 方法
const refreshData = () => {
  // 刷新数据逻辑
}

const changeTimeRange = (val) => {
  // 切换时间范围逻辑
}
</script>