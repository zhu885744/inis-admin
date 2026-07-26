<template>
    <div class="container-box">
        <el-row :gutter="20" style="display: flex;">
            <el-col :span="12" style="display: flex;">
                <el-dropdown v-if="!state.item.tabs.includes('send')" style="margin-right: 8px" trigger="click">
                    <el-button>
                        {{ state.item.sort }}
                        <i-svg name="down"></i-svg>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-item v-on:click="method.order('create_time desc', '最新')">最新</el-dropdown-item>
                        <el-dropdown-item v-on:click="method.order('create_time asc', '最早')">最早</el-dropdown-item>
                    </template>
                </el-dropdown>
                <div style="margin-right: 4px">
                    <el-input v-model="state.item.search" style="width: 200px" autocomplete="new-password" type="text" placeholder="搜索标题 | 内容" />
                </div>
                <el-button v-on:click="method.refresh()">刷新</el-button>
                <el-button v-on:click="method.markAllRead()" v-if="state.item.tabs === 'all'">全部已读</el-button>
                <el-button v-on:click="method.sendToAll()" type="primary">群发消息</el-button>
            </el-col>
            <el-col :span="12" style="display: flex; justify-content: flex-end; z-index: -1">
                <el-button disabled>
                    {{ state.item.title }}
                </el-button>
            </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 12px">
            <el-col :span="24">
                <el-tabs v-model="state.item.tabs" v-on:tab-change="method.change" id="tabs-area">
                    <el-tab-pane name="all">
                        <template #label>
                            <span style="font-weight: bold; font-size: 12px">全部消息</span>
                        </template>
                        <table-message :params="state.params.all" v-model:init="state.tabs.all" v-on:refresh="method.refresh" ref="all"></table-message>
                    </el-tab-pane>

                    <el-tab-pane name="unread">
                        <template #label>
                            <span style="font-weight: bold; font-size: 12px">未读消息</span>
                        </template>
                        <table-message :params="state.params.unread" v-model:init="state.tabs.unread" v-on:refresh="method.refresh" ref="unread"></table-message>
                    </el-tab-pane>

                    <el-tab-pane name="read">
                        <template #label>
                            <span style="font-weight: bold; font-size: 12px">已读消息</span>
                        </template>
                        <table-message :params="state.params.read" v-model:init="state.tabs.read" v-on:refresh="method.refresh" ref="read"></table-message>
                    </el-tab-pane>

                    <el-tab-pane name="remove">
                        <template #label>
                            <span style="font-weight: bold; font-size: 12px">回收站</span>
                        </template>
                        <table-message :params="state.params.remove" v-model:init="state.tabs.remove" v-on:refresh="method.refresh" ref="remove" type="remove"></table-message>
                    </el-tab-pane>
                </el-tabs>
            </el-col>
        </el-row>

        <el-dialog v-model="state.sendDialog" class="custom" draggable :close-on-click-modal="false">
            <template #header>
                <strong class="flex-center">群发系统消息</strong>
            </template>
            <template #default>
                <el-form label-width="100px" label-position="left">
                    <el-form-item label="消息标题">
                        <el-input v-model="state.sendForm.title" placeholder="请输入消息标题"></el-input>
                    </el-form-item>
                    <el-form-item label="消息内容">
                        <el-input v-model="state.sendForm.content" :autosize="{ minRows: 4, maxRows: 8 }" type="textarea" placeholder="请输入消息内容"></el-input>
                    </el-form-item>
                </el-form>
            </template>
            <template #footer>
                <el-button v-on:click="state.sendDialog = false">取 消</el-button>
                <el-button v-on:click="method.doSendToAll()" :loading="state.sendLoading" type="primary">发 送</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import utils from '{src}/utils/utils'
import axios from '{src}/utils/request'
import TableMessage from '{src}/comps/admin/table/message.vue'

const { ctx, proxy } = getCurrentInstance()
const state = reactive({
    item: {
        timer: null,
        title: '消息管理',
        search: null,
        sort: '排序',
        tabs: 'all',
    },
    sendDialog: false,
    sendLoading: false,
    sendForm: {
        title: '',
        content: ''
    },
    params: {
        all: {
            order: 'create_time desc'
        },
        unread: {
            order: 'create_time desc',
            where: [['status', '=', 0]]
        },
        read: {
            order: 'create_time desc',
            where: [['status', '=', 1]]
        },
        remove: {
            order: 'create_time desc',
            onlyTrashed: true
        },
    },
    tabs: {
        all: false,
        unread: false,
        read: false,
        remove: false,
    }
})

const method = {
    order(order = 'create_time asc', sort = '排序') {
        state.item.sort = sort
        for (let item in state.params) state.params[item].order = order
        method.refresh('all', 'unread', 'read', 'remove')
    },
    refresh(...args) {
        let allow = ['all', 'unread', 'read', 'remove']
        if (args.length === 0) args = allow
        else args = args.filter(item => allow.includes(item))
        for (let item of args) proxy.$refs[item]?.init?.()
    },
    change: (name) => state.tabs[name] = true,
    sendToAll: () => {
        state.sendDialog = true
        state.sendForm = {
            title: '',
            content: ''
        }
    },
    doSendToAll: async () => {
        if (utils.is.empty(state.sendForm.title)) return ElMessage.warning('请输入消息标题')
        if (utils.is.empty(state.sendForm.content)) return ElMessage.warning('请输入消息内容')

        state.sendLoading = true
        const { code, msg } = await axios.post('/api/message/send-to-all', {
            title: state.sendForm.title,
            content: state.sendForm.content
        })
        state.sendLoading = false

        if (code === 200) {
            ElMessage.success(msg)
            state.sendDialog = false
            await method.refresh()
        } else {
            ElMessage.error(msg)
        }
    },
    markAllRead: async () => {
        const { code, msg } = await axios.post('/api/message/read')
        
        if (code === 200) {
            ElMessage.success(msg)
            await method.refresh()
        } else {
            ElMessage.error(msg)
        }
    },
}

onMounted(async () => {
    state.tabs.all = true
})

watch(() => state.item.search, (val) => {
    const allow = ['all', 'unread', 'read', 'remove']
    for (let item of allow) {
        if (!utils.is.empty(val)) state.params[item].like = [
            ['title', `%${val}%`],
            ['content', `%${val}%`],
        ]
        else delete state.params[item].like
    }
    clearTimeout(state.item.timer)
    state.item.timer = setTimeout(() => {
        method.refresh(...allow)
    }, globalThis.inis?.lazy_time ?? 500)
})
</script>