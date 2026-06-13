<template>
    <el-card v-loading="state.status.loading" style="margin-bottom: 1rem">
        <template #header>
            <div class="card-header-content">
                <i-svg name="serve" color="rgb(var(--assist-color))" size="60px" style="position: absolute; right: 1.5rem; opacity: 0.25"></i-svg>
                <el-tooltip placement="top">
                    <template #content>
                        ● 本地存储是指将图片等资源文件存储到服务器本地，然后通过访问服务器的方式获取资源文件<br>
                        ● 本地存储的优点是不花钱，缺点是占用服务器空间和带宽
                    </template>
                    <span style="display: inline-flex; align-items: center">
                        <i-svg name="hint" color="rgb(var(--icon-color))" size="14px"></i-svg>
                        <span style="margin-left: 0.25rem">本地存储</span>
                    </span>
                </el-tooltip>
            </div>
        </template>
        <template #default>
            <div style="display: flex; align-items: center; justify-content: space-between">
                <el-switch v-model="state.status.active" v-on:change="method.change" :disabled="!state.status.finish"
                           active-text="开始" inactive-text="关闭">
                </el-switch>
                <div style="display: flex; align-items: center; gap: 0.5rem">
                    <el-tag type="info">传统</el-tag>
                    <span style="color: var(--el-text-color-secondary)">
                        这个不花钱，<span v-on:click="method.show()" style="color: var(--el-text-color-primary); cursor: pointer">点我配置</span>
                    </span>
                </div>
            </div>
        </template>
    </el-card>

    <el-dialog v-model="state.status.dialog" class="custom" draggable :close-on-click-modal="false">
        <template #header>
            <strong style="display: flex; align-items: center; justify-content: center">配置本地存储</strong>
        </template>
        <template #default>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="域名">
                        <el-tooltip content="自定义存储域名" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">域名：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.domain"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="存储目录">
                        <el-tooltip content="存储在哪个目录下" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">存储目录：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.path" placeholder="如: storage"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
        </template>
        <template #footer>
            <el-button v-on:click="state.status.dialog = false">取 消</el-button>
            <el-button v-on:click="method.save()" :loading="state.status.wait">保 存</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import axios from '{src}/utils/request.js'

const { ctx, proxy } = getCurrentInstance()
const emit  = defineEmits(['refresh'])
const state = reactive({
    struct: {
        default: null,
        domain: null,
        path: 'storage',
    },
    status: {
        active: true,
        finish: false,
        dialog: false,
        loading: true,
        wait: false,
    }
})

onMounted(async () => {
    await method.init()
})

const method = {
    init: async () => {

        state.status.finish  = false
        state.status.loading = true

        const { code, data } = await axios.get('/api/toml/storage', {
            name: 'local'
        })

        state.status.loading = false

        if (code !== 200) return
        state.struct = data

        state.status.finish  = true
    },
    show() {
        if (!state.status.finish) return ElMessage.warning('配置获取失败，无法进行配置！')
        state.status.dialog = true
    },
    change: async value => {

        if (!value) return state.status.active = true

        const { code, msg } = await axios.put('/api/toml/storage-default', {
            value: value ? 'local' : null
        })

        if (code === 200) return emit('refresh')

        state.status.active = !value
        ElMessage.error(msg)
    },
    save: async () => {

        state.status.wait   = true

        const { code, msg } = await axios.put('/api/toml/storage-local', state.struct)

        state.status.wait   = false

        if (code !== 200) return ElMessage.error('保存失败：' + msg)
        
        ElMessage.success('保存成功')
        state.status.dialog = false
    },
}

watch(() => state.struct, () => {
    state.status.active = state.struct.default === 'local'
}, { deep: true })

// 将子组件方法暴露给父组件
defineExpose({
    init: method.init,
})
</script>