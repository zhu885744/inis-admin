<template>
    <div class="container-fluid container-box">
        <div class="row d-none d-lg-flex">
            <div class="col-lg-6 d-flex">
                <el-dropdown v-if="!state.item.tabs.includes('setting')" class="custom mimic me-2" trigger="click">
                    <span class="el-dropdown-link d-flex align-items-center">
                        {{ state.item.sort }}
                        <i-svg name="down"></i-svg>
                    </span>
                    <template #dropdown>
                        <el-dropdown-item v-on:click="method.order('create_time desc', '最新')">最新</el-dropdown-item>
                        <el-dropdown-item v-on:click="method.order('create_time asc', '最早')">最早</el-dropdown-item>
                    </template>
                </el-dropdown>
                <div class="input-group custom-search me-1">
                    <i-svg name="search" color="rgb(var(--icon-color))" size="18px"></i-svg>
                    <input v-model="state.item.search" class="form-control custom search mimic" autocomplete="new-password" type="text" placeholder="名称 | API | 备注 | 请求类型">
                </div>
                <el-button v-on:click="method.refresh()" class="btn btn-auto mx-1 mimic" type="button">刷新</el-button>
                <el-dropdown v-if="!state.item.tabs.includes('setting')" class="custom mimic mx-1" trigger="click">
                    <span class="el-dropdown-link d-flex align-items-center">
                        {{ state.item.type }}
                        <i-svg name="down"></i-svg>
                    </span>
                    <template #dropdown>
                        <el-dropdown-item v-for="(item, index) in state.select.type" :key="index" v-on:click="method.type(item.value, item.label)">
                            {{ item.label }}
                        </el-dropdown-item>
                    </template>
                </el-dropdown>
                <el-button v-on:click="method.add()" v-if="state.item.tabs.includes('all')" class="btn btn-auto ms-1 mimic" type="button">添加</el-button>
            </div>
            <div class="col-lg-6 d-flex justify-content-end" style="z-index: -1">
                <el-button class="btn btn-auto mimic" disabled type="button">
                    {{ state.item.title }}
                </el-button>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-12">
                <el-tabs v-model="state.item.tabs" v-on:tab-change="method.change" id="tabs-area" type="border-card">

                    <el-tab-pane name="all">
                        <template #label>
                            <span class="fw-bolder font-12">全部</span>
                        </template>
                        <table-auth-rules :params="state.params.all" v-model:init="state.tabs.all" v-on:refresh="method.refresh" ref="all"></table-auth-rules>
                    </el-tab-pane>

                    <el-tab-pane name="remove">
                        <template #label>
                            <span class="fw-bolder font-12">回收站</span>
                        </template>
                        <table-auth-rules :params="state.params.remove" v-model:init="state.tabs.remove" v-on:refresh="method.refresh" ref="remove" type="remove"></table-auth-rules>
                    </el-tab-pane>

                    <el-tab-pane name="setting">
                        <template #label>
                            <span class="fw-bolder font-12">设置</span>
                        </template>
                        <div class="row">
                            <div class="col-md-4">
                                <atom-qps ref="qps"></atom-qps>
                            </div>
                            <div class="col-md-4">
                                <atom-page-limit ref="page-limit"></atom-page-limit>
                            </div>
                        </div>
                    </el-tab-pane>

                </el-tabs>
            </div>
        </div>
    </div>
</template>

<script setup>
import utils from '{src}/utils/utils'
import AtomQps from '{src}/comps/admin/atom/qps.vue'
import AtomPageLimit from '{src}/comps/admin/atom/page-limit.vue'
import TableAuthRules from '{src}/comps/admin/table/auth-rules.vue'

const { ctx, proxy } = getCurrentInstance()

const state  = reactive({
    item: {
        timer : null,
        title : '权限规则',
        search: null,
        sort  : '排序',
        type  : '类型',
        tabs  : 'all',
    },
    params: {
        all: {
            order: 'hash asc'
        },
        remove: {
            order: 'hash asc',
            onlyTrashed: true
        },
    },
    select: {
        type: [{ value: 'default', label: '默认' },{ value: 'common', label: '公共' }, { value: 'login', label: '登录' }],
    },
    tabs: {
        all: false,
        remove: false,
    }
})

// 方法
const method = {
    // 设置排序方式
    order(order = 'create_time asc', sort = '排序') {
        state.item.sort = sort
        for (let item in state.params) state.params[item].order = order
        // 指定刷新
        method.refresh('all','remove')
    },
    // 设置规则类型
    type(type = 'default', name = '默认') {
        state.item.type = name
        for (let item in state.params) state.params[item].where = [['type', '=', type]]
        // 指定刷新
        method.refresh('all','remove')
    },
    // 添加
    add() {
        proxy.$refs['all']['show']()
    },
    // 刷新
    refresh(...args) {
        // 允许刷新的参数
        let allow = ['all','remove','qps','page-limit']
        // 如果没有传参则刷新所有
        if (args.length === 0) args = allow
        // 如果传参则过滤不允许的参数
        else args = args.filter(item => allow.includes(item))
        // 批量刷新
        for (let item of args) proxy.$refs[item]['init']()
    },
    // 切换 tab
    change: (name) => state.tabs[name] = true
}

onMounted(async () => {
    state.tabs.all = true
})

watch(() => state.item.search, (val) => {

    const allow = ['all', 'remove']

    for (let item of allow) {
        if (!utils.is.empty(val)) state.params[item].like = [
            ['name', `%${val}%`],
            ['route', `%${val}%`],
            ['method', `${val?.toUpperCase()}`],
            ['remark', `%${val}%`],
        ]
        else delete state.params[item].like
    }

    // 防抖 - 没变化的 500ms 后再刷新
    clearTimeout(state.item.timer)
    state.item.timer = setTimeout(() => method.refresh(...allow), globalThis.inis?.lazy_time ?? 500)
})
</script>