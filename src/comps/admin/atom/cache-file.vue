<template>
    <el-card v-loading="state.status.loading" style="margin-bottom: 1rem">
        <template #header>
            <div class="card-header-content">
                <i-svg name="file" color="rgb(var(--assist-color))" size="55px" style="position: absolute; opacity: 0.25; right: 1.5rem"></i-svg>
                <el-tooltip placement="top">
                    <template #content>
                        <strong style="color: var(--el-color-success)">推荐开启，有利于减少数据库和服务器的负担！</strong><br>
                        开启后会对API数据进行缓存，减少重复执行数据库操作以及对数据的运算，<br>
                        从而提高API的响应速度，减少服务器的负担。<br>
                        PS：缓存数据会通过文件的方式存储在服务器的 <code>runtime/cache</code> 目录下。
                    </template>
                    <span style="display: inline-flex; align-items: center">
                        <i-svg name="hint" color="rgb(var(--icon-color))" size="14px"></i-svg>
                        <span style="margin-left: 0.25rem">文件缓存</span>
                    </span>
                </el-tooltip>
            </div>
        </template>
        <template #default>
            <div style="display: flex; align-items: center; justify-content: space-between">
                <el-switch v-model="state.status.active" v-on:change="method.change" :disabled="!state.status.finish"
                           active-text="开启" inactive-text="关闭">
                </el-switch>
                <div style="display: flex; align-items: center; gap: 0.5rem">
                    <el-tag type="success">+20%</el-tag>
                    <span style="color: var(--text-color-secondary)">
                        综合提升，<span v-on:click="method.show()" style="color: var(--text-color); cursor: pointer">点我配置</span>
                    </span>
                </div>
            </div>
        </template>
    </el-card>

    <el-dialog v-model="state.status.dialog" class="custom" draggable :close-on-click-modal="false">
        <template #header>
            <strong class="flex-center">配置 文件 缓存服务</strong>
        </template>
        <template #default>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-form-item label="缓存目录">
                        <el-tooltip content="缓存文件存储到哪个目录下？推荐：runtime/cache" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 4px">缓存目录：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.path" placeholder="缓存目录"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="过期时间（秒）">
                        <el-tooltip content="缓存有效时间，建议2小时，即7200秒，0表示永不过期" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 4px">过期时间（秒）：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.expire"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="前缀">
                        <el-tooltip content="每个Key固定的前缀，推荐：inis_" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">前缀：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.prefix"></el-input>
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
import utils from '{src}/utils/utils.js'
import axios from '{src}/utils/request.js'

const { ctx, proxy } = getCurrentInstance()
const emit  = defineEmits(['refresh'])
const state = reactive({
    struct: {
        open:     false,
        default:  null,
        path:     null,
        prefix:   'inis_',
        expire:   '2 * 60 * 60',
    },
    status: {
        finish: false,
        active: false,
        dialog: false,
        loading: true,
        wait: false,
    },
})

onMounted(async () => {
    await method.init()
})

const method = {
    init: async () => {

        state.status.finish  = false
        state.status.loading = true

        const { code, data } = await axios.get('/api/toml/cache', {
            name: 'file'
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

        const { code, msg } = await axios.put('/api/toml/cache-default', {
            value: 'file', open: value
        })

        if (code === 200) return emit('refresh', 'cache-redis', 'cache-ram')

        state.status.active = !value
        ElMessage.error(msg)
    },
    save: async () => {

        if (utils.is.empty(state.struct.path))   return ElMessage.warning('请填写 缓存目录！')
        if (utils.is.empty(state.struct.expire)) return ElMessage.warning('请填写 过期时间！')
        if (utils.is.empty(state.struct.prefix)) return ElMessage.warning('请选择 缓存前缀！')

        state.status.wait   = true

        const { code, msg } = await axios.put('/api/toml/cache-file', state.struct)

        state.status.wait   = false

        if (code !== 200) return ElMessage.error('保存失败：' + msg)
        
        ElMessage.success('保存成功')
        state.status.dialog = false
    },
}

watch(() => state.struct, () => {
    state.status.active = state.struct.default === 'file' && state.struct.open
}, { deep: true })

// 将子组件方法暴露给父组件
defineExpose({
    init: method.init,
})
</script>